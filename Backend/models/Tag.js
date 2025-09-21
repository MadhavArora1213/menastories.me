const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tag = sequelize.define('Tag', {
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
  type: {
    type: DataTypes.ENUM('regular', 'special_feature', 'trending', 'multimedia', 'interactive', 'event'),
    defaultValue: 'regular'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Tags',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Self-referencing associations for hierarchical structure
Tag.belongsTo(Tag, { as: 'parent', foreignKey: 'parentId' });
Tag.hasMany(Tag, { as: 'subcategories', foreignKey: 'parentId' });

// Association with Category
const Category = require('./Category');
Tag.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'tagCategory',
  onDelete: 'CASCADE'
});

// Note: VideoArticle association is defined in VideoArticle model to avoid circular dependency
// Tag.belongsToMany(VideoArticle, {
//   through: require('./VideoArticleTag'),
//   foreignKey: 'tagId',
//   otherKey: 'videoArticleId',
//   as: 'videoArticles'
// });

module.exports = Tag;