import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    // For Malls
    mallId: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    // For Companies
    companyId: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    // If a Mall is owned by a Company
    parentCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recoveryEmail: {
      type: String,
      unique: true,
      sparse: true, // This tells the DB to only enforce uniqueness for non-null values
      set: v => v === "" ? null : v
    },
    // --- Shopper Fields (New) ---
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      sparse: true,
      trim: true,
    },
    loyalty_points: {
      type: Number,
      default: 0,
    },
    order_history: [{
        transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
        date: { type: Date, default: Date.now },
        total_amount: Number,
        items: [],
        pdf_link: String
    }],
    preferences: {
        favorite_categories: [String],
        avg_spend: { type: Number, default: 0 }
    },

    password: {
      type: String,
      required: function() { return this.role !== 'shopper'; }, // Password not required for quick shoppers yet
    },
    role: {
      type: String,
      enum: ['admin', 'super-admin', 'company', 'shopper'],
      default: 'admin',
    },
    // --- Profile Fields ---
    mallName: { type: String, default: '' },
    brandName: { type: String, default: '' },
    location: { type: String, default: '' },
    imageUrl: { type: String, default: '/uploads/default-avatar.png' },
    mobileNumber: { type: String, default: '' }, // For admin mobile, distinct from 'phone' which is for shoppers? Or unify? I'll keep distinct to avoid breaking.
    
    // --- Password Reset Fields ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
  );
  

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;