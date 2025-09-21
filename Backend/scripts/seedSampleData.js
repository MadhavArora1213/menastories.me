const { Author, Article, Category, Subcategory, Tag, Admin } = require('../models');
const sequelize = require('../config/db');

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...');

    // Get existing authors and admins
    const authors = await Author.findAll({ limit: 3 });
    const admins = await Admin.findAll({ limit: 3 });

    if (authors.length === 0) {
      console.log('⚠️  No authors found. Please create authors first.');
      return;
    }

    if (admins.length === 0) {
      console.log('⚠️  No admins found. Please create admins first.');
      return;
    }

    console.log('✅ Found existing authors and admins');

    // Get existing categories and subcategories
    const categories = await Category.findAll({ limit: 2 });
    const subcategories = await Subcategory.findAll({ limit: 2 });

    if (categories.length === 0 || subcategories.length === 0) {
      console.log('⚠️  No categories/subcategories found. Please seed them first.');
      return;
    }

    // Create sample articles
    const articles = await Article.bulkCreate([
      {
        title: 'The Future of Artificial Intelligence in Healthcare',
        subtitle: 'How AI is revolutionizing medical diagnosis and treatment',
        slug: 'future-ai-healthcare',
        content: 'Artificial Intelligence is transforming healthcare at an unprecedented pace...',
        status: 'published',
        categoryId: categories[0].id,
        subcategoryId: subcategories[0].id,
        authorId: admins[0].id,
        featured: true,
        heroSlider: true,
        trending: true,
        allowComments: true,
        publishDate: new Date(),
        metaTitle: 'AI in Healthcare: Revolutionizing Medical Diagnosis',
        metaDescription: 'Explore how artificial intelligence is transforming healthcare delivery and medical outcomes.'
      },
      {
        title: 'Building Resilient Startups in Uncertain Times',
        subtitle: 'Strategies for entrepreneurs navigating economic challenges',
        slug: 'resilient-startups-uncertain-times',
        content: 'In today\'s volatile business environment, startup resilience is crucial...',
        status: 'published',
        categoryId: categories[1]?.id || categories[0].id,
        subcategoryId: subcategories[1]?.id || subcategories[0].id,
        authorId: admins[1]?.id || admins[0].id,
        featured: false,
        heroSlider: false,
        trending: true,
        allowComments: true,
        publishDate: new Date(Date.now() - 86400000), // Yesterday
        metaTitle: 'Building Resilient Startups: Strategies for Success',
        metaDescription: 'Learn essential strategies for startup founders to navigate economic uncertainty and build sustainable businesses.'
      }
    ]);

    console.log('✅ Created sample articles');

    // Associate authors with articles
    await articles[0].setAuthors([authors[0].id, authors[2].id]); // Multiple authors for first article
    await articles[1].setAuthors([authors[1].id]);

    console.log('✅ Associated authors with articles');
    console.log('🎉 Sample data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  sequelize.sync()
    .then(() => seedSampleData())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Database sync failed:', error);
      process.exit(1);
    });
}

module.exports = seedSampleData;