const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VideoComment = sequelize.define('VideoComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  videoId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'VideoArticles',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true, // For nested replies
    references: {
      model: 'video_comments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000]
    }
  },
  timestamp: {
    type: DataTypes.INTEGER, // Video timestamp in seconds when comment was made
    allowNull: true,
    validate: {
      min: 0
    }
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  likeCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  dislikeCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  replyCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'hidden', 'deleted'),
    allowNull: false,
    defaultValue: 'active'
  },
  moderationReason: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  moderatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  moderatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON, // Additional metadata like device info, etc.
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'video_comments',
  timestamps: true,
  indexes: [
    {
      fields: ['videoId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['parentId']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isPinned']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['videoId', 'timestamp'] // For timestamp-based comments
    },
    {
      fields: ['videoId', 'status'] // For filtering active comments
    }
  ]
});

// Instance methods
VideoComment.prototype.incrementLikes = async function() {
  this.likeCount += 1;
  return this.save();
};

VideoComment.prototype.incrementDislikes = async function() {
  this.dislikeCount += 1;
  return this.save();
};

VideoComment.prototype.addReply = async function() {
  this.replyCount += 1;
  return this.save();
};

VideoComment.prototype.removeReply = async function() {
  if (this.replyCount > 0) {
    this.replyCount -= 1;
    return this.save();
  }
};

VideoComment.prototype.pin = async function() {
  this.isPinned = true;
  return this.save();
};

VideoComment.prototype.unpin = async function() {
  this.isPinned = false;
  return this.save();
};

VideoComment.prototype.hide = async function(reason, moderatorId) {
  this.status = 'hidden';
  this.moderationReason = reason;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  return this.save();
};

VideoComment.prototype.show = async function() {
  this.status = 'active';
  this.moderationReason = null;
  this.moderatedBy = null;
  this.moderatedAt = null;
  return this.save();
};

VideoComment.prototype.softDelete = async function() {
  this.status = 'deleted';
  return this.save();
};

VideoComment.prototype.edit = async function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Static methods
VideoComment.getCommentsByVideo = async function(videoId, includeReplies = true, limit = 50, offset = 0) {
  const whereClause = {
    videoId,
    status: 'active',
    parentId: null // Only top-level comments
  };

  const comments = await this.findAll({
    where: whereClause,
    include: includeReplies ? [{
      model: this,
      as: 'replies',
      where: { status: 'active' },
      required: false,
      include: [{
        model: require('./User'),
        as: 'user',
        attributes: ['id', 'username', 'displayName', 'avatar']
      }]
    }, {
      model: require('./User'),
      as: 'user',
      attributes: ['id', 'username', 'displayName', 'avatar']
    }] : [{
      model: require('./User'),
      as: 'user',
      attributes: ['id', 'username', 'displayName', 'avatar']
    }],
    order: [
      ['isPinned', 'DESC'],
      ['createdAt', 'DESC']
    ],
    limit,
    offset
  });

  return comments;
};

VideoComment.getCommentsByTimestamp = async function(videoId, startTime, endTime) {
  const whereClause = {
    videoId,
    status: 'active',
    timestamp: {
      [require('sequelize').Op.between]: [startTime, endTime]
    }
  };

  const comments = await this.findAll({
    where: whereClause,
    include: [{
      model: require('./User'),
      as: 'user',
      attributes: ['id', 'username', 'displayName', 'avatar']
    }],
    order: [['timestamp', 'ASC']]
  });

  return comments;
};

VideoComment.getTopComments = async function(videoId, limit = 10) {
  const comments = await this.findAll({
    where: {
      videoId,
      status: 'active',
      parentId: null
    },
    include: [{
      model: require('./User'),
      as: 'user',
      attributes: ['id', 'username', 'displayName', 'avatar']
    }],
    order: [['likeCount', 'DESC']],
    limit
  });

  return comments;
};

VideoComment.getCommentStats = async function(videoId) {
  const stats = await this.findAll({
    where: { videoId },
    attributes: [
      'status',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  return stats.reduce((acc, stat) => {
    acc[stat.status] = parseInt(stat.count);
    return acc;
  }, {});
};

module.exports = VideoComment;