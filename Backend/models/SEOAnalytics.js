const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SEOAnalytics = sequelize.define('SEOAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  keyword: {
    type: DataTypes.STRING,
    allowNull: false
  },
  searchEngine: {
    type: DataTypes.ENUM('google', 'bing', 'yahoo', 'duckduckgo', 'other'),
    defaultValue: 'google'
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  impressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ctr: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pageTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  device: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  competition: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  searchVolume: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cpc: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      fields: ['keyword', 'date']
    },
    {
      fields: ['url', 'date']
    },
    {
      fields: ['searchEngine', 'date']
    },
    {
      fields: ['position']
    }
  ]
});

module.exports = SEOAnalytics;