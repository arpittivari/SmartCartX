// Placeholder for cart.routes.js
import express from 'express';
import {
  registerCart,
  getAdminCarts,
  deleteCart,
  getCartHistory,
  processCashPayment,
} from '../controllers/cart.controller.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Apply the auth middleware to all routes in this file
router.use(requireAuth);

router.route('/').post(registerCart).get(getAdminCarts);
router.route('/:id').delete(deleteCart);
router.route('/:id/history').get(getCartHistory);
router.route('/:id/cash-payment').post(processCashPayment);

export default router;