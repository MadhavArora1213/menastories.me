require('dotenv').config();
const { Category, Subcategory } = require('./models');
const sequelize = require('./config/db');

async function checkCategoriesAndSubcategories() {
  try {
    console.log('🔄 Connecting to database...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Count categories
    console.log('\n📊 Checking categories...');
    const categoryCount = await Category.count();
    console.log(`📂 Total categories in database: ${categoryCount}`);

    if (categoryCount > 0) {
      // Get all categories with their details
      const categories = await Category.findAll({
        attributes: ['id', 'name', 'slug', 'status', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      console.log('\n📋 Categories list:');
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (ID: ${category.id}, Slug: ${category.slug}, Status: ${category.status})`);
      });
    }

    // Count subcategories
    console.log('\n📊 Checking subcategories...');
    const subcategoryCount = await Subcategory.count();
    console.log(`📂 Total subcategories in database: ${subcategoryCount}`);

    if (subcategoryCount > 0) {
      // Get all subcategories with their category info
      const subcategories = await Subcategory.findAll({
        attributes: ['id', 'name', 'slug', 'status', 'categoryId', 'createdAt'],
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        order: [['categoryId', 'ASC'], ['createdAt', 'DESC']]
      });

      console.log('\n📋 Subcategories list:');
      subcategories.forEach((subcategory, index) => {
        const categoryName = subcategory.category ? subcategory.category.name : 'No Category';
        console.log(`${index + 1}. ${subcategory.name} (ID: ${subcategory.id}, Category: ${categoryName}, Status: ${subcategory.status})`);
      });

      // Group subcategories by category
      console.log('\n📊 Subcategories grouped by category:');
      const categoryGroups = {};

      subcategories.forEach(subcategory => {
        const categoryName = subcategory.category ? subcategory.category.name : 'Uncategorized';
        if (!categoryGroups[categoryName]) {
          categoryGroups[categoryName] = [];
        }
        categoryGroups[categoryName].push(subcategory.name);
      });

      Object.keys(categoryGroups).forEach(categoryName => {
        const count = categoryGroups[categoryName].length;
        console.log(`📁 ${categoryName}: ${count} subcategories`);
        categoryGroups[categoryName].forEach(subName => {
          console.log(`   • ${subName}`);
        });
      });
    }

    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`Categories: ${categoryCount}`);
    console.log(`Subcategories: ${subcategoryCount}`);

    if (categoryCount === 8 && subcategoryCount === 1666) {
      console.log('✅ Perfect! You have exactly 8 categories and 1666 subcategories as expected.');
    } else {
      console.log('⚠️  The counts do not match your expected values (8 categories, 1666 subcategories).');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the check
if (require.main === module) {
  checkCategoriesAndSubcategories().catch(console.error);
}

module.exports = { checkCategoriesAndSubcategories };