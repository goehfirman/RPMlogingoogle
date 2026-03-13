import midtransClient from 'midtrans-client';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
    console.log('--- Midtrans Webhook Received ---');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
        MIDTRANS_SERVER_KEY, 
        VITE_MIDTRANS_CLIENT_KEY,
        VITE_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    } = process.env;

    const snap = new (midtransClient as any).Snap({
        isProduction: false,
        serverKey: MIDTRANS_SERVER_KEY,
        clientKey: VITE_MIDTRANS_CLIENT_KEY
    });

    const supabase = createClient(VITE_SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

    try {
        const notification = req.body;
        console.log('Notification Status:', notification.transaction_status);
        console.log('Order ID:', notification.order_id);

        const statusResponse = await snap.transaction.notification(notification);
        
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        const planId = statusResponse.metadata?.plan_id; // Keep planId extraction

        console.log(`Transaction ID: ${statusResponse.transaction_id}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`);

        // Original logic for paymentStatus and expiryDate calculation
        let paymentStatus = 'pending';
        let expiryDate: Date | null = null;

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            const isAccepted = transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept');
            
            if (isAccepted) {
                paymentStatus = 'success';
                
                // Calculate Expiry
                const now = new Date();
                if (planId === 'monthly') {
                    expiryDate = new Date(now.setMonth(now.getMonth() + 1));
                } else if (planId === 'quarterly') {
                    expiryDate = new Date(now.setMonth(now.getMonth() + 3));
                } else if (planId === 'lifetime') {
                    expiryDate = new Date('2099-12-31T23:59:59Z');
                }
            } else if (fraudStatus === 'challenge') {
                paymentStatus = 'challenge';
            }
        } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
            paymentStatus = 'failure';
        }

        // Update database in Supabase
        const updateData: any = { 
            status: paymentStatus, 
            raw_notification: statusResponse 
        };

        if (paymentStatus === 'success') {
            // Get user_id from transactions table first
            const { data: txData } = await supabase
                .from('transactions')
                .select('user_id')
                .eq('order_id', orderId)
                .single();

            if (txData?.user_id) {
                console.log('Updating profile for user:', txData.user_id);
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ 
                        is_premium: true, 
                        subscription_until: expiryDate,
                        plan_type: planId,
                        updated_at: new Date()
                    })
                    .eq('id', txData.user_id);
                
                if (profileError) {
                    console.error('Failed to update profile:', profileError);
                } else {
                    console.log('Profile successfully updated to PREMIUM');
                }
            } else {
                console.error('No matching user_id found for order_id:', orderId);
            }
        }

        const { error } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('order_id', orderId);

        if (error) {
            console.error('Database Update Error:', error);
            return res.status(500).json({ error: 'Failed to update transaction status' });
        }

        return res.status(200).send('OK');
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
