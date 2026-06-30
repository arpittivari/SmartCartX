import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
  createMallUnderCompany,
  getCompanyMalls,
  deleteMallUnderCompany,
} from '../controllers/auth.controller.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/forgotpassword', forgotPassword); // 👈 New forgot password route
router.put('/resetpassword/:resetToken', resetPassword); // 👈 New reset password route

// Company Management Routes (Protected)
router.post('/company/malls', requireAuth, createMallUnderCompany);
router.get('/company/malls', requireAuth, getCompanyMalls);
router.delete('/company/malls/:id', requireAuth, deleteMallUnderCompany);

export default router;