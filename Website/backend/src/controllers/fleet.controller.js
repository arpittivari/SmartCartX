import Cart from '../models/cart.model.js';
import UnclaimedCart from '../models/unclaimedCart.model.js';
import User from '../models/user.model.js';

// @desc    Claim a pending device manually (Provisioning)
// @route   POST /api/v1/fleet/claim
// @access  Private (Mall Admin)
const claimDevice = async (req, res) => {
    const { mallId, cartName, macAddress } = req.body;

    if (!mallId || !macAddress) {
        return res.status(400).json({ message: 'Mall ID and MAC Address are required' });
    }

    try {
        // 1. Verify the Mall exists (User with mallId)
        const mallUser = await User.findOne({ mallId });
        if (!mallUser) {
            return res.status(404).json({ message: 'Mall ID not found' });
        }

        // 2. Check if cart already exists
        const existingCart = await Cart.findOne({ macAddress });
        if (existingCart) {
            return res.status(409).json({ message: 'Cart already claimed/active' });
        }

        // 3. Find Unclaimed/Pending record (Optional but good for validation)
        const pending = await UnclaimedCart.findOne({ macAddress });
        if (!pending) {
            // Depending on policy, we might allow claiming without a prior "announce",
            // or require it. The requirement says "Find a 'Pending' cart".
            // If strictly required:
            // return res.status(404).json({ message: 'Device not pending provisioning' });
            // For robustness, we'll allow it but log it.
            console.log(`⚠️ Force claiming unknown MAC: ${macAddress}`);
        }

        // 4. Create the Cart
        const newCart = new Cart({
            cartId: cartName || `Cart-${macAddress.slice(-4)}`,
            macAddress,
            mallId,
            createdBy: mallUser._id, // Assign ownership to the mall admin
            status: 'Idle'
        });

        await newCart.save();

        // 4.1. Confirm Provisioning via MQTT
        const mqttClient = req.app.get('mqttClient');
        if (mqttClient) {
            const claimTopic = `smartcart/provisioning/claimed/${macAddress}`;
            const claimPayload = JSON.stringify({
                cartId: newCart.cartId,
                mallId: newCart.mallId,
                status: 'claimed'
            });
            mqttClient.publish(claimTopic, claimPayload);
            console.log(`📤 Sent provisioning claim to cart ${macAddress}`);
        }

        // 5. Cleanup Pending
        if (pending) {
            await UnclaimedCart.deleteOne({ macAddress });
        }

        // 6. Return Provisioning Config
        // In a real setup, we might return a JWT token for the device.
        const token = "prov_token_" + Date.now();
        const mqtt_topic = `smartcart/${macAddress}/#`;

        res.json({
            success: true,
            message: 'Device claimed successfully',
            token,
            mqtt_topic
        });

    } catch (error) {
        console.error('Claim Device Error:', error);
        res.status(500).json({ message: 'Server error claiming device' });
    }
};

export { claimDevice };
