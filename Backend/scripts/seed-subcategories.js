const { Category, Subcategory } = require('../models');
const slugify = require('slugify');

const subcategoriesData = {
  // PEOPLE & PROFILES (8 subcategories)
  'PEOPLE & PROFILES': [
    'Celebrity Spotlight',
    'Influencer Stories',
    'Business Leaders',
    'Changemakers',
    'International Icons',
    'Local Personalities',
    'Rising Stars',
    'Women Leaders'
  ],

  // ENTERTAINMENT (9 subcategories)
  'ENTERTAINMENT': [
    'Bollywood News',
    'Hollywood Updates',
    'Movie Reviews',
    'TV Shows & Series',
    'Music & Artists',
    'Award Shows',
    'Red Carpet Events',
    'Celebrity Interviews',
    'Behind the Scenes'
  ],

  // LIFESTYLE (8 subcategories)
  'LIFESTYLE': [
    'Fashion & Style',
    'Health & Wellness',
    'Food & Recipes',
    'Travel & Destinations',
    'Home & Decor',
    'Parenting & Family',
    'Beauty & Skincare',
    'Relationships & Dating'
  ],

  // CULTURE & SOCIETY (8 subcategories)
  'CULTURE & SOCIETY': [
    'Books & Literature',
    'Cultural Events',
    'Heritage & Traditions',
    'Pop Culture',
    'Digital Trends',
    'Social Issues',
    'Art & Photography',
    'Youth Culture'
  ],

  // BUSINESS & LEADERSHIP (8 subcategories)
  'BUSINESS & LEADERSHIP': [
    'Corporate News',
    'Economic Trends',
    'Leadership Insights',
    'Startup Stories',
    'Money & Finance',
    'Career Advice',
    'Industry Leaders',
    'Women in Business'
  ],

  // REGIONAL FOCUS (8 subcategories)
  'REGIONAL FOCUS': [
    'Local Events',
    'Community Heroes',
    'Cultural Festivals',
    'Government News',
    'Business Hub',
    'Tourism & Attractions',
    'UAE Spotlight',
    'Local Personalities'
  ],

  // SPECIAL SECTIONS (7 subcategories)
  'SPECIAL SECTIONS': [
    'Annual Awards',
    'Most Influential',
    'Power Lists (30 Under 30, 40 Under 40)',
    'Rising Entrepreneurs',
    'Top Doctors',
    'Social Impact Leaders',
    'Women Leaders'
  ]
};

async function seedSubcategories() {
  try {
    console.log('🌱 Starting subcategory seeding...');

    // Get all categories
    const categories = await Category.findAll();
    console.log(`📂 Found ${categories.length} categories`);

    let totalCreated = 0;

    for (const category of categories) {
      const categoryName = category.name.toUpperCase();
      const subcategories = subcategoriesData[categoryName];

      if (subcategories && subcategories.length > 0) {
        console.log(`\n📝 Processing category: ${category.name} (${subcategories.length} subcategories)`);

        for (let i = 0; i < subcategories.length; i++) {
          const subcategoryName = subcategories[i];

          // Check if subcategory already exists
          const existingSubcategory = await Subcategory.findOne({
            where: {
              name: subcategoryName,
              categoryId: category.id
            }
          });

          if (!existingSubcategory) {
            // Generate unique slug by checking for duplicates
            let slug = slugify(subcategoryName, { lower: true, strict: true });
            let counter = 1;
            let originalSlug = slug;

            // Check if slug already exists and make it unique
            while (await Subcategory.findOne({ where: { slug } })) {
              slug = `${originalSlug}-${counter}`;
              counter++;
            }

            await Subcategory.create({
              name: subcategoryName,
              slug: slug,
              description: `Articles and content related to ${subcategoryName.toLowerCase()}`,
              categoryId: category.id,
              type: 'regular',
              status: 'active',
              order: i + 1,
              isActive: true
            });

            console.log(`  ✅ Created: ${subcategoryName}`);
            totalCreated++;
          } else {
            console.log(`  ⏭️  Skipped (exists): ${subcategoryName}`);
          }
        }
      }
    }

    console.log(`\n🎉 Subcategory seeding completed!`);
    console.log(`📊 Total subcategories created: ${totalCreated}`);

    // Verify the results
    const allSubcategories = await Subcategory.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }]
    });

    console.log(`\n📈 Final count:`);
    console.log(`   • Total subcategories: ${allSubcategories.length}`);

    // Group by category for verification
    const categoryCounts = {};
    allSubcategories.forEach(sub => {
      const catName = sub.category?.name || 'Unknown';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    console.log(`   • By category:`);
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`     - ${cat}: ${count} subcategories`);
    });

  } catch (error) {
    console.error('❌ Error seeding subcategories:', error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedSubcategories()
    .then(() => {
      console.log('\n✅ Subcategory seeding process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Subcategory seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSubcategories };