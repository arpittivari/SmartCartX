import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  ownerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  apiKey: {
    type: String,
    // Generated API key for the tenant to use in headers
    select: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'pro', 'enterprise'],
    default: 'basic'
  },
  settings: {
    deepseekEnabled: { type: Boolean, default: false },
    theme: { type: String, default: 'light' }
  }
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
