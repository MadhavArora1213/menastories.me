const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MediaUsage = sequelize.define('MediaUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  mediaId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Media',
      key: 'id'
    }
  },
  contentType: {
    type: DataTypes.ENUM('article', 'page', 'gallery', 'newsletter', 'social_media'),
    allowNull: false
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  usageType: {
    type: DataTypes.ENUM('featured_image', 'inline_image', 'gallery_item', 'thumbnail', 'banner', 'background', 'attachment'),
    allowNull: false
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Position within content (for inline usage)'
  },
  context: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional context about how the media is used'
  },
  // Tracking
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'MediaUsage',
  timestamps: true,
  indexes: [
    {
      fields: ['mediaId']
    },
    {
      fields: ['contentType', 'contentId']
    },
    {
      fields: ['usageType']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = MediaUsage;