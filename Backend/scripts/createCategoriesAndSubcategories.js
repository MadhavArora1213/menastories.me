const { Category, Tag } = require('../models');

const categoriesData = [
  {
    name: 'PEOPLE & PROFILES',
    description: 'Comprehensive personality coverage spanning entertainment figures to business innovators',
    subcategories: [
      'Celebrity Spotlight',
      'Influencer Stories',
      'Business Leaders',
      'Rising Stars',
      'Local Personalities',
      'International Icons',
      'Changemakers',
      'Entrepreneurs'
    ]
  },
  {
    name: 'ENTERTAINMENT',
    description: 'Complete entertainment industry coverage from film and television to music and celebrity culture',
    subcategories: [
      'Bollywood News',
      'Hollywood Updates',
      'TV Shows & Series',
      'Music & Artists',
      'Movie Reviews',
      'Red Carpet Events',
      'Award Shows',
      'Celebrity Interviews',
      'Behind the Scenes'
    ]
  },
  {
    name: 'LIFESTYLE',
    description: 'Diverse lifestyle content covering personal interests from fashion trends to family guidance',
    subcategories: [
      'Fashion & Style',
      'Beauty & Skincare',
      'Health & Wellness',
      'Food & Recipes',
      'Travel & Destinations',
      'Home & Decor',
      'Relationships & Dating',
      'Parenting & Family'
    ]
  },
  {
    name: 'CULTURE & SOCIETY',
    description: 'Cultural exploration encompassing artistic expression, social commentary, and contemporary trends',
    subcategories: [
      'Art & Photography',
      'Books & Literature',
      'Social Issues',
      'Cultural Events',
      'Heritage & Traditions',
      'Pop Culture',
      'Digital Trends',
      'Youth Culture'
    ]
  },
  {
    name: 'BUSINESS & LEADERSHIP',
    description: 'Professional focus on business innovation, leadership development, and financial guidance',
    subcategories: [
      'Industry Leaders',
      'Startup Stories',
      'Women in Business',
      'Corporate News',
      'Economic Trends',
      'Leadership Insights',
      'Career Advice',
      'Money & Finance'
    ]
  },
  {
    name: 'REGIONAL FOCUS',
    description: 'Local emphasis on UAE-specific content including community leaders and regional developments',
    subcategories: [
      'UAE Spotlight',
      'Local Events',
      'Community Heroes',
      'Government News',
      'Cultural Festivals',
      'Business Hub',
      'Tourism & Attractions',
      'Local Personalities'
    ]
  },
  {
    name: 'SPECIAL SECTIONS',
    description: 'Curated recognition content highlighting influential personalities across various sectors',
    subcategories: [
      'Power Lists (30 Under 30, 40 Under 40)',
      'Annual Awards',
      'Top Doctors',
      'Women Leaders',
      'Most Influential',
      'Rising Entrepreneurs',
      'Social Impact Leaders'
    ]
  }
];

const generateSlug = (name, category = '') => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // If category is provided, include it to avoid duplicates
  if (category) {
    const categorySlug = category
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/&/g, 'and')
      .trim();
    return `${baseSlug}-${categorySlug}`;
  }

  return baseSlug;
};

const createCategoriesAndSubcategories = async () => {
  const sequelize = require('../models').sequelize;
  const transaction = await sequelize.transaction();

  try {
    console.log('Starting to create categories and subcategories...');

    // Clear existing data within transaction
    await Tag.destroy({ where: {}, transaction });
    await Category.destroy({ where: {}, transaction });
    console.log('Cleared existing tags and categories.');

    // Create main categories
    const categoryMap = {};
    for (const categoryData of categoriesData) {
      const category = await Category.create({
        name: categoryData.name,
        slug: generateSlug(categoryData.name),
        description: categoryData.description,
        status: 'active',
        isActive: true
      }, { transaction });

      categoryMap[categoryData.name] = category.id;
      console.log(`✅ Created category: ${categoryData.name} with ID: ${category.id}`);
    }

    // Create subcategories as tags
    let totalSubcategories = 0;
    for (const categoryData of categoriesData) {
      const categoryId = categoryMap[categoryData.name];

      for (const subcategoryName of categoryData.subcategories) {
        await Tag.create({
          name: subcategoryName,
          slug: generateSlug(subcategoryName, categoryData.name),
          type: 'regular',
          category: categoryData.name,
          categoryId: categoryId
        }, { transaction });
        totalSubcategories++;
      }

      console.log(`✅ Created ${categoryData.subcategories.length} subcategories for ${categoryData.name}`);
    }

    // Commit the transaction
    await transaction.commit();

    console.log(`\n🎉 Successfully created:`);
    console.log(`   - ${categoriesData.length} main categories`);
    console.log(`   - ${totalSubcategories} subcategories`);
    console.log(`   - All properly linked with categoryId relationships`);

  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    console.error('❌ Error creating categories and subcategories:', error);
    process.exit(1);
  }
};

// Run the script
createCategoriesAndSubcategories().then(() => {
  console.log('\n✅ Categories and subcategories creation completed successfully!');
  process.exit(0);
});