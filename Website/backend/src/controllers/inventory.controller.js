import fs from 'fs';
import csv from 'csv-parser';
import Product from '../models/product.model.js';
import deepseekService from '../services/deepseek.service.js';
import logger from '../utils/logger.js';

const uploadInventory = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const results = [];
  const orgId = req.orgId; // Injected by tenant middleware

  // 1. Stream & Parse CSV
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // 2. Prepare Bulk Write Operations
        // Expected CSV columns: barcode, name, category, price, weight, quantity
        const operations = results.map(row => ({
          updateOne: {
            filter: { organization: orgId, barcode: row.barcode },
            update: {
              $set: {
                name: row.name,
                category: row.category,
                price: parseFloat(row.price),
                weight: row.weight,
                quantity: parseInt(row.quantity, 10),
                mallId: 'legacy_compat' // Ensure legacy field has value
              }
            },
            upsert: true
          }
        }));

        if (operations.length === 0) {
            fs.unlinkSync(req.file.path); // Cleanup
            return res.json({ message: 'No records to process' });
        }

        // 3. Execute Bulk Write
        const bulkResult = await Product.bulkWrite(operations);
        logger.info(`Inventory Upload: ${bulkResult.upsertedCount} inserted, ${bulkResult.modifiedCount} updated for Org ${orgId}`);

        // 4. Cleanup Uploaded File
        fs.unlinkSync(req.file.path);

        res.status(200).json({
          message: 'Inventory processed successfully',
          stats: {
            inserted: bulkResult.upsertedCount,
            updated: bulkResult.modifiedCount
          }
        });

        // 5. Async Trigger: Generate Ads for New Products
        // We find products for this org that don't have smart_ads.ad_copy
        processAdsAsync(orgId);

      } catch (error) {
        logger.error('Inventory Upload Error:', error);
        // Attempt to clean up file if it exists
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Failed to process inventory file' });
      }
    });
};

// Async function to generate ads (fire and forget from controller perspective)
const processAdsAsync = async (orgId) => {
    try {
        const productsNeedingAds = await Product.find({
            organization: orgId,
            $or: [
                { 'smart_ads.ad_copy': { $exists: false } },
                { 'smart_ads.ad_copy': '' }
            ]
        }).limit(50); // Process in batches to avoid rate limits

        logger.info(`DeepSeek Trigger: Found ${productsNeedingAds.length} products needing ads.`);

        for (const product of productsNeedingAds) {
            const adData = await deepseekService.generateAdCopy(product.name, product.category);

            if (adData) {
                product.smart_ads = {
                    ad_copy: adData.ad_copy,
                    cross_sell: adData.cross_sell,
                    generatedAt: new Date()
                };
                await product.save();
                logger.info(`Ad generated for ${product.name}`);
            }
        }
    } catch (error) {
        logger.error('Async Ad Generation Error:', error);
    }
};

export { uploadInventory };
