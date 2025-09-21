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
    name: 'NEWS CONTENT',
    tags: [
      '#BreakingNews',
      '#Trending',
      '#Exclusive',
      '#Interview',
      '#BehindTheScenes',
      '#Analysis',
      '#Opinion',
      '#Editorial',
      '#Report',
      '#Top100',
      '#PowerList',
      '#EditorPick'
    ]
  },
  {
    name: 'GEOGRAPHIC COVERAGE',
    tags: [
      '#GlobalImpact',
      '#RegionalFocus',
      '#CountrySpotlight',
      '#LocalNews',
      '#CrossBorder',
      '#EmergingMarkets',
      '#GlobalTrends'
    ]
  },
  {
    name: 'REAL ESTATE',
    tags: [
      '#Residential',
      '#Commercial',
      '#Industrial',
      '#LuxuryLiving',
      '#SmartHomes',
      '#PropertyTech',
      '#MarketTrends',
      '#Investments'
    ]
  },
  {
    name: 'INDUSTRIES',
    tags: [
      '#Innovation',
      '#TechTrends',
      '#StartupLife',
      '#Entrepreneurship',
      '#WomenInLeadership',
      '#Sustainability',
      '#GreenFuture',
      '#MarketMovers',
      '#IndustryInsights',
      '#FutureOfWork',
      '#Trailblazer'
    ]
  },
  {
    name: 'FINANCE',
    tags: [
      '#Finance',
      '#Banking',
      '#Fintech',
      '#CapitalMarkets',
      '#Investors',
      '#PrivateEquity',
      '#VentureCapital',
      '#HedgeFunds',
      '#IPO',
      '#FundingRounds',
      '#SeriesA',
      '#SeriesB',
      '#SeriesC'
    ]
  },
  {
    name: 'CONSUMER CATEGORIES',
    tags: [
      '#Inspiration',
      '#Lifestyle',
      '#Luxury',
      '#HealthFirst',
      '#Wellbeing',
      '#YoungLeaders',
      '#GenerationalTrends',
      '#DiversityMatters',
      '#ConsumerBehavior',
      '#SuccessStories'
    ]
  },
  {
    name: 'WEB3',
    tags: [
      '#Blockchain',
      '#Crypto',
      '#NFTs',
      '#DeFi',
      '#DAOs',
      '#SmartContracts',
      '#Web3Gaming',
      '#Metaverse',
      '#Tokenization',
      '#Layer1',
      '#Layer2',
      '#DigitalAssets'
    ]
  },
  {
    name: 'HOSPITALITY',
    tags: [
      '#Travel',
      '#Tourism',
      '#Hotels',
      '#LuxuryTravel',
      '#FoodAndDining',
      '#HospitalityTech',
      '#EventHighlights',
      '#Resorts',
      '#Cruises',
      '#GuestExperience',
      '#CultureShift'
    ]
  }
];

const addTags = async () => {
  try {
    console.log('🚀 Starting to add new tags to database...');

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
    console.log('\n✅ New tags addition process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ New tags addition failed:', error);
    process.exit(1);
  });