import express from 'express';
import { getLandingStats } from '../controllers/landing.controller.js';

const router = express.Router();

router.get('/landing-stats', getLandingStats);

export default router;
