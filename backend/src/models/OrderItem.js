import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  retailerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Retailers',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  rentalPricePerDay: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  securityDeposit: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  totalRentalAmount: {
    type: DataTypes.FLOAT,
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

export default OrderItem; 