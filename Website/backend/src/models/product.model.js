import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
   mallId: {
    type: String,
    required: true,
  },
  productId: { // Store's internal product ID (e.g., FV001)
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  weight: {
    type: String, // e.g., "500g", "1L", "1 pc"
    default: '',
  },
  
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Enterprise SaaS Fields
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  barcode: {
    type: String,
    trim: true,
    // Barcode might be the same as productId in some cases, but good to have explicit field
  },
  smart_ads: {
    ad_copy: { type: String },
    cross_sell: { type: String },
    generatedAt: { type: Date }
  }
  // You can add more fields here like imageUrl, description, stock, etc.
}, { timestamps: true });

// Legacy index
productSchema.index({ mallId: 1, productId: 1 }, { unique: true });

// New Multi-Tenant Index
// We enforce uniqueness of barcode per organization
productSchema.index({ organization: 1, barcode: 1 }, { unique: true, sparse: true });

const Product = mongoose.model('Product', productSchema);

export default Product;