import express from 'express';
import multer from 'multer';
import { uploadInventory } from '../controllers/inventory.controller.js';
import tenantMiddleware from '../middleware/tenant.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route: POST /api/v1/tenant/inventory/upload
// Protected by tenant middleware to ensure isolation
router.post('/inventory/upload', tenantMiddleware, upload.single('file'), uploadInventory);

export default router;
