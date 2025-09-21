const { Article, Category, Tag, Admin, sequelize } = require('../models');

const seedBasicData = async () => {
  try {
    console.log('Starting basic data seeding...');

    // Get existing admin user
    const admin = await Admin.findOne({ where: { username: 'admin' } });
    if (!admin) {
      console.log('Admin user not found. Please run initializeDb.js first.');
      return;
    }

    // Create sample categories
    const categories = [
      {
        id: 'cat-001',
        name: 'Technology',
        slug: 'technology',
        description: 'Latest technology news and trends',
        status: 'active'
      },
      {
        id: 'cat-002',
        name: 'Business',
        slug: 'business',
        description: 'Business news and market updates',
        status: 'active'
      },
      {
        id: 'cat-003',
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Movies, music, and celebrity news',
        status: 'active'
      },
      {
        id: 'cat-004',
        name: 'Sports',
        slug: 'sports',
        description: 'Sports news and updates',
        status: 'active'
      }
    ];

    for (const category of categories) {
      await Category.upsert(category);
    }

    console.log('✓ Categories created');

    // Create sample tags
    const tags = [
      {
        id: 'tag-001',
        name: 'AI',
        slug: 'ai',
        type: 'topic',
        description: 'Artificial Intelligence'
      },
      {
        id: 'tag-002',
        name: 'Innovation',
        slug: 'innovation',
        type: 'topic',
        description: 'Technological innovation'
      },
      {
        id: 'tag-003',
        name: 'Market Analysis',
        slug: 'market-analysis',
        type: 'content_type',
        description: 'Market analysis and insights'
      },
      {
        id: 'tag-004',
        name: 'Celebrity',
        slug: 'celebrity',
        type: 'topic',
        description: 'Celebrity news and gossip'
      },
      {
        id: 'tag-005',
        name: 'Football',
        slug: 'football',
        type: 'topic',
        description: 'Football news and updates'
      },
      {
        id: 'tag-006',
        name: 'Breaking News',
        slug: 'breaking-news',
        type: 'content_type',
        description: 'Breaking news stories'
      }
    ];

    for (const tag of tags) {
      await Tag.upsert(tag);
    }

    console.log('✓ Tags created');

    // Create sample articles without categoryId (will use junction table later)
    const articles = [
      {
        id: 'art-001',
        title: 'The Future of Artificial Intelligence in 2024',
        subtitle: 'Exploring the latest developments in AI technology',
        slug: 'future-artificial-intelligence-2024',
        content: `
          <h2>The Rise of AI Technology</h2>
          <p>Artificial Intelligence continues to transform industries across the globe. From healthcare to finance, AI systems are becoming increasingly sophisticated and capable of handling complex tasks that were once thought to be exclusively human domains.</p>

          <h3>Machine Learning Breakthroughs</h3>
          <p>Recent breakthroughs in machine learning have enabled AI systems to process and analyze vast amounts of data with unprecedented accuracy. Deep learning algorithms are now capable of recognizing patterns and making predictions with remarkable precision.</p>

          <h3>Impact on Employment</h3>
          <p>While some fear that AI will displace human workers, experts argue that it will primarily augment human capabilities rather than replace them entirely. The focus is shifting towards human-AI collaboration.</p>

          <h3>Ethical Considerations</h3>
          <p>As AI becomes more powerful, ethical considerations become increasingly important. Issues around bias, privacy, and accountability must be addressed to ensure responsible AI development.</p>
        `,
        excerpt: 'Artificial Intelligence continues to transform industries across the globe, bringing both opportunities and challenges.',
        status: 'published',
        authorId: admin.id,
        publishDate: new Date('2024-08-25'),
        metaTitle: 'The Future of AI in 2024 - Latest Developments',
        metaDescription: 'Explore the latest developments in artificial intelligence technology and its impact on various industries.',
        keywords: 'AI, artificial intelligence, machine learning, technology, future',
        featured: true,
        viewCount: 1250,
        likeCount: 89,
        shareCount: 34
      },
      {
        id: 'art-002',
        title: 'Market Trends: Tech Stocks Surge Amid Economic Recovery',
        subtitle: 'Analysis of current market conditions and future projections',
        slug: 'market-trends-tech-stocks-surge',
        content: `
          <h2>Technology Sector Performance</h2>
          <p>The technology sector has shown remarkable resilience in the face of economic challenges. Major tech companies have reported strong quarterly earnings, driving stock prices to new highs.</p>

          <h3>Key Drivers</h3>
          <p>Several factors are contributing to the tech sector's strong performance:</p>
          <ul>
            <li>Increased demand for cloud computing services</li>
            <li>Growth in e-commerce and digital transformation</li>
            <li>Strong performance in semiconductor manufacturing</li>
            <li>Rising adoption of AI and machine learning technologies</li>
          </ul>

          <h3>Investment Strategies</h3>
          <p>Investors are increasingly focusing on companies with strong fundamentals and innovative product pipelines. Diversification across different tech sub-sectors remains a key strategy.</p>
        `,
        excerpt: 'The technology sector shows strong performance with major companies reporting impressive earnings and stock price gains.',
        status: 'published',
        authorId: admin.id,
        publishDate: new Date('2024-08-24'),
        metaTitle: 'Tech Stocks Surge - Market Analysis 2024',
        metaDescription: 'Comprehensive analysis of technology sector performance and market trends.',
        keywords: 'technology stocks, market analysis, investment, economy',
        featured: false,
        viewCount: 890,
        likeCount: 45,
        shareCount: 22
      },
      {
        id: 'art-003',
        title: 'Celebrity Spotlight: Rising Stars of 2024',
        subtitle: 'Meet the young talents making waves in entertainment',
        slug: 'celebrity-spotlight-rising-stars-2024',
        content: `
          <h2>Emerging Talent in Entertainment</h2>
          <p>The entertainment industry continues to discover and nurture new talent. This year's rising stars are bringing fresh perspectives and innovative approaches to their craft.</p>

          <h3>Breakthrough Performances</h3>
          <p>Several young actors and musicians have delivered standout performances this year, earning critical acclaim and commercial success.</p>

          <h3>Social Media Influence</h3>
          <p>Today's celebrities are leveraging social media platforms to connect directly with their fans, building personal brands that extend beyond traditional entertainment.</p>

          <h3>Industry Impact</h3>
          <p>These rising stars are not just entertainers; they're influencers shaping cultural trends and driving conversations about important social issues.</p>
        `,
        excerpt: 'Discover the rising stars who are making significant impacts in the entertainment industry this year.',
        status: 'published',
        authorId: admin.id,
        publishDate: new Date('2024-08-23'),
        metaTitle: 'Rising Stars of 2024 - Celebrity Spotlight',
        metaDescription: 'Meet the young talents making waves in entertainment and shaping cultural trends.',
        keywords: 'celebrity, entertainment, rising stars, actors, musicians',
        featured: false,
        viewCount: 650,
        likeCount: 78,
        shareCount: 45
      },
      {
        id: 'art-004',
        title: 'Championship Finals: Epic Showdown Expected',
        subtitle: 'Football fans prepare for the most anticipated match of the season',
        slug: 'championship-finals-epic-showdown',
        content: `
          <h2>The Biggest Game of the Season</h2>
          <p>As the championship finals approach, football fans around the world are preparing for what promises to be an unforgettable showdown between two powerhouse teams.</p>

          <h3>Team Analysis</h3>
          <p>Both teams bring unique strengths to the field. The offensive firepower of one team matches perfectly against the defensive solidity of the other, setting up a tactical battle of epic proportions.</p>

          <h3>Player Spotlight</h3>
          <p>Key players from both sides are in peak form, with star athletes ready to make their mark on this prestigious competition.</p>

          <h3>Fan Expectations</h3>
          <p>The atmosphere around the championship is electric, with fans from both sides creating an incredible spectacle that transcends the sport itself.</p>
        `,
        excerpt: 'Football fans worldwide are gearing up for the championship finals, promising an epic showdown between two elite teams.',
        status: 'published',
        authorId: admin.id,
        publishDate: new Date('2024-08-22'),
        metaTitle: 'Championship Finals - Epic Football Showdown',
        metaDescription: 'Coverage of the championship finals featuring the most anticipated football match of the season.',
        keywords: 'football, championship, finals, sports, competition',
        featured: true,
        viewCount: 1200,
        likeCount: 156,
        shareCount: 89
      },
      {
        id: 'art-005',
        title: 'Breaking: Major Tech Merger Announced',
        subtitle: 'Industry-shaking merger could reshape the technology landscape',
        slug: 'breaking-major-tech-merger-announced',
        content: `
          <h2>Historic Merger in Tech Industry</h2>
          <p>In a move that could fundamentally reshape the technology industry, two major players have announced a historic merger that combines complementary strengths and creates new opportunities.</p>

          <h3>Strategic Rationale</h3>
          <p>The merger brings together cutting-edge AI capabilities with extensive cloud infrastructure, creating a comprehensive technology platform that serves enterprises worldwide.</p>

          <h3>Market Impact</h3>
          <p>Industry analysts predict this merger will accelerate innovation and create new competitive dynamics in the tech sector.</p>

          <h3>Regulatory Considerations</h3>
          <p>The merger is subject to regulatory approval and is expected to undergo extensive review by antitrust authorities.</p>
        `,
        excerpt: 'A historic merger between two major technology companies could reshape the industry landscape and create new opportunities.',
        status: 'published',
        authorId: admin.id,
        publishDate: new Date('2024-08-21'),
        metaTitle: 'Major Tech Merger Announced - Breaking News',
        metaDescription: 'Breaking news coverage of a historic merger that could reshape the technology industry.',
        keywords: 'technology merger, breaking news, industry, business',
        featured: true,
        viewCount: 2100,
        likeCount: 234,
        shareCount: 156
      }
    ];

    for (const article of articles) {
      await Article.upsert(article);
    }

    console.log('✓ Articles created');

    // Verify the data
    const articleCount = await Article.count();
    const categoryCount = await Category.count();
    const tagCount = await Tag.count();

    console.log('\n=== Seeding Summary ===');
    console.log(`Articles created: ${articleCount}`);
    console.log(`Categories created: ${categoryCount}`);
    console.log(`Tags created: ${tagCount}`);
    console.log('\nBasic data seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding basic data:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection established successfully.');
      return seedBasicData();
    })
    .then(() => {
      console.log('Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedBasicData;