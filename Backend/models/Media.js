const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  optimizedUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publicId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('image', 'video', 'audio', 'document'),
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  originalFilename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  format: {
    type: DataTypes.STRING,
    allowNull: true
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  duration: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  bitrate: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  frameRate: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  folderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'MediaFolders',
      key: 'id'
    }
  },
  folder: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  caption: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  altText: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Copyright and licensing
  copyright: {
    type: DataTypes.STRING,
    allowNull: true
  },
  license: {
    type: DataTypes.ENUM('all_rights_reserved', 'creative_commons', 'public_domain', 'fair_use'),
    defaultValue: 'all_rights_reserved'
  },
  licenseDetails: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // SEO and metadata
  seoTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seoDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Processing status
  processingStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'completed'
  },
  processingError: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Usage tracking
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // CDN and optimization
  cdnUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isOptimized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  optimizationLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  // Status and visibility
  status: {
    type: DataTypes.ENUM('active', 'archived', 'deleted'),
    defaultValue: 'active'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Media',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['folderId']
    },
    {
      fields: ['uploadedBy']
    },
    {
      fields: ['status']
    },
    {
      fields: ['processingStatus']
    },
    {
      fields: ['createdAt']
    },
    // Removed GIN index for tags - causes PostgreSQL compatibility issues
    // {
    //   fields: ['tags'],
    //   using: 'gin'
    // }
  ]
});

module.exports = Media;