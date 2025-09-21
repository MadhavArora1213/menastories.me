const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ArticleComment = sequelize.define('ArticleComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  articleId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('general', 'revision', 'approval', 'rejection'),
    defaultValue: 'general'
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = ArticleComment;