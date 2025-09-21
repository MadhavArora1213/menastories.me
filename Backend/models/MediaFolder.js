const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MediaFolder = sequelize.define('MediaFolder', {
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
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'MediaFolders',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#3B82F6'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'folder'
  },
  // Permissions and access control
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  accessLevel: {
    type: DataTypes.ENUM('public', 'private', 'restricted'),
    defaultValue: 'public'
  },
  // Storage and organization
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Maximum size in bytes for all files in this folder'
  },
  currentSize: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    comment: 'Current size in bytes of all files in this folder'
  },
  // Metadata
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // Status and visibility
  status: {
    type: DataTypes.ENUM('active', 'archived', 'deleted'),
    defaultValue: 'active'
  },
  // Hierarchy path for efficient queries
  path: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Full path from root to this folder'
  },
  depth: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Depth in the folder hierarchy'
  },
  // Creation and modification tracking
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  lastModifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'MediaFolders',
  timestamps: true,
  indexes: [
    {
      fields: ['parentId']
    },
    {
      fields: ['slug']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['path']
    },
    {
      fields: ['depth']
    }
  ]
});

module.exports = MediaFolder;