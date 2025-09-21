const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ContentMetric = sequelize.define('ContentMetric', {
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
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  uniqueViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  saveCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  readTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total time spent by users in seconds'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
});

module.exports = ContentMetric;