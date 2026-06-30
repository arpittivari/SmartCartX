/**
 * Initializes the Socket.IO logic.
 * @param {object} io - The Socket.IO server instance.
 */
const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected to WebSocket:', socket.id);

    // Room Management for Multi-tenancy (Admins join their Mall's room)
    socket.on('joinRoom', (mallId) => {
      socket.join(mallId);
      console.log(`   - Client ${socket.id} joined Mall Room: ${mallId}`);
    });

    // Specific Cart Monitoring (For Live View Modal)
    socket.on('subscribeToCart', (cartId) => {
      socket.join(cartId);
      console.log(`   - Client ${socket.id} subscribed to Cart: ${cartId}`);
    });

    socket.on('unsubscribeFromCart', (cartId) => {
      socket.leave(cartId);
      console.log(`   - Client ${socket.id} unsubscribed from Cart: ${cartId}`);
    });

    // v4.0 Feature: Assistance Request from Dashboard (Optional Reverse Flow)
    // or listening to dashboard-generated alerts
    socket.on('requestAssistance', (data) => {
        console.log(`   - 🆘 Help requested by ${data.cartId}`);
        io.to(data.mallId).emit('assistanceAlert', data);
    });

    socket.on('disconnect', () => {
      // console.log('Client disconnected:', socket.id);
    });
  });

  // --- Public Namespace for Cart Live Updates (Requested Endpoint) ---
  // Matches /cart/live/:cartId
  io.of(/^\/cart\/live\/\w+$/).on('connection', (socket) => {
    const namespace = socket.nsp;
    // Extract cartId from the namespace name, e.g., "/cart/live/Cart01"
    const parts = namespace.name.split('/');
    const cartId = parts[parts.length - 1];

    console.log(`🔌 New client connected to Live Namespace for Cart: ${cartId}`);
    socket.join(cartId); // Join a room matching the cartId within this namespace
  });
};

export default initSocket;
