const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    articleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Articles',
        key: 'id'
      },
      field: 'article_id'
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: true, // Allow null for anonymous comments
      references: {
        model: 'Users',
        key: 'id'
      },
      field: 'author_id'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Comment content cannot be empty'
        },
        len: {
          args: [1, 5000],
          msg: 'Comment must be between 1 and 5000 characters'
        }
      }
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Comments',
        key: 'id'
      },
      field: 'parent_id',
      comment: 'For threaded comments - references parent comment'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'spam', 'hidden'),
      allowNull: false,
      defaultValue: 'pending'
    },
    upvotes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    downvotes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_edited'
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'edited_at'
    },
    // Anonymous comment fields (for backward compatibility)
    authorName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'author_name',
      comment: 'For anonymous comments when no user is logged in'
    },
    authorEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'author_email',
      comment: 'For anonymous comments when no user is logged in',
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    },
    authorWebsite: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'author_website',
      comment: 'For anonymous comments when no user is logged in'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ip_address',
      comment: 'IP address for moderation purposes'
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent',
      comment: 'User agent for moderation purposes'
    },
    moderatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      field: 'moderated_by',
      comment: 'Admin/moderator who approved/rejected the comment'
    },
    moderatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'moderated_at'
    },
    moderationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'moderation_notes',
      comment: 'Internal notes for moderation'
    }
  }, {
    tableName: 'Comments',
    timestamps: true,
    // Disable auto-sync to prevent index creation conflicts
    sync: false,
    hooks: {
      beforeUpdate: (comment, options) => {
        // Track edit timestamp
        if (comment.changed('content')) {
          comment.isEdited = true;
          comment.editedAt = new Date();
        }
      }
    }
  });

  Comment.associate = (models) => {
    // Association with Article
    Comment.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article'
    });

    // Association with User (author)
    Comment.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author'
    });

    // Association with User (moderator)
    Comment.belongsTo(models.User, {
      foreignKey: 'moderatedBy',
      as: 'moderator'
    });

    // Self-reference for threaded comments
    Comment.hasMany(models.Comment, {
      foreignKey: 'parentId',
      as: 'replies'
    });

    Comment.belongsTo(models.Comment, {
      foreignKey: 'parentId',
      as: 'parent'
    });

    // Association with votes
    Comment.hasMany(models.CommentVote, {
      foreignKey: 'commentId',
      as: 'votes'
    });

    // Association with reports
    Comment.hasMany(models.CommentReport, {
      foreignKey: 'commentId',
      as: 'reports'
    });
  };

  // Instance methods
  Comment.prototype.getVoteScore = function() {
    return this.upvotes - this.downvotes;
  };

  Comment.prototype.canEdit = function(userId) {
    return this.authorId && this.authorId === userId;
  };

  Comment.prototype.canDelete = function(userId, userRole) {
    return (this.authorId && this.authorId === userId) ||
           ['Master Admin', 'Content Admin', 'Moderator'].includes(userRole);
  };

  // Class methods
  Comment.getByArticle = async function(articleId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = 'newest',
      includeReplies = true
    } = options;

    try {
      let orderClause;
      switch (sort) {
        case 'oldest':
          orderClause = [['createdAt', 'ASC']];
          break;
        case 'popular':
          orderClause = [['upvotes', 'DESC'], ['createdAt', 'DESC']];
          break;
        default:
          orderClause = [['createdAt', 'DESC']];
      }

      const includeClause = [{
        model: this.sequelize.models.User,
        as: 'author',
        attributes: ['id', 'name', 'avatar', 'isEmailVerified'],
        required: false
      }];

      if (includeReplies) {
        includeClause.push({
          model: this.sequelize.models.Comment,
          as: 'replies',
          where: { status: 'approved' },
          required: false,
          attributes: ['id', 'authorId', 'content', 'parentId', 'status', 'upvotes', 'downvotes', 'isEdited', 'editedAt', 'authorName', 'authorEmail', 'authorWebsite', 'ipAddress', 'userAgent', 'moderatedBy', 'moderatedAt', 'moderationNotes', 'createdAt', 'updatedAt'],
          include: [{
            model: this.sequelize.models.User,
            as: 'author',
            attributes: ['id', 'name', 'avatar', 'isEmailVerified'],
            required: false
          }]
        });
      }

      return await this.findAndCountAll({
        where: {
          articleId,
          parentId: null, // Only top-level comments
          status: 'approved'
        },
        include: includeClause,
        order: orderClause,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  };

module.exports = Comment;