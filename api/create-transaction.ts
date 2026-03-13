const midtransClient = require('midtrans-client');

// Initialize Midtrans Snap client
let snap = new midtransClient.Snap({
    isProduction: false, // Set to true for production
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { order_id, gross_amount, customer_details, plan_id } = req.body;

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
        return res.status(200).json(transaction);
    } catch (error: any) {
        console.error('Midtrans Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
