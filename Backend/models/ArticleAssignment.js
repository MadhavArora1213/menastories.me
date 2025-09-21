const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ArticleAssignment = sequelize.define('ArticleAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  articleId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('author', 'editor', 'reviewer', 'proofreader'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'rejected'),
    defaultValue: 'assigned'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = ArticleAssignment;