import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { claimDevice } from '../controllers/fleet.controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route: POST /api/v1/fleet/upload-training-data
// Used by Edge devices (Data Flywheel)
const deviceAuth = (req, res, next) => {
    const token = req.headers['x-device-token'];
    if (!token) return res.status(401).json({ message: 'Missing Device Token' });
    // In real app, verify token against DB
    next();
};

const handleTrainingUpload = (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image file' });
    const { product_id, label } = req.body; // 'label' might be passed, or we infer from product_id

    const categoryLabel = label || product_id || 'unknown';

    // Move to permanent storage
    const targetDir = path.join(process.cwd(), 'uploads', 'training', categoryLabel);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Safe filename
    const safeProductId = (product_id || 'unknown').replace(/[^a-z0-9]/gi, '_');
    const targetPath = path.join(targetDir, `${safeProductId}_${Date.now()}.jpg`);

    fs.rename(req.file.path, targetPath, (err) => {
        if (err) {
            console.error('Training Upload Move Error:', err);
            return res.status(500).json({ message: 'Failed to save file' });
        }
        console.log(`📸 Received training data for: ${categoryLabel}`);
        res.json({ message: 'Training data received' });
    });
};

router.post('/upload-training-data', deviceAuth, upload.single('file'), handleTrainingUpload);

// Route: POST /api/v1/fleet/claim (Manual Provisioning)
// Should be protected by Admin Auth, but for now we might leave open or assume auth middleware upstream
// Ideally: router.post('/claim', requireAuth, claimDevice);
// Since this file is mounted at /api/v1/fleet, we use /claim
router.post('/claim', claimDevice);

export default router;
