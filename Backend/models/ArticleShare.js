const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ArticleShare = sequelize.define('ArticleShare', {
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
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Social media platform or sharing method (facebook, twitter, linkedin, whatsapp, email, etc.)'
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
    sharedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'ArticleShares',
    timestamps: true,
    indexes: [
      {
        fields: ['articleId']
      },
      {
        fields: ['platform']
      },
      {
        fields: ['sharedAt']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['articleId', 'platform']
      }
    ]
  });

  ArticleShare.associate = (models) => {
    ArticleShare.belongsTo(models.Article, {
      foreignKey: 'articleId',
      as: 'article'
    });
    
    ArticleShare.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

module.exports = ArticleShare;