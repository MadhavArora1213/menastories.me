const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ContentTag = sequelize.define('ContentTag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  contentType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'article, video, podcast, etc.'
  },
  tagId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = ContentTag;