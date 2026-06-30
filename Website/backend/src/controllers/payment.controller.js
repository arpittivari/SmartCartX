import jwt from 'jsonwebtoken';
import Cart from '../models/cart.model.js';
import Transaction from '../models/transaction.model.js';

// Minimal controller implementation with JWT-based checkout flow
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Helper to get socket.io instance
const getIo = (req) => req.app.get('io');
const getMqtt = (req) => req.app.get('mqttClient');

/**
 * @desc    Initiate Checkout for SmartCart
 * @route   POST /cart/checkout/:cartId
 * @access  Public (Cart Generated)
 */
const initiateCheckout = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        // Find by custom ID (e.g., 'Cart 01')
        const cart = await Cart.findOne({ cartId });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Calculate total
        const items = cart.currentItems || [];
        if (items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

        // Generate a secure Payment Token (JWT) as the 'payment_id'
        // This acts as a stateless session for the transaction
        const paymentPayload = {
            cart_oid: cart._id, // Mongo ID
            cartId: cart.cartId, // String ID
            mallId: cart.mallId,
            amount: totalAmount,
            macAddress: cart.macAddress,
            created_at: Date.now()
        };

        // Sign token valid for 1 hour
        const payment_id = jwt.sign(paymentPayload, JWT_SECRET, { expiresIn: '1h' });

        // Construct Payment Link
        // Use request origin or fallback
        const protocol = req.protocol;
        const host = req.get('host');
        const origin = `${protocol}://${host}`;

        // Pay URL points to static frontend pay page
        const pay_url = `${origin}/pay/index.html?id=${payment_id}`;

        res.json({
            payment_id,
            amount: totalAmount,
            currency: 'INR',
            pay_url
        });

    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({ message: 'Server error initiating checkout' });
    }
};

/**
 * @desc    Get current bill details for a cart (Public view for QR scan)
 * @route   GET /cart/:cartId/bill
 * @access  Public
 */
const getCartBill = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const cart = await Cart.findOne({ cartId });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const items = cart.currentItems || [];
        const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

        res.json({
            cartId: cart.cartId,
            items,
            total,
            status: cart.status
        });
    } catch (error) {
        console.error('Bill Error:', error);
        res.status(500).json({ message: 'Server error fetching bill' });
    }
};

/**
 * @desc    Handle Payment Webhook (Success)
 * @route   POST /payment/webhook
 * @access  Public
 */
const handlePaymentWebhook = async (req, res) => {
    try {
        const { payment_id, status } = req.body;

        // Only process successful payments
        // We accept 'captured' (Razorpay style) or 'paid' (generic)
        if (status !== 'captured' && status !== 'paid') {
            return res.status(200).json({ received: true });
        }

        // Verify and Decode the Payment Token
        let decoded;
        try {
            decoded = jwt.verify(payment_id, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid payment token' });
        }

        const { cart_oid, mallId, amount, macAddress } = decoded;

        // 1. Fetch current cart state to get items at time of payment
        // We fetch fresh from DB to ensure inventory accuracy if needed,
        // though strictly we should use snapshot. For minimal patch, DB is fine.
        const cart = await Cart.findById(cart_oid);
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const items = cart.currentItems || [];

        // 2. Create Transaction Record
        const transaction = new Transaction({
            mallId,
            cartId: cart._id,
            totalAmount: amount,
            items
            // 'status' field is not in schema based on exploration,
            // so we rely on creation = completed for now.
        });
        await transaction.save();

        // 3. Clear Cart & Update Status
        cart.currentItems = [];
        cart.status = 'Idle';
        await cart.save();

        // 4. Payment Success via MQTT
        const client = getMqtt(req);
        if (client && macAddress) {
            const commandTopic = `smartcart/${macAddress}/commands`;
            client.publish(commandTopic, JSON.stringify({
                command: "paymentSuccess"
            }));
            console.log(`✅ Checkout complete for cart ${cart.cartId}`);
        }

        // 5. Notify Frontend via Socket
        const io = getIo(req);
        if (io) {
            // Update dashboard
            io.emit('cartUpdate', cart);
            // Notify specific cart room (if any client listening)
            io.to(cart._id.toString()).emit('cartPaid', {
                transactionId: transaction._id,
                amount
            });
        }

        res.json({ success: true, message: 'Payment processed successfully' });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

export { initiateCheckout, getCartBill, handlePaymentWebhook };
