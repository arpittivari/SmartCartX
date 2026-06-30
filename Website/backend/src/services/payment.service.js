// Placeholder for payment service
export const createPaymentLink = async (amount, currency = 'USD') => {
    // Basic stub returning a mock link or logic
    // In production this would interface with Razorpay/Stripe
    return `http://localhost:5000/pay/simulator.html?amount=${amount}`;
};
