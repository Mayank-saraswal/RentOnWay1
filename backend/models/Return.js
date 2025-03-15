const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  pickupDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    enum: ['9AM-12PM', '12PM-3PM', '3PM-6PM', '6PM-9PM']
  },
  additionalNotes: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'picked_up', 'inspected', 'completed'],
    default: 'scheduled'
  },
  returnId: {
    type: String,
    required: true,
    unique: true
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inspection: {
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    qualityIssues: [{
      type: String,
      enum: ['stains', 'tears', 'missing_parts', 'broken_components', 'odor', 'color_fade']
    }],
    comments: String,
    images: [String],
    inspectedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
returnSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Return', returnSchema); 