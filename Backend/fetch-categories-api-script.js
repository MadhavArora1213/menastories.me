const axios = require('axios');

async function fetchAllCategoriesAndSubcategories() {
  try {
    console.log('🔄 Fetching categories from API...');

    // Fetch all categories
    const categoriesResponse = await axios.get('http://localhost:5000/api/public/categories');
    const categories = categoriesResponse.data.data; // Access the nested data array

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
      console.log(`Display Order: ${category.displayOrder || 0}`);
      console.log(`Created: ${category.createdAt ? new Date(category.createdAt).toISOString().split('T')[0] : 'N/A'}`);

      if (category.subcategories && category.subcategories.length > 0) {
        console.log(`\n  📝 Subcategories (${category.subcategories.length}):`);
        category.subcategories.forEach((subcategory, subIndex) => {
          console.log(`    ${subIndex + 1}. ${subcategory.name}`);
          console.log(`       ID: ${subcategory.id}`);
          console.log(`       Slug: ${subcategory.slug}`);
          console.log(`       Status: ${subcategory.status}`);
          console.log(`       Display Order: ${subcategory.displayOrder || 0}`);
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
    console.error('❌ Error fetching categories and subcategories:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

// Run the script
if (require.main === module) {
  fetchAllCategoriesAndSubcategories();
}

module.exports = { fetchAllCategoriesAndSubcategories };