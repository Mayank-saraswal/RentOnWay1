import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
      required: true
    },
    requestId: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      sparse: true
    },
    email: {
      type: String,
      sparse: true
    },
    type: {
      type: String,
      enum: ['phone', 'email'],
      required: true
    },
    purpose: {
      type: String,
      enum: ['register', 'login', 'verification', 'reset'],
      default: 'verification'
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for fast queries and automatic expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create model
const OTP = mongoose.model('OTP', otpSchema);

export default OTP; 