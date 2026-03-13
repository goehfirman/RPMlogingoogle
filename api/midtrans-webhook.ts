const midtransClient = require('midtrans-client');
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '' // Use service role for backend
);

let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const notificationJson = req.body;
        const statusResponse = await snap.transaction.notification(notificationJson);

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        const planId = statusResponse.metadata?.plan_id;

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Plan: ${planId}`);

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
                await supabase
                    .from('profiles')
                    .update({ 
                        is_premium: true, 
                        subscription_until: expiryDate,
                        plan_type: planId
                    })
                    .eq('id', txData.user_id);
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
