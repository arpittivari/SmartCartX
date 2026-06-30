// Placeholder for cart.model.js
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    cartId: {
      type: String,
      required: true,
      trim: true,
    },
    mallId: { // We'll store this for easy querying
      type: String,
      required: true,
    },
    macAddress: {
      type: String,
      required: true,
      unique: true,
    },
    currentItems: [{
        product_id: String,
        product_name: String,
        price: Number,
        quantity: Number
    }],
    // Credentials are now optional as we use MAC-based identification
    mqttUsername: { type: String },
    mqttPassword: { type: String },
    firmwareVersion: {
      type: String,
      default: '1.0.0',
    },
    status: {
      type: String,
      enum: ['Idle', 'Shopping', 'Payment', 'Offline'],
      default: 'Offline',
    },
    battery: {
      type: Number,
      default: 100,
    },
    location: {
      // Storing as a GeoJSON Point is best for map features later
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    // This links the cart to the admin who registered it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Optimize count queries by mallId
cartSchema.index({ mallId: 1 });

// Ensure cartId is unique per mall
cartSchema.index({ cartId: 1, mallId: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
