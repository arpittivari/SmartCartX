import Cart from '../models/cart.model.js';
import UnclaimedCart from '../models/unclaimedCart.model.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import emailService from '../services/email.service.js';

/**
 * @desc    Claims a new cart and registers it to the logged-in admin
 * @route   POST /api/carts
 * @access  Private
 */
const registerCart = async (req, res) => {
  const { macAddress } = req.body;
  // Note: We ignore the provided cartId and auto-generate one to ensure simplicity and consistency.

  if (!macAddress) {
    return res.status(400).json({ message: 'MAC Address is required.' });
  }

  try {
    // Auto-generate cart name: "Cart <Number>"
    const count = await Cart.countDocuments({ mallId: req.user.mallId });
    const cartId = `Cart ${(count + 1).toString().padStart(2, '0')}`;

    const newCart = new Cart({
      cartId, // e.g. "Cart 01"
      macAddress,
      // We no longer generate unique credentials.
      // The cart uses its MAC address for communication.
      mallId: req.user.mallId,
      createdBy: req.user._id,
    });

    const savedCart = await newCart.save();

    const client = req.app.get('mqttClient');
    if (client) {
        const claimedTopic = `smartcart/provisioning/claimed/${macAddress}`;
        
        // Send simple confirmation
        client.publish(claimedTopic, JSON.stringify({
          status: "claimed",
          cartId: cartId,
          mallId: req.user.mallId
        }));
        
        console.log(`📤 PUSHED 'claimed' confirmation to waiting cart on topic: ${claimedTopic}`);
    }

    // Clean up the unclaimed cart record if it exists
    await UnclaimedCart.deleteOne({ macAddress });

    res.status(201).json(savedCart);

  } catch (error) {
    console.error('Error registering cart:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A cart with this MAC address already exists.' });
    }
    res.status(500).json({ message: 'Server error while registering cart.' });
  }
}

/**
 * @desc    Get all carts for the currently logged-in admin
 * @route   GET /api/carts
 * @access  Private
 */
const getAdminCarts = async (req, res) => {
  try {
    const carts = await Cart.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(carts);
  } catch (error) {
    console.error('Error fetching carts:', error);
    res.status(500).json({ message: 'Server error while fetching carts.' });
  }
};

/**
 * @desc    Delete a cart owned by the logged-in admin
 * @route   DELETE /api/carts/:id
 * @access  Private
 */
const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }
    if (cart.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this cart.' });
    }
    await Cart.deleteOne({ _id: req.params.id });
    res.json({ message: 'Cart removed successfully.' });
  } catch (error) {
    console.error('Error deleting cart:', error);
    res.status(500).json({ message: 'Server error while deleting cart.' });
  }
};

/**
 * @desc    Get transaction history for a specific cart
 * @route   GET /api/carts/:id/history
 * @access  Private
 */
const getCartHistory = async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.id);
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Ensure the cart belongs to the user
        if (cart.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Fetch transactions for this cart using the Transaction model
        const history = await Transaction.find({ cartId: cart._id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        console.error('Error fetching cart history:', error);
        res.status(500).json({ message: 'Server error fetching history' });
    }
};

/**
 * @desc    Process a cash payment for a cart
 * @route   POST /api/carts/:id/cash-payment
 * @access  Private
 */
const processCashPayment = async (req, res) => {
    const { userEmail, userPhone } = req.body; // Extract user details if provided

    try {
        const cart = await Cart.findById(req.params.id);
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        if (cart.createdBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!cart.currentItems || cart.currentItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const totalAmount = cart.currentItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

        // 1. Record the Transaction
        const transaction = new Transaction({
            mallId: req.user.mallId,
            cartId: cart._id,
            totalAmount,
            items: cart.currentItems,
            paymentMethod: 'CASH'
        });
        await transaction.save();

        // 2. Handle User History & Loyalty
        if (userEmail || userPhone) {
            try {
                // Securely construct the query conditions
                const conditions = [];
                if (userEmail) conditions.push({ email: userEmail });
                if (userPhone) conditions.push({ phone: userPhone });

                let shopper = null;
                if (conditions.length > 0) {
                    shopper = await User.findOne({
                        $or: conditions,
                        role: 'shopper'
                    });
                }

                if (!shopper) {
                    shopper = new User({
                        role: 'shopper',
                        email: userEmail || undefined,
                        phone: userPhone || undefined,
                        // No password for now, maybe add later if they want to claim account
                        mallId: undefined,
                        companyId: undefined
                    });
                } else {
                    // Update missing fields if provided
                     if (userEmail && !shopper.email) shopper.email = userEmail;
                     if (userPhone && !shopper.phone) shopper.phone = userPhone;
                }

                // Add to order history
                shopper.order_history.push({
                    transaction_id: transaction._id,
                    total_amount: totalAmount,
                    items: cart.currentItems,
                    date: new Date()
                });

                // Update loyalty points (e.g., 1 point per 10 currency units)
                shopper.loyalty_points += Math.floor(totalAmount / 10);

                // Update preferences (simple average spend calculation)
                const currentAvg = shopper.preferences.avg_spend || 0;
                const historyLen = shopper.order_history.length;
                shopper.preferences.avg_spend = ((currentAvg * (historyLen - 1)) + totalAmount) / historyLen;

                await shopper.save();

                // 3. Send Email Receipt
                if (shopper.email) {
                    // Fire and forget - don't await to avoid blocking response
                    emailService.sendReceipt(shopper.email, {
                        items: cart.currentItems,
                        total: totalAmount,
                        mallName: req.user.mallName || req.user.mallId, // Use mall name from admin/cart owner
                        date: new Date()
                    });
                }

            } catch (err) {
                console.error("Error processing user history/email:", err.message);
                // Non-critical, continue with checkout
            }
        }

        // 4. Unlock the Cart via MQTT
        const client = req.app.get('mqttClient');
        if (client && cart.macAddress) {
            const commandTopic = `smartcart/${cart.macAddress}/commands`;
            client.publish(commandTopic, JSON.stringify({
                command: "unlock",
                reason: "cash_payment_success"
            }));
            console.log(`📤 Cash Payment: Sent unlock command to ${cart.macAddress}`);
        }

        // 5. Clear Cart State
        cart.currentItems = [];
        cart.status = 'Idle';
        await cart.save();

        // 6. Notify Frontend via Socket (optional as status change does this too)
        const io = req.app.get('socketio');
        if (io) {
             io.emit('cartUpdate', cart);
             io.to(cart._id.toString()).emit('cartStateUpdate', cart);
        }

        res.json({
            success: true,
            message: 'Bill sent to email!', // As requested in the prompt
            transaction
        });

    } catch (error) {
        console.error('Error processing cash payment:', error);
        res.status(500).json({ message: 'Server error processing payment' });
    }
};

/**
 * @desc    Handle generic cart events (public endpoint)
 * @route   POST /cart/event
 * @access  Public
 */
const handleCartEvent = async (req, res) => {
    console.log('🛒 Cart Event Received:', req.body);
    res.json({ status: 'ok', received: true });
};

export { registerCart, getAdminCarts, deleteCart, getCartHistory, processCashPayment, handleCartEvent };
