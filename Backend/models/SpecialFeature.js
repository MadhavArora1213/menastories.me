const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SpecialFeature = sequelize.define('SpecialFeature', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('trending', 'multimedia', 'interactive', 'event'),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configuration for this feature (timeframe, display options, etc.)'
  }
});

module.exports = SpecialFeature;