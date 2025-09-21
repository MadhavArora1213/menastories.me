const { Category, Tag } = require('../models');

const generateSlug = (name, category = '') => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // If category is provided and it's a subcategory, include category in slug
  if (category && category !== 'Main Category') {
    const categorySlug = category
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `${baseSlug}-${categorySlug}`;
  }

  return baseSlug;
};

const categoriesData = [
  {
    name: 'PEOPLE & PROFILES',
    tags: [
      'celebrity-profile',
      'influencer-life',
      'business-leaders',
      'entrepreneurs',
      'changemakers',
      'rising-stars',
      'thought-leaders',
      'global-icons',
      'local-heroes',
      'inspiring-stories',
      'youth-leaders',
      'media-personalities',
      'role-models',
      'women-leaders',
      'industry-innovators',
      'philanthropists',
      'cultural-icons',
      'power-couples',
      'sports-legends',
      'political-figures'
    ]
  },
  {
    name: 'ENTERTAINMENT',
    tags: [
      'bollywood',
      'hollywood',
      'tollywood',
      'movie-reviews',
      'film-trailers',
      'celebrity-interviews',
      'tv-series',
      'web-series',
      'streaming-platforms',
      'music-artists',
      'album-releases',
      'award-shows',
      'red-carpet',
      'box-office',
      'behind-the-scenes',
      'film-festivals',
      'dance-shows',
      'comedy-specials',
      'theatre-plays',
      'fan-culture'
    ]
  },
  {
    name: 'LIFESTYLE',
    tags: [
      'fashion-trends',
      'runway-shows',
      'street-style',
      'beauty-tips',
      'skincare-tips',
      'makeup-tutorials',
      'wellness',
      'fitness-goals',
      'healthy-diets',
      'food-recipes',
      'gourmet-food',
      'travel-destinations',
      'budget-travel',
      'luxury-travel',
      'home-decor',
      'interior-design',
      'relationships',
      'dating-advice',
      'parenting-guide',
      'family-life'
    ]
  },
  {
    name: 'CULTURE & SOCIETY',
    tags: [
      'art-exhibitions',
      'modern-art',
      'photography',
      'books',
      'literature',
      'poetry',
      'authors',
      'cultural-events',
      'heritage',
      'traditions',
      'social-issues',
      'activism',
      'pop-culture',
      'memes',
      'youth-culture',
      'digital-trends',
      'online-communities',
      'festivals',
      'cinema-history',
      'cultural-diversity'
    ]
  },
  {
    name: 'BUSINESS & LEADERSHIP',
    tags: [
      'startups',
      'unicorns',
      'women-in-business',
      'corporate-news',
      'leadership',
      'ceo-insights',
      'industry-trends',
      'economic-trends',
      'stock-market',
      'investments',
      'personal-finance',
      'money-management',
      'entrepreneurship',
      'business-strategy',
      'innovation',
      'career-growth',
      'workplace-culture',
      'hr-trends',
      'global-business',
      'financial-planning'
    ]
  },
  {
    name: 'REGIONAL FOCUS',
    tags: [
      'uae-news',
      'dubai-events',
      'abu-dhabi',
      'sharjah-culture',
      'ras-al-khaimah',
      'uae-tourism',
      'local-business',
      'real-estate',
      'government-updates',
      'economic-zone',
      'cultural-festivals',
      'expo-dubai',
      'national-day',
      'uae-heritage',
      'food-festivals',
      'tourism-attractions',
      'community-heroes',
      'emirates-leaders',
      'uae-sports',
      'technology-in-uae'
    ]
  },
  {
    name: 'SPECIAL SECTIONS',
    tags: [
      'power-list',
      'top-doctors',
      '30-under-30',
      '40-under-40',
      'women-leaders',
      'rising-entrepreneurs',
      'social-impact',
      'change-agents',
      'most-influential',
      'business-awards',
      'annual-awards',
      'healthcare-leaders',
      'innovators',
      'game-changers',
      'sustainability-leaders',
      'cultural-icons',
      'philanthropy-awards',
      'thought-leaders',
      'youth-awards',
      'legacy-builders'
    ]
  }
];

const addTags = async () => {
  try {
    console.log('🚀 Starting to add 140 tags to PostgreSQL...');

    let totalTagsCreated = 0;

    // Process each category and its tags
    for (const categoryData of categoriesData) {
      console.log(`\n📂 Processing category: ${categoryData.name}`);

      // Find the category in database
      const category = await Category.findOne({
        where: { name: categoryData.name }
      });

      if (!category) {
        console.log(`⚠️  Category "${categoryData.name}" not found, skipping...`);
        continue;
      }

      console.log(`   Found category ID: ${category.id}`);

      // Add tags for this category
      for (const tagName of categoryData.tags) {
        try {
          const [tag, created] = await Tag.findOrCreate({
            where: { slug: generateSlug(tagName) },
            defaults: {
              name: tagName,
              slug: generateSlug(tagName),
              type: 'regular',
              category: categoryData.name,
              categoryId: category.id
            }
          });

          if (created) {
            console.log(`   ✅ Created tag: ${tagName}`);
            totalTagsCreated++;
          } else {
            console.log(`   ⏭️  Tag already exists: ${tagName}`);
          }
        } catch (tagError) {
          console.log(`   ❌ Error creating tag "${tagName}": ${tagError.message}`);
        }
      }
    }

    console.log(`\n🎉 Tag creation completed!`);
    console.log(`📊 Total tags created: ${totalTagsCreated}`);

    // Verify final count
    const allTags = await Tag.findAll();
    console.log(`📈 Total tags in database: ${allTags.length}`);

    // Group by category
    const categoryCounts = {};
    for (const tag of allTags) {
      const catName = tag.category || 'Uncategorized';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    }

    console.log(`\n📋 Tags by category:`);
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   • ${cat}: ${count} tags`);
    });

  } catch (error) {
    console.error('❌ Error adding tags:', error);
    throw error;
  }
};

// Run the script
addTags()
  .then(() => {
    console.log('\n✅ 140 tags addition process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 140 tags addition failed:', error);
    process.exit(1);
  });