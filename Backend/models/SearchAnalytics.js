const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SearchAnalytics = sequelize.define('SearchAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  query: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  filters: {
    type: DataTypes.JSON,
    allowNull: true
  },
  resultCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clickedResults: {
    type: DataTypes.JSON,
    allowNull: true
  },
  searchType: {
    type: DataTypes.ENUM('global', 'category', 'author', 'tag'),
    defaultValue: 'global'
  },
  searchDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Search duration in milliseconds'
  },
  noResultsReason: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'SearchAnalytics',
  timestamps: true,
  indexes: [
    {
      fields: ['query']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['searchType']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = SearchAnalytics;