const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ContentCampaign = sequelize.define('ContentCampaign', {
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
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  targetAudience: {
    type: DataTypes.STRING,
    allowNull: true
  },
  themeColor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = ContentCampaign;