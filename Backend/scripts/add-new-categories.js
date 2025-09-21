const { Category } = require('../models');

const newCategories = [
  'NEWS CONTENT',
  'GEOGRAPHIC COVERAGE',
  'REAL ESTATE',
  'INDUSTRIES',
  'FINANCE',
  'CONSUMER CATEGORIES',
  'WEB3',
  'HOSPITALITY'
];

const addCategories = async () => {
  try {
    console.log('🚀 Starting to add new categories to database...');

    let totalCategoriesCreated = 0;

    for (const categoryName of newCategories) {
      try {
        const [category, created] = await Category.findOrCreate({
          where: { name: categoryName },
          defaults: {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            type: 'main'
          }
        });

        if (created) {
          console.log(`   ✅ Created category: ${categoryName}`);
          totalCategoriesCreated++;
        } else {
          console.log(`   ⏭️  Category already exists: ${categoryName}`);
        }
      } catch (error) {
        console.log(`   ❌ Error creating category "${categoryName}": ${error.message}`);
      }
    }

    console.log(`\n🎉 Category creation completed!`);
    console.log(`📊 Total categories created: ${totalCategoriesCreated}`);

    // Verify final count
    const allCategories = await Category.findAll();
    console.log(`📈 Total categories in database: ${allCategories.length}`);

  } catch (error) {
    console.error('❌ Error adding categories:', error);
    throw error;
  }
};

// Run the script
addCategories()
  .then(() => {
    console.log('\n✅ New categories addition process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ New categories addition failed:', error);
    process.exit(1);
  });