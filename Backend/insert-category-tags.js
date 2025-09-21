require('dotenv').config();
const { Category, Tag } = require('./models');
const sequelize = require('./config/db');

// Tags mapped to categories
const categoryTags = {
  'News Content': [
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
  ],
  'Geographic Coverage': [
    '#GlobalImpact',
    '#RegionalFocus',
    '#CountrySpotlight',
    '#LocalNews',
    '#CrossBorder',
    '#EmergingMarkets',
    '#GlobalTrends'
  ],
  'Real Estate': [
    '#Residential',
    '#Commercial',
    '#Industrial',
    '#LuxuryLiving',
    '#SmartHomes',
    '#PropertyTech',
    '#MarketTrends',
    '#Investments'
  ],
  'Industries': [
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
  ],
  'Finance': [
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
  ],
  'Consumer Categories': [
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
  ],
  'Web3': [
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
  ],
  'Hospitality': [
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
};

// Helper function to generate slug
function generateSlug(name, existingSlugs = new Set()) {
  // Remove the # prefix for slug generation
  let baseSlug = name.replace(/^#/, '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();

  let slug = baseSlug;
  let counter = 1;

  // If slug already exists, append a counter
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  existingSlugs.add(slug);
  return slug;
}

async function insertCategoryTags() {
  try {
    console.log('🔄 Connecting to database...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Get all categories
      const categories = await Category.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
        transaction
      });

      console.log(`📂 Found ${categories.length} categories in database`);

      // Create a mapping from category name to ID
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });

      // Track existing slugs to avoid duplicates
      const existingSlugs = new Set();

      // Get existing tags to avoid duplicates
      const existingTags = await Tag.findAll({
        attributes: ['slug'],
        transaction
      });

      existingTags.forEach(tag => existingSlugs.add(tag.slug));

      console.log('\n📝 Inserting tags mapped to categories...');

      let totalTagsInserted = 0;

      // Process each category's tags
      for (const [categoryName, tags] of Object.entries(categoryTags)) {
        const categoryId = categoryMap[categoryName];

        if (!categoryId) {
          console.log(`⚠️  Category "${categoryName}" not found, skipping its tags`);
          continue;
        }

        console.log(`\n🏷️  Processing tags for category: ${categoryName}`);

        const tagsToInsert = [];

        for (const tagName of tags) {
          const slug = generateSlug(tagName, existingSlugs);

          tagsToInsert.push({
            name: tagName,
            slug: slug,
            type: 'regular',
            category: categoryName,
            categoryId: categoryId,
            description: `Tag for ${categoryName} category`
          });
        }

        // Bulk insert tags for this category
        if (tagsToInsert.length > 0) {
          await Tag.bulkCreate(tagsToInsert, { transaction });
          console.log(`✅ Inserted ${tagsToInsert.length} tags for ${categoryName}`);
          totalTagsInserted += tagsToInsert.length;
        }
      }

      // Commit transaction
      await transaction.commit();

      console.log('\n📊 SUMMARY:');
      console.log(`Tags inserted: ${totalTagsInserted}`);
      console.log('✅ Category tags mapping completed successfully!');

      // Show final counts
      const finalTagCount = await Tag.count();
      console.log(`Total tags in database: ${finalTagCount}`);

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error inserting category tags:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
if (require.main === module) {
  insertCategoryTags().catch(console.error);
}

module.exports = { insertCategoryTags };