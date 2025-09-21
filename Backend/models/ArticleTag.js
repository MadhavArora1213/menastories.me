const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ArticleTag = sequelize.define('ArticleTag', {
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
  tagId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tags',
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['articleId', 'tagId']
    }
  ]
});

module.exports = ArticleTag;