const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SavedSearch = sequelize.define('SavedSearch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  query: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filters: {
    type: DataTypes.JSON,
    allowNull: true
  },
  resultCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastExecuted: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'SavedSearches',
  timestamps: true
});

module.exports = SavedSearch;