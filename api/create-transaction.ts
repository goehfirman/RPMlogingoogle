import midtransClient from 'midtrans-client';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
    console.log('--- Create Transaction Request ---');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Use Server Side Env for Supabase (Service Role)
    const { 
        MIDTRANS_SERVER_KEY, 
        VITE_MIDTRANS_CLIENT_KEY,
        VITE_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    } = process.env;

    if (!MIDTRANS_SERVER_KEY || !VITE_MIDTRANS_CLIENT_KEY) {
        console.error('CRITICAL: Midtrans keys are missing in environment variables!');
        return res.status(500).json({ 
            error: 'Konfigurasi pembayaran (Environment Variables) belum diatur di Vercel.',
            details: 'MIDTRANS_SERVER_KEY or VITE_MIDTRANS_CLIENT_KEY is missing.'
        });
    }

    try {
        const snap = new (midtransClient as any).Snap({
            isProduction: false,
            serverKey: MIDTRANS_SERVER_KEY,
            clientKey: VITE_MIDTRANS_CLIENT_KEY
        });

        const supabase = createClient(VITE_SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

        const { order_id, gross_amount, customer_details, plan_id, user_id } = req.body;
        
        // 1. Record transaction in Supabase first
        const { error: dbError } = await supabase
            .from('transactions')
            .insert({
                order_id,
                user_id,
                amount: gross_amount,
                status: 'pending'
            });

        if (dbError) {
            console.error('Supabase Transaction Recording Error:', dbError);
            return res.status(500).json({ 
                error: 'Gagal mencatat transaksi ke database.',
                details: dbError.message 
            });
        }

        console.log('Order ID recorded in DB:', order_id);
        console.log('Order ID:', order_id);
        console.log('Amount:', gross_amount);

        const parameter = {
            transaction_details: {
                order_id,
                gross_amount
            },
            customer_details,
            enabled_payments: [
                "credit_card",
                "bank_transfer",
                "gopay",
                "shopeepay",
                "qris",
                "indomaret",
                "alfamart"
            ],
            credit_card: {
                secure: true
            },
            metadata: {
                plan_id
            }
        };

        const transaction = await snap.createTransaction(parameter);
        console.log('Transaction Created:', transaction.token);
        return res.status(200).json(transaction);
    } catch (error: any) {
        console.error('Midtrans API Error:', error);
        return res.status(500).json({ 
            error: 'Gagal menghubungi Midtrans.',
            details: error.message 
        });
    }
}

