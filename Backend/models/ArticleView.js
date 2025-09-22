const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ArticleView = sequelize.define('ArticleView', {
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
      }
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
      }
    },
    readingTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time spent reading in seconds'
    },
    scrollDepth: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Percentage of article scrolled'
    }
  }, {
    tableName: 'ArticleViews',
    timestamps: true,
    indexes: [
      {
        fields: ['articleId']
      },
      {
        fields: ['ipAddress', 'articleId']
      },
      {
        fields: ['viewedAt']
      },
      {
        fields: ['userId']
      }
    ]
  });

  ArticleView.associate = (models) => {
    ArticleView.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article'
    });
    
    ArticleView.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

module.exports = ArticleView;