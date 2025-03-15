import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MembershipPlan = sequelize.define('MembershipPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in days'
  },
  features: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  discountPercentage: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  freeDelivery: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  prioritySupport: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  maxItemsPerMonth: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

export default MembershipPlan; 