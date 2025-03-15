import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const retailerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Please add a business name']
  },
  ownerName: {
    type: String,
    required: [true, 'Please add an owner name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  state: {
    type: String,
    required: [true, 'Please add a state']
  },
  pincode: {
    type: String,
    required: [true, 'Please add a pincode']
  },
  gstNumber: {
    type: String,
    required: [true, 'Please add a GST number'],
    unique: true
  },
  panNumber: {
    type: String,
    required: [true, 'Please add a PAN number'],
    unique: true
  },
  bankName: {
    type: String,
    required: [true, 'Please add a bank name']
  },
  accountNumber: {
    type: String,
    required: [true, 'Please add an account number']
  },
  ifscCode: {
    type: String,
    required: [true, 'Please add an IFSC code']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  businessLogo: {
    type: String,
    default: null
  },
  businessDocuments: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
retailerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match retailer entered password to hashed password in database
retailerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Retailer = mongoose.model('Retailer', retailerSchema);

export default Retailer; 