import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  mallId: { type: String, required: true },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  totalAmount: { type: Number, required: true },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
  }],
}, { timestamps: true });

// Index for Analytics: Filter by mall, Sort/Range by date
transactionSchema.index({ mallId: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
