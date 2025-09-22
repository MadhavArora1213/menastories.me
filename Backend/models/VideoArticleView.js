const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VideoArticleView = sequelize.define('VideoArticleView', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    videoArticleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'VideoArticles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    referrer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    watchTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time spent watching video in seconds'
    },
    watchPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Percentage of video watched (0-100)'
    },
    videoQuality: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Video quality played (360p, 480p, 720p, 1080p, etc.)'
    },
    deviceType: {
      type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
      allowNull: true
    },
    browser: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: 'ISO 3166-1 alpha-2 country code'
    }
  }, {
    tableName: 'VideoArticleViews',
    timestamps: true,
    indexes: [
      {
        fields: ['videoArticleId']
      },
      {
        fields: ['ipAddress', 'videoArticleId']
      },
      {
        fields: ['viewedAt']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['deviceType']
      },
      {
        fields: ['country']
      }
    ]
  });

  VideoArticleView.associate = (models) => {
    VideoArticleView.belongsTo(models.VideoArticle, {
      foreignKey: 'videoArticleId',
      as: 'videoArticle'
    });

    VideoArticleView.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

module.exports = VideoArticleView;