const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true
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
    enum: ['register', 'login', 'verification', 'reset-password'],
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 43200 // Auto delete after 12 hours
  }
});

// Ensure either phone or email is provided
otpSchema.pre('save', function(next) {
  if (!this.phone && !this.email) {
    return next(new Error('Either phone or email must be provided'));
  }
  next();
});

// Create indexes for faster queries
otpSchema.index({ phone: 1, type: 1, purpose: 1 });
otpSchema.index({ email: 1, type: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP; 