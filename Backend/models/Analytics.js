const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventType: {
    type: DataTypes.ENUM(
      'page_view',
      'article_view',
      'search_query',
      'newsletter_signup',
      'social_share',
      'comment_posted',
      'user_registration',
      'media_download',
      'form_submission',
      'custom_event'
    ),
    allowNull: false
  },
  eventData: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referrer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceType: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
    allowNull: true
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true
  },
  operatingSystem: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    {
      fields: ['eventType', 'timestamp']
    },
    {
      fields: ['userId', 'timestamp']
    },
    {
      fields: ['sessionId']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['url']
    }
  ]
});

module.exports = Analytics;