const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SocialAnalytics = sequelize.define('SocialAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM(
      'facebook',
      'twitter',
      'instagram',
      'linkedin',
      'youtube',
      'pinterest',
      'tiktok',
      'reddit',
      'other'
    ),
    allowNull: false
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID of the article or content being shared'
  },
  contentType: {
    type: DataTypes.ENUM('article', 'image', 'video', 'newsletter', 'other'),
    defaultValue: 'article'
  },
  postId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Social media post ID'
  },
  postUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  impressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reach: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  engagement: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total engagement (likes + shares + comments)'
  },
  engagementRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Engagement rate as percentage'
  },
  followers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Account followers at time of post'
  },
  demographics: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Age, gender, location demographics'
  },
  hashtags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Hashtags used in the post'
  },
  postedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
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
      fields: ['platform', 'date']
    },
    {
      fields: ['contentId', 'platform']
    },
    {
      fields: ['postId']
    },
    {
      fields: ['engagement']
    }
  ]
});

module.exports = SocialAnalytics;