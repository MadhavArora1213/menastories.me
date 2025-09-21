const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '72.60.108.85',
  port: 5432,
  database: 'magazine',
  username: 'myuser',
  password: 'Advocate@vandan@28',
  logging: console.log, // Enable logging to see SQL queries
});

// Define Category model
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  color: {
    type: DataTypes.STRING,
  },
  icon: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  metaTitle: {
    type: DataTypes.STRING,
  },
  metaDescription: {
    type: DataTypes.TEXT,
  },
  keywords: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'Categories',
  timestamps: true,
});

// Define SubCategory model
const SubCategory = sequelize.define('SubCategory', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  color: {
    type: DataTypes.STRING,
  },
  icon: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  metaTitle: {
    type: DataTypes.STRING,
  },
  metaDescription: {
    type: DataTypes.TEXT,
  },
  keywords: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'SubCategories',
  timestamps: true,
});

// Define associations
Category.hasMany(SubCategory, { foreignKey: 'categoryId', as: 'subcategories' });
SubCategory.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

async function fetchAllCategoriesAndSubcategories() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    console.log('📂 Fetching all categories...');
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'slug', 'description', 'color', 'status', 'displayOrder', 'createdAt'],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']],
      include: [{
        model: SubCategory,
        as: 'subcategories',
        attributes: ['id', 'name', 'slug', 'description', 'color', 'status', 'displayOrder'],
        order: [['displayOrder', 'ASC'], ['name', 'ASC']],
        required: false
      }]
    });

    console.log('\n' + '='.repeat(80));
    console.log('📋 ALL CATEGORIES AND SUBCATEGORIES');
    console.log('='.repeat(80));

    categories.forEach((category, categoryIndex) => {
      console.log(`\n🏷️  CATEGORY ${categoryIndex + 1}:`);
      console.log('-'.repeat(50));
      console.log(`ID: ${category.id}`);
      console.log(`Name: ${category.name}`);
      console.log(`Slug: ${category.slug}`);
      console.log(`Description: ${category.description || 'N/A'}`);
      console.log(`Color: ${category.color || 'N/A'}`);
      console.log(`Status: ${category.status}`);
      console.log(`Display Order: ${category.displayOrder}`);
      console.log(`Created: ${category.createdAt.toISOString().split('T')[0]}`);

      if (category.subcategories && category.subcategories.length > 0) {
        console.log(`\n  📝 Subcategories (${category.subcategories.length}):`);
        category.subcategories.forEach((subcategory, subIndex) => {
          console.log(`    ${subIndex + 1}. ${subcategory.name}`);
          console.log(`       ID: ${subcategory.id}`);
          console.log(`       Slug: ${subcategory.slug}`);
          console.log(`       Status: ${subcategory.status}`);
          console.log(`       Display Order: ${subcategory.displayOrder}`);
        });
      } else {
        console.log('\n  📝 Subcategories: None');
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Categories: ${categories.length}`);
    const totalSubcategories = categories.reduce((sum, cat) => sum + (cat.subcategories ? cat.subcategories.length : 0), 0);
    console.log(`Total Subcategories: ${totalSubcategories}`);

    // Create a simple lookup object for easy reference
    console.log('\n' + '='.repeat(80));
    console.log('🔍 QUICK LOOKUP (Copy & Use)');
    console.log('='.repeat(80));

    console.log('\n// Categories by ID:');
    categories.forEach(category => {
      console.log(`"${category.name}": "${category.id}",`);
    });

    console.log('\n// Subcategories by ID:');
    categories.forEach(category => {
      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach(subcategory => {
          console.log(`"${subcategory.name}": "${subcategory.id}",`);
        });
      }
    });

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Error fetching categories and subcategories:', error);
    if (error.original) {
      console.error('Database Error:', error.original.message);
    }
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
if (require.main === module) {
  fetchAllCategoriesAndSubcategories();
}

module.exports = { fetchAllCategoriesAndSubcategories };