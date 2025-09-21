const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CommentReport = sequelize.define('CommentReport', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Comments',
        key: 'id'
      }
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    reason: {
      type: DataTypes.ENUM(
        'inappropriate', 
        'spam', 
        'harassment', 
        'hate_speech', 
        'misinformation', 
        'copyright', 
        'other'
      ),
      allowNull: false,
      defaultValue: 'inappropriate'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional details about the report'
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    action: {
      type: DataTypes.ENUM('none', 'warning', 'comment_hidden', 'comment_deleted', 'user_suspended'),
      allowNull: true,
      comment: 'Action taken after review'
    },
    moderatorNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal notes for moderation team'
    }
  }, {
    tableName: 'CommentReports',
    timestamps: true,
    indexes: [
      {
        fields: ['commentId']
      },
      {
        fields: ['reporterId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['reviewedBy']
      },
      {
        unique: true,
        fields: ['commentId', 'reporterId']
      }
    ]
  });

  CommentReport.associate = (models) => {
    CommentReport.belongsTo(models.Comment, {
      foreignKey: 'commentId',
      as: 'comment'
    });
    
    CommentReport.belongsTo(models.User, {
      foreignKey: 'reporterId',
      as: 'reporter'
    });

    CommentReport.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });
  };

  return CommentReport;
};