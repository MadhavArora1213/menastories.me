const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserArticleInteraction = sequelize.define('UserArticleInteraction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  articleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Articles',
      key: 'id'
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isLiked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isSaved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isShared: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  timeSpent: {
    type: DataTypes.INTEGER, // Time spent reading in seconds
    allowNull: true
  },
  scrollDepth: {
    type: DataTypes.DECIMAL(5, 2), // Percentage of article scrolled
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  firstReadAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  firstLikedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  firstSavedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sharedPlatform: {
    type: DataTypes.ENUM('facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy-link'),
    allowNull: true
  },
  sharedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deviceType: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referrer: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'UserArticleInteractions',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'articleId']
    },
    {
      fields: ['userId', 'isRead']
    },
    {
      fields: ['userId', 'isLiked']
    },
    {
      fields: ['userId', 'isSaved']
    },
    {
      fields: ['articleId', 'isRead']
    },
    {
      fields: ['articleId', 'isLiked']
    },
    {
      fields: ['firstReadAt']
    },
    {
      fields: ['firstLikedAt']
    },
    {
      fields: ['firstSavedAt']
    }
  ]
});

// Instance methods
UserArticleInteraction.prototype.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.firstReadAt = new Date();
    this.readCount += 1;
    this.lastReadAt = new Date();
    await this.save();
  }
  return this;
};

UserArticleInteraction.prototype.toggleLike = async function() {
  this.isLiked = !this.isLiked;
  if (this.isLiked && !this.firstLikedAt) {
    this.firstLikedAt = new Date();
  }
  await this.save();
  return this;
};

UserArticleInteraction.prototype.toggleSave = async function() {
  this.isSaved = !this.isSaved;
  if (this.isSaved && !this.firstSavedAt) {
    this.firstSavedAt = new Date();
  }
  await this.save();
  return this;
};

UserArticleInteraction.prototype.recordShare = async function(platform) {
  this.isShared = true;
  this.sharedPlatform = platform;
  this.sharedAt = new Date();
  await this.save();
  return this;
};

UserArticleInteraction.prototype.updateTimeSpent = async function(seconds) {
  this.timeSpent = (this.timeSpent || 0) + seconds;
  await this.save();
  return this;
};

UserArticleInteraction.prototype.updateScrollDepth = async function(percentage) {
  if (percentage > (this.scrollDepth || 0)) {
    this.scrollDepth = percentage;
    await this.save();
  }
  return this;
};

module.exports = UserArticleInteraction;