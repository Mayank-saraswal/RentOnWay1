import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserMembership = sequelize.define('UserMembership', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  membershipPlanId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'MembershipPlans',
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM('card', 'upi', 'netbanking', 'wallet'),
    allowNull: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  isAutoRenewal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  nextBillingDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

export default UserMembership; 