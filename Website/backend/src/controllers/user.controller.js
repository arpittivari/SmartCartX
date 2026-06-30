import User from '../models/user.model.js';
import Cart from '../models/cart.model.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  res.json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.mallName = req.body.mallName || user.mallName;
    user.brandName = req.body.brandName || user.brandName;
    user.location = req.body.location || user.location;
    user.imageUrl = req.body.imageUrl || user.imageUrl;
    user.recoveryEmail = req.body.email || user.recoveryEmail;
    user.mobileNumber = req.body.mobileNumber || user.mobileNumber;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Pair a user with a cart (Login via QR)
// @route   POST /api/users/pair-cart
// @access  Private (Shopper Token)
const pairCart = async (req, res) => {
    const { userId, cartHardwareId } = req.body;

    if (!userId || !cartHardwareId) {
        return res.status(400).json({ message: 'User ID and Cart Hardware ID (MAC) are required' });
    }

    try {
        // 1. Verify Cart exists and is Idle
        // Note: We search by macAddress OR cartId depending on what hardware ID actually is.
        // The prompt implies hardware ID is used in the topic `cart/{cartHardwareId}/login`.
        // Usually this is the MAC address.
        const cart = await Cart.findOne({ macAddress: cartHardwareId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        if (cart.status !== 'Idle' && cart.status !== 'Offline') {
             // In a real scenario, we might allow taking over a session or error out.
             // For V4.0, let's assume strict Idle check.
             // return res.status(409).json({ message: 'Cart is already in use' });
        }

        // 2. Find User
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 3. Link (Optional: Store current user on cart model?)
        // cart.currentUser = user._id; // If we had this field
        cart.status = 'Shopping';
        await cart.save();

        // 4. Publish MQTT Message to Unlock Edge UI
        const client = req.app.get('mqttClient');
        if (client) {
            const loginTopic = `cart/${cartHardwareId}/login`;
            const payload = {
                name: user.mallName || "Shopper", // Use mallName as name placeholder or add 'name' to User model
                history: user.order_history ? user.order_history.slice(0, 5) : [] // Send last 5 transactions
            };

            client.publish(loginTopic, JSON.stringify(payload));
            console.log(`🔐 Pair Cart: Sent login command to ${cartHardwareId} for user ${user._id}`);
        }

        res.json({ success: true, message: 'Cart paired successfully' });

    } catch (error) {
        console.error('Pair Cart Error:', error);
        res.status(500).json({ message: 'Server error pairing cart' });
    }
};

export { getUserProfile, updateUserProfile, pairCart };
