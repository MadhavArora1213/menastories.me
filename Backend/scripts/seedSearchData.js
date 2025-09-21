const { SavedSearch, SearchAnalytics, User, Article } = require('../models');
const sequelize = require('../config/db');

const seedSearchData = async () => {
  try {
    await sequelize.sync();

    console.log('Seeding search data...');

    // Get existing users for realistic data
    const users = await User.findAll({ limit: 3 });
    const articles = await Article.findAll({ limit: 5 });

    // Create sample saved searches
    const savedSearches = [
      {
        userId: users[0]?.id || null,
        name: 'Breaking News Updates',
        query: 'breaking news',
        filters: {
          contentType: 'Breaking News',
          geographic: 'UAE',
          dateFrom: '2024-01-01'
        },
        resultCount: 15,
        isPublic: true,
        category: 'News',
        lastExecuted: new Date('2024-08-20')
      },
      {
        userId: users[1]?.id || null,
        name: 'Tech Industry Leaders',
        query: 'technology leaders',
        filters: {
          personality: 'Business Leaders',
          industry: 'Technology',
          contentType: 'Exclusive Interview'
        },
        resultCount: 8,
        isPublic: false,
        category: 'Technology',
        lastExecuted: new Date('2024-08-25')
      },
      {
        userId: users[2]?.id || null,
        name: 'Dubai Entertainment Events',
        query: 'entertainment events Dubai',
        filters: {
          geographic: 'Dubai',
          occasion: 'Awards Shows',
          industry: 'Entertainment'
        },
        resultCount: 12,
        isPublic: true,
        category: 'Entertainment',
        lastExecuted: new Date('2024-08-27')
      },
      {
        userId: null,
        name: 'Fashion Week Coverage',
        query: 'fashion week',
        filters: {
          occasion: 'Fashion Week',
          contentType: 'Photo Gallery',
          geographic: 'International'
        },
        resultCount: 20,
        isPublic: true,
        category: 'Fashion',
        lastExecuted: new Date('2024-08-26')
      }
    ];

    await SavedSearch.bulkCreate(savedSearches, { ignoreDuplicates: true });
    console.log('✓ Created sample saved searches');

    // Create sample search analytics
    const searchAnalytics = [
      {
        query: 'breaking news',
        userId: users[0]?.id || null,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        filters: {
          contentType: 'Breaking News',
          geographic: 'UAE'
        },
        resultCount: 15,
        clickedResults: [articles[0]?.id, articles[1]?.id],
        searchType: 'global',
        searchDuration: 245,
        createdAt: new Date('2024-08-27T10:30:00Z')
      },
      {
        query: 'technology',
        userId: users[1]?.id || null,
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        filters: {
          industry: 'Technology'
        },
        resultCount: 23,
        clickedResults: [articles[2]?.id],
        searchType: 'category',
        searchDuration: 189,
        createdAt: new Date('2024-08-27T11:15:00Z')
      },
      {
        query: 'dubai events',
        userId: null,
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        filters: {
          geographic: 'Dubai',
          occasion: 'Cultural Events'
        },
        resultCount: 18,
        clickedResults: [articles[3]?.id, articles[4]?.id],
        searchType: 'global',
        searchDuration: 312,
        createdAt: new Date('2024-08-27T12:45:00Z')
      },
      {
        query: 'fashion week 2024',
        userId: users[2]?.id || null,
        ipAddress: '192.168.1.4',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        filters: {
          occasion: 'Fashion Week',
          contentType: 'Photo Gallery'
        },
        resultCount: 31,
        clickedResults: [articles[0]?.id, articles[2]?.id, articles[4]?.id],
        searchType: 'global',
        searchDuration: 156,
        createdAt: new Date('2024-08-27T14:20:00Z')
      },
      {
        query: 'celebrities interview',
        userId: users[0]?.id || null,
        ipAddress: '192.168.1.5',
        userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
        filters: {
          personality: 'Celebrities',
          contentType: 'Exclusive Interview'
        },
        resultCount: 7,
        clickedResults: [articles[1]?.id],
        searchType: 'tag',
        searchDuration: 203,
        createdAt: new Date('2024-08-27T15:30:00Z')
      },
      {
        query: 'healthcare finance',
        userId: null,
        ipAddress: '192.168.1.6',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)',
        filters: {
          industry: 'Healthcare',
          demographic: 'Young Professionals'
        },
        resultCount: 4,
        clickedResults: [],
        searchType: 'global',
        searchDuration: 445,
        createdAt: new Date('2024-08-27T16:10:00Z')
      },
      {
        query: 'millennials leaders',
        userId: users[1]?.id || null,
        ipAddress: '192.168.1.7',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        filters: {
          demographic: 'Millennials',
          personality: 'Business Leaders'
        },
        resultCount: 11,
        clickedResults: [articles[3]?.id],
        searchType: 'author',
        searchDuration: 278,
        createdAt: new Date('2024-08-27T17:25:00Z')
      },
      {
        query: 'uae business news',
        userId: users[2]?.id || null,
        ipAddress: '192.168.1.8',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        filters: {
          geographic: 'UAE',
          industry: 'Finance',
          contentType: 'Feature Story'
        },
        resultCount: 9,
        clickedResults: [articles[0]?.id, articles[4]?.id],
        searchType: 'global',
        searchDuration: 167,
        createdAt: new Date('2024-08-27T18:40:00Z')
      }
    ];

    await SearchAnalytics.bulkCreate(searchAnalytics, { ignoreDuplicates: true });
    console.log('✓ Created sample search analytics');

    console.log('Search data seeding completed successfully!');
    
    // Log summary
    const savedSearchCount = await SavedSearch.count();
    const analyticsCount = await SearchAnalytics.count();
    
    console.log(`\nSummary:`);
    console.log(`- Saved searches: ${savedSearchCount}`);
    console.log(`- Search analytics records: ${analyticsCount}`);

  } catch (error) {
    console.error('Error seeding search data:', error);
  }
};

// Run if called directly
if (require.main === module) {
  seedSearchData().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seedSearchData;