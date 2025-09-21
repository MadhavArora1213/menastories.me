const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    {
      fields: ['uploadedBy']
    },
    {
      fields: ['isPublic']
    },
    {
      fields: ['category']
    },
    {
      fields: ['filename']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Instance methods
File.prototype.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

File.prototype.canBeAccessedBy = function(userId, userRole) {
  // File owner can always access
  if (this.uploadedBy === userId) {
    return true;
  }

  // Public files can be accessed by all authenticated users
  if (this.isPublic) {
    return true;
  }

  // Role-based access
  switch (userRole) {
    case 'Master Admin':
    case 'Webmaster':
    case 'Content Admin':
      return true; // Admins can access all files
    case 'Editor-in-Chief':
    case 'Section Editors':
    case 'Senior Writers':
    case 'Staff Writers':
      return this.isPublic; // Moderators can access public files
    default:
      return false; // Users can only access their own files
  }
};

File.prototype.canBeModifiedBy = function(userId, userRole) {
  // File owner can always modify their own files
  if (this.uploadedBy === userId) {
    return true;
  }

  // Role-based modification permissions
  switch (userRole) {
    case 'Master Admin':
    case 'Webmaster':
    case 'Content Admin':
      return true; // Admins can modify all files
    case 'Editor-in-Chief':
    case 'Section Editors':
    case 'Senior Writers':
    case 'Staff Writers':
      return this.isPublic; // Moderators can modify public files
    default:
      return false; // Users can only modify their own files
  }
};

File.prototype.canBeDeletedBy = function(userId, userRole) {
  // File owner can delete their own files
  if (this.uploadedBy === userId) {
    return true;
  }

  // Role-based deletion permissions
  switch (userRole) {
    case 'Master Admin':
      return true; // Only Master Admin can delete any file
    case 'Webmaster':
    case 'Content Admin':
    case 'Editor-in-Chief':
    case 'Section Editors':
    case 'Senior Writers':
    case 'Staff Writers':
      return this.isPublic; // Moderators can delete public files
    default:
      return false; // Users can only delete their own files
  }
};

File.prototype.incrementDownloadCount = async function() {
  this.downloadCount += 1;
  this.lastAccessedAt = new Date();
  await this.save();
};

module.exports = File;