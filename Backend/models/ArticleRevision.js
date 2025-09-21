const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ArticleRevision = sequelize.define('ArticleRevision', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  articleId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  revisionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  revisionType: {
    type: DataTypes.ENUM('draft', 'submission', 'review', 'edit', 'final'),
    allowNull: false
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

module.exports = ArticleRevision;