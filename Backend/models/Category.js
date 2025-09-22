const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  design: {
    type: DataTypes.ENUM('design1', 'design2', 'design3'),
    defaultValue: 'design1',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  },
  featureImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL for category hero/feature image'
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Categories',
  indexes: [
    {
      unique: true,
      fields: ['name', 'parentId']
    }
  ]
});

// Self-reference for subcategories with CASCADE delete
Category.hasMany(Category, {
  as: 'subcategories',
  foreignKey: 'parentId',
  onDelete: 'CASCADE'
});

Category.belongsTo(Category, {
  as: 'parent',
  foreignKey: 'parentId',
  onDelete: 'CASCADE'
});

// Association with Articles
const Article = require('./Article');

Category.hasMany(Article, {
  foreignKey: 'categoryId',
  as: 'articles'
});

Article.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

module.exports = Category;