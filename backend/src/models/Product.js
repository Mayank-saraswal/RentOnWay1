import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
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
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subCategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  retailPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  rentalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Price per day'
  },
  securityDeposit: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  images: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  season: {
    type: DataTypes.ENUM('all', 'summer', 'winter', 'monsoon', 'spring', 'autumn'),
    defaultValue: 'all'
  },
  eventType: {
    type: DataTypes.ENUM('all', 'wedding', 'party', 'formal', 'casual', 'festival', 'sports'),
    defaultValue: 'all'
  },
  gender: {
    type: DataTypes.ENUM('all', 'men', 'women', 'unisex', 'kids'),
    defaultValue: 'all'
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  material: {
    type: DataTypes.STRING,
    allowNull: true
  },
  condition: {
    type: DataTypes.ENUM('new', 'like new', 'good', 'fair'),
    defaultValue: 'new'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  minRentalDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  maxRentalDays: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalRented: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  retailerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Retailers',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

export default Product; 