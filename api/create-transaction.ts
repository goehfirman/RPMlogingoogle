import midtransClient from 'midtrans-client';

export default async function handler(req: any, res: any) {
    console.log('--- Create Transaction Request ---');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { MIDTRANS_SERVER_KEY, VITE_MIDTRANS_CLIENT_KEY } = process.env;

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

        const { order_id, gross_amount, customer_details, plan_id } = req.body;
        console.log('Order ID:', order_id);
        console.log('Amount:', gross_amount);

        const parameter = {
            transaction_details: {
                order_id,
                gross_amount
            },
            customer_details,
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

