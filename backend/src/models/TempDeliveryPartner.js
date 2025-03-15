import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const tempDeliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6
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
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'car', 'van', 'truck'],
    required: [true, 'Please add a vehicle type']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please add a vehicle number']
  },
  drivingLicenseNumber: {
    type: String,
    required: [true, 'Please add a driving license number']
  },
  phoneOTP: {
    type: String
  },
  phoneOTPExpiry: {
    type: Date
  },
  emailOTP: {
    type: String
  },
  emailOTPExpiry: {
    type: Date
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Automatically delete after 1 hour
  }
});

// Encrypt password using bcrypt
tempDeliveryPartnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const TempDeliveryPartner = mongoose.model('TempDeliveryPartner', tempDeliveryPartnerSchema);

export default TempDeliveryPartner; 