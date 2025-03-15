import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  rentalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  securityDepositAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  deliveryFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  taxAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  discountAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalDays: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending', 
      'confirmed', 
      'processing', 
      'out_for_delivery', 
      'delivered', 
      'in_use', 
      'return_initiated', 
      'return_in_transit', 
      'returned', 
      'completed', 
      'cancelled', 
      'refunded'
    ),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('card', 'upi', 'netbanking', 'wallet', 'cod'),
    allowNull: true
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deliveryPartnerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'DeliveryPartners',
      key: 'id'
    }
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  returnCondition: {
    type: DataTypes.ENUM('excellent', 'good', 'damaged', 'lost'),
    allowNull: true
  },
  damageDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  damageCharges: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  lateReturnCharges: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  refundAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  refundStatus: {
    type: DataTypes.ENUM('not_applicable', 'pending', 'processed', 'completed', 'failed'),
    defaultValue: 'not_applicable'
  },
  refundDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isRated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

export default Order; 