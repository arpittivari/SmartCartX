import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration and Database
import connectDB from './src/config/db.js';
import config from './src/config/index.js';

// Services
import connectMqttClient from './src/services/mqtt.service.js';
import initSocket from './src/services/socket.service.js';

// API Route Imports
import adminRoutes from './src/api/admin.routes.js';
import cartRoutes from './src/api/cart.routes.js';
import analyticsRoutes from './src/api/analytics.routes.js';
import productRoutes from './src/routes/product.routes.js';
import userRoutes from './src/api/user.routes.js';
import unclaimedRoutes from './src/api/unclaimed.routes.js';
import mqttRoutes from './src/api/mqtt.routes.js';
import v1Routes from './src/api/v1.routes.js';
import fleetRoutes from './src/api/fleet.routes.js';
import publicRoutes from './src/api/public.routes.js';
import logger from './src/utils/logger.js';

// Import for public cart event
import { handleCartEvent } from './src/controllers/cart.controller.js';
import { initiateCheckout, getCartBill, handlePaymentWebhook } from './src/controllers/payment.controller.js';
// --- ES Module Path Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Initializations ---
const app = express();
const server = http.createServer(app);

// --- Security: Strict CORS Configuration ---
const allowedOrigins = [
  'http://10.49.252.33:5000',
  'http://localhost:5173', // Local Dev
  'https://smart-cart-central.vercel.app', // Production Frontend
  'https://smart-cart-central-5hriaxwc1-arpit-tiwari-s-projects.vercel.app' // Vercel Preview
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && !origin.endsWith('.vercel.app')) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Socket.IO Connection Logic (Decoupled) ---
const io = new Server(server, {
  cors: corsOptions
});

// --- Connect to Services ---
connectDB();
initSocket(io);

// --- Global Objects (Critical for Routes) ---
app.set('io', io);

const mqttClient = connectMqttClient(io);
app.set('mqttClient', mqttClient);

// --- Public Endpoints ---
app.post('/cart/event', handleCartEvent); // 👈 Public Cart Event
app.post('/cart/checkout/:cartId', initiateCheckout); // 👈 New Checkout
app.get('/cart/:cartId/bill', getCartBill); // 👈 New Bill View
app.post('/payment/webhook', handlePaymentWebhook); // 👈 Payment Webhook

app.post('/cart/checkout/:cartId', initiateCheckout); // 👈 New Checkout
app.get('/cart/:cartId/bill', getCartBill); // 👈 New Bill View
app.post('/payment/webhook', handlePaymentWebhook); // 👈 Payment Webhook
app.post('/cart/checkout/:cartId', initiateCheckout); // New Checkout
app.get('/cart/:cartId/bill', getCartBill); // Bill View
app.post('/payment/webhook', handlePaymentWebhook); // Payment Webhook

// --- API Routes ---
app.use('/api/admin', adminRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/unclaimed', unclaimedRoutes);
app.use('/api/internal/mqtt', mqttRoutes);
app.use('/api/public', publicRoutes);

// --- Enterprise SaaS Routes (V1) ---
app.use('/api/v1/tenant', v1Routes);
app.use('/api/v1/fleet', fleetRoutes);

// --- Static Folder for Uploads & Payment Simulator ---
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/pay', express.static(path.join(__dirname, '../frontend/public/pay')));

// --- Test Route ---
app.get('/', (req, res) => {
  res.send('SmartCart Central API v5.0 (Enterprise) is running...');
});

// --- Server Activation ---
server.listen(config.port, () => {
  logger.info(`🚀 Server running on http://localhost:${config.port}`);
});
