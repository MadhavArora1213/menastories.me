const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Subcategory = sequelize.define('Subcategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM('regular', 'featured', 'special'),
    defaultValue: 'regular',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  featureImage: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL for subcategory hero/feature image'
  },
  metaTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 60]
    }
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 160]
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['name', 'categoryId']
    },
    {
      fields: ['categoryId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['slug']
    }
  ],
  timestamps: true
});

// Define associations
Subcategory.associate = (models) => {
  // Belongs to Category
  Subcategory.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category',
    onDelete: 'CASCADE'
  });

  // Many-to-many relationship with Articles through ArticleSubcategories
  Subcategory.belongsToMany(models.Article, {
    through: 'ArticleSubcategories',
    foreignKey: 'subcategoryId',
    otherKey: 'articleId',
    as: 'articles'
  });
};

module.exports = Subcategory;