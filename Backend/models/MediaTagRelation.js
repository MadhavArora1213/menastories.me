const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MediaTagRelation = sequelize.define('MediaTagRelation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  mediaId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tagId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = MediaTagRelation;