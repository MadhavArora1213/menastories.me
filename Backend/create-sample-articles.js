const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/db');
const { v4: uuidv4 } = require('uuid');

// Initialize models
require('./models');

// Sample articles data
const sampleArticles = [
  {
    id: uuidv4(),
    title: 'Breaking: Major Tech Companies Announce Partnership for AI Development',
    slug: 'breaking-tech-companies-ai-partnership',
    excerpt: 'Leading technology firms join forces to accelerate artificial intelligence research and development, marking a new era of collaboration in the tech industry.',
    content: 'In a groundbreaking move that could reshape the future of artificial intelligence, major technology companies have announced a comprehensive partnership aimed at advancing AI research and development. This unprecedented collaboration brings together industry leaders to tackle some of the most pressing challenges in AI development, including ethical considerations, safety protocols, and technological innovation.',
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'published',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: uuidv4(), // Required field for Article model - generate UUID
    authorId: null, // Will be set to first available author or create one
    categoryId: 'dd3ee7e2-a4ca-4293-856a-af3bfe8abc87', // News Content category
    readTime: '5 min read'
  },
  {
    id: uuidv4(),
    title: 'Economic Recovery Shows Strong Signs as Employment Rates Surge',
    slug: 'economic-recovery-employment-surge',
    excerpt: 'Latest economic indicators reveal significant improvement in employment rates across major sectors, signaling robust recovery from recent challenges.',
    content: 'Economic analysts are reporting unprecedented growth in employment rates across key industries, with unemployment figures dropping to their lowest levels in over a decade. This positive trend is being attributed to strategic government policies, increased business confidence, and growing consumer spending power.',
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'published',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    authorId: null,
    categoryId: 'dd3ee7e2-a4ca-4293-856a-af3bfe8abc87',
    readTime: '4 min read'
  },
  {
    id: uuidv4(),
    title: 'Climate Change Summit Reaches Historic Agreement on Carbon Reduction',
    slug: 'climate-summit-carbon-reduction-agreement',
    excerpt: 'World leaders unite on ambitious carbon reduction targets, setting new global standards for environmental protection and sustainable development.',
    content: 'In a landmark decision that could define the future of environmental policy, world leaders have reached a comprehensive agreement on carbon reduction targets. The new framework establishes binding commitments for major economies to reduce greenhouse gas emissions by 50% over the next decade, with significant investments planned for renewable energy infrastructure.',
    featuredImage: 'https://images.unsplash.com/photo-1569163139394-de44cb3c4b0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'published',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    authorId: null,
    categoryId: 'dd3ee7e2-a4ca-4293-856a-af3bfe8abc87',
    readTime: '6 min read'
  },
  {
    id: uuidv4(),
    title: 'Healthcare Innovation: New Treatment Shows Promise for Chronic Conditions',
    slug: 'healthcare-innovation-chronic-conditions-treatment',
    excerpt: 'Medical researchers announce breakthrough treatment that could revolutionize care for millions suffering from chronic illnesses worldwide.',
    content: 'A groundbreaking medical study has revealed promising results for a new treatment approach that could significantly improve outcomes for patients with chronic conditions. The innovative therapy, which combines traditional medicine with cutting-edge biotechnology, has shown remarkable success rates in clinical trials, offering hope to millions of patients worldwide.',
    featuredImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'published',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    authorId: null,
    categoryId: 'dd3ee7e2-a4ca-4293-856a-af3bfe8abc87',
    readTime: '5 min read'
  }
];

async function createSampleArticles() {
  try {
    console.log('🚀 Starting sample articles creation...');

    // Check if we need to create a sample admin user for createdBy
    const Admin = sequelize.models.Admin;
    const Author = sequelize.models.Author;
    const Article = sequelize.models.Article;
    const ArticleCategory = sequelize.models.ArticleCategory;

    let admin = await Admin.findOne();
    if (!admin) {
      console.log('📝 Creating sample admin user...');
      admin = await Admin.create({
        id: uuidv4(),
        username: 'admin',
        email: 'admin@magazine.com',
        password: 'password123', // In production, this should be hashed
        roleId: null, // Will be set if roles exist
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Sample admin user created');
    }

    let author = await Author.findOne();
    if (!author) {
      console.log('📝 Creating sample author...');
      author = await Author.create({
        id: uuidv4(),
        name: 'Editorial Team',
        email: 'editorial@magazine.com',
        bio: 'The editorial team brings you the latest news and insights.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Sample author created');
    }

    // Update articles with the author ID and admin ID for createdBy
    sampleArticles.forEach(article => {
      article.authorId = author.id;
      article.createdBy = admin.id;
    });

    console.log('📊 Creating sample articles...');

    // Create articles
    for (const articleData of sampleArticles) {
      const article = await Article.create(articleData);
      console.log(`✅ Created article: ${article.title}`);

      // Create the article-category relationship
      await ArticleCategory.create({
        id: uuidv4(),
        articleId: article.id,
        categoryId: articleData.categoryId
      });
      console.log(`🔗 Linked article to News Content category`);
    }

    console.log('🎉 Sample articles creation completed successfully!');
    console.log(`📈 Created ${sampleArticles.length} articles in News Content category`);

  } catch (error) {
    console.error('❌ Error creating sample articles:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the script
createSampleArticles()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });