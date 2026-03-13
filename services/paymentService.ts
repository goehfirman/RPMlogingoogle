export const initializeSnap = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

export const createPaymentTransaction = async (orderId: string, amount: number, customerEmail: string, planId: string) => {
  const response = await fetch('/api/create-transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: orderId,
      gross_amount: amount,
      customer_details: {
        email: customerEmail,
      },
      plan_id: planId
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create transaction');
  }

  return await response.json();
};
