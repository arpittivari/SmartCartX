import mqtt from 'mqtt';
import config from '../config/index.js';
import Cart from '../models/cart.model.js';
import UnclaimedCart from '../models/unclaimedCart.model.js';
import Transaction from '../models/transaction.model.js';
import Product from '../models/product.model.js';
import deepseekService from './deepseek.service.js';

/**
 * A background task that runs periodically to detect and mark stale carts as 'Offline'.
 * @param {object} io The global Socket.IO instance.
 */
const checkStaleCarts = (io) => {
  console.log('⏰ Starting heartbeat monitor to check for stale carts...');
  
  setInterval(async () => {
    const STALE_TIMEOUT = 65 * 1000; // 65 seconds
    const staleTime = new Date(Date.now() - STALE_TIMEOUT);
    try {
      const filter = {
        lastSeen: { $lt: staleTime },
        status: { $ne: 'Offline' }
      };

      const staleCarts = await Cart.find(filter);

      if (staleCarts.length > 0) {
        const staleCartIds = staleCarts.map(cart => cart._id);

        await Cart.updateMany(
          { _id: { $in: staleCartIds } },
          { $set: { status: 'Offline' } }
        );

        console.log(`   - ❗ Found ${staleCarts.length} stale cart(s). Marked as Offline.`);
        for (const cart of staleCarts) {
          cart.status = 'Offline';
          // Broadcast to dashboard
          io.emit('cartUpdate', cart);
          // Also emit to the specific room so Live View updates
          io.to(cart._id.toString()).emit('cartUpdate', cart); 
        }
      }
    } catch (error) {
      console.error('Error in heartbeat monitor:', error);
    }
  }, 30 * 1000); 
};

const connectMqttClient = (io) => { 
  let brokerUrl = config.mqtt.url;

  // 1. Fallback Logic: Switch to Public Broker if Localhost/Empty
  if (!brokerUrl || brokerUrl.includes('localhost') || brokerUrl.includes('127.0.0.1')) {
      console.warn('⚠️ Local MQTT not usable in Render. Switching to public broker.');
      brokerUrl = 'mqtt://broker.hivemq.com:1883';

      // Clear auth for public broker (HiveMQ public doesn't use auth)
      config.mqtt.username = undefined;
      config.mqtt.password = undefined;
  }

  console.log(`📡 Attempting MQTT connection to ${brokerUrl}`);

  const client = mqtt.connect(brokerUrl, {
    username: config.mqtt.username,
    password: config.mqtt.password,
    // 2. Harden Connection
    reconnectPeriod: 5000,
    connectTimeout: 30 * 1000,
    clean: true
  });

  client.on('connect', () => {
    console.log('✅ MQTT connected');
    client.subscribe('smartcart/provisioning/announce/#');
    client.subscribe('smartcart/#');
    client.subscribe('cart/+/scan'); // Listen for Real-Time Ad triggers
  });

  client.on('reconnect', () => {
      console.log('🔄 MQTT reconnecting...');
  });

  client.on('offline', () => {
      console.log('❌ MQTT offline');
  });

  checkStaleCarts(io);

  // Handle errors gracefully so the server doesn't crash
  client.on('error', (err) => {
    console.error(`⚠️ MQTT Client Error: ${err.message}`);
  });

  client.on('message', async (topic, payload) => {
    try {
      const message = JSON.parse(payload.toString());

      // --- 0. Handle Ad Scan Trigger (Phase 2 - DeepSeek AI) ---
      // Topic: cart/{cart_id}/scan
      const scanTopicMatch = topic.match(/cart\/([^\/]+)\/scan/);
      if (scanTopicMatch) {
        const cartId = scanTopicMatch[1];
        const { items, scanned_item } = message; // Expecting { items: ["Milk", "Bread"], scanned_item: "Eggs" }

        // Logic: Extract item name -> Query Product DB for Smart Recommendations -> If missing, trigger DeepSeek
        // Note: cartId here is likely the macAddress or Hardware ID based on topic convention.

        let adContent = null;
        let adItem = null;

        try {
             // 1. Try to find cached "Smart Recommendations" in Product DB
             const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
             const safeScannedItem = escapeRegExp(String(scanned_item || ''));
             const product = await Product.findOne({ name: { $regex: new RegExp(safeScannedItem, 'i') } });

             if (product && product.smart_ads && product.smart_ads.ad_copy) {
                 // Found valid cached ad
                 console.log(`   - 💡 Found cached ad for ${scanned_item}`);
                 adContent = product.smart_ads.ad_copy;
                 adItem = product.smart_ads.cross_sell || "Special Offer";
             } else {
                 // 2. No cache, trigger DeepSeek
                 console.log(`   - 🧠 Triggering DeepSeek for ${scanned_item}`);
                 const adData = await deepseekService.generateContextualAd(items, scanned_item);
                 if (adData) {
                     adContent = adData.ad_headline || adData.ad_copy; // Adapt to whatever the service returns
                     adItem = adData.cross_sell || "Mystery Deal";

                     // Optional: Cache this back to the product if it exists to save tokens next time
                     if (product) {
                         product.smart_ads = {
                             ad_copy: adContent,
                             cross_sell: adItem,
                             generatedAt: new Date()
                         };
                         await product.save();
                     }
                 }
             }

             if (adContent) {
                 const adTopic = `cart/${cartId}/ads`;
                 const adPayload = {
                     type: "ad",
                     content: adContent,
                     item: adItem
                 };
                 client.publish(adTopic, JSON.stringify(adPayload));
             }

        } catch (adError) {
            console.error("Ad Generation Error:", adError);
        }

        return;
      }

      // --- 1. Handle New Cart Announcements ---
      if (topic.startsWith('smartcart/provisioning/announce/')) {
        const mallId = topic.split('/')[3];
        const { macAddress } = message;
        if (!macAddress || !mallId) return;

        console.log(`🆕 Cart announce received from ${macAddress} for mall ${mallId}`);

        const newUnclaimedCart = await UnclaimedCart.findOneAndUpdate(
          { macAddress }, { macAddress, mallId }, { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        io.to(mallId).emit('newUnclaimedCart', newUnclaimedCart);
        console.log('📤 Dashboard event emitted: newUnclaimedCart');
        return;
      }
      
      // --- 2. Handle Authenticated Cart Messages (Now MAC-based) ---
      // We accept any client ID (assuming it is the MAC address) in the second segment.
      // Regex: smartcart / <anything> / <event>
      const secureTopicMatch = topic.match(/smartcart\/([^\/]+)\/(.*)/);
      if (secureTopicMatch) {
        const identifier = secureTopicMatch[1]; // This is now the MAC Address or MQTT Username
        const eventType = secureTopicMatch[2];
        
        // Skip provisioning topics which also start with smartcart/
        if (identifier === 'provisioning') return;

        // Find cart by MAC address (primary) or mqttUsername (legacy)
        const cart = await Cart.findOne({
            $or: [{ macAddress: identifier }, { mqttUsername: identifier }]
        });

        if (!cart) {
            return;
        }

        // A. Telemetry
        if (eventType === 'telemetry') {
            const { battery, status } = message;
            cart.battery = battery;
            cart.status = status;
            cart.lastSeen = new Date();
            const updatedCart = await cart.save();
            io.emit('cartUpdate', updatedCart);
        }
        
        // B. Events
        if (eventType === 'events/item_added') {
             // ... existing item added logic ...
        }

        // ... (rest of the code remains largely the same, ensuring minimal diff) ...

        // B. events/payment_request logic kept intact from previous state
        if (eventType.startsWith('events/')) {
            // B.1 - Item Added
            if (eventType === 'events/item_added') {
                const { item } = message;
                let updatedCart;
                if (cart.status === 'Idle') {
                    updatedCart = await Cart.findOneAndUpdate(
                        { _id: cart._id },
                        { $set: { currentItems: [item], status: 'Shopping' } },
                        { new: true }
                    );
                } else {
                    updatedCart = await Cart.findOneAndUpdate(
                        { _id: cart._id },
                        { $push: { currentItems: item } },
                        { new: true }
                    );
                }
                if (updatedCart) {
                    io.to(cart._id.toString()).emit('cartStateUpdate', updatedCart);
                }
            }

            // B.2 - Payment Request (Real Simulator Logic)
            if (eventType === 'events/payment_request') {
                const { amount, mqtt_username } = message; 
                console.log(`   - 💳 Payment request from ${cart.cartId}`);
                const responseTopic = `smartcart/${identifier}/commands`; // Use identifier (MAC)

                try {
                    // Use dynamic app URL from config
                    const appUrl = config.appUrl;
                    
                    // Generate the Simulator Link
                    const paymentUrl = `${appUrl}/pay/simulator.html?cartId=${cart.cartId}&mallId=${cart.mallId}&amount=${amount}`;
                    
                     const transactionId = `txn_${Date.now()}`;

                     const responsePayload = JSON.stringify({ 
                        command: 'paymentInfo', 
                        paymentUrl: paymentUrl,
                        transactionId: transactionId
                    });
                    client.publish(responseTopic, responsePayload);
                    console.log(`   - 💳 Payment URL sent to cart ${cart.cartId}`);

                } catch (error) {
                    console.error(`   - ❌ Payment Error:`, error.message);
                    client.publish(responseTopic, JSON.stringify({ command: 'paymentFailed', reason: 'Gateway Error' }));
                }
            }

            // B.3 - Security Alert
            if (eventType === 'events/alert') {
                const { reason, product_id } = message;
                console.log(`🚨 SECURITY ALERT: ${cart.cartId} - ${reason}`);
                
                io.to(cart.mallId).emit('securityAlert', {
                    cartId: cart.cartId,
                    cartName: cart.cartId,
                    reason: reason,
                    productId: product_id,
                    timestamp: new Date()
                });
            }
        }
      }
    } catch (error) {
      console.error(`Error processing MQTT message:`, error);
    }
  });

  return client;
};

export default connectMqttClient;
