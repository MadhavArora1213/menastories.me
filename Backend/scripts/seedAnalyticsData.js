const { Analytics, SEOAnalytics, SocialAnalytics, PerformanceMetrics, Article, User } = require('../models');
const { faker } = require('@faker-js/faker');

async function seedAnalyticsData() {
  try {
    console.log('🌱 Seeding analytics data...');

    // Generate analytics events
    const analyticsEvents = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // 90 days ago

    // Get existing articles and users for reference
    const articles = await Article.findAll({ limit: 20 });
    const users = await User.findAll({ limit: 10 });

    // Generate page view events
    for (let i = 0; i < 1000; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      const article = articles[Math.floor(Math.random() * articles.length)];
      const user = Math.random() > 0.7 ? users[Math.floor(Math.random() * users.length)] : null;

      analyticsEvents.push({
        eventType: 'page_view',
        eventData: {
          url: `/articles/${article?.slug || faker.lorem.slug()}`,
          pageTitle: article?.title || faker.lorem.sentence(),
          referrer: Math.random() > 0.5 ? faker.internet.url() : null,
          duration: Math.floor(Math.random() * 600) + 30, // 30-630 seconds
          articleId: article?.id,
          categoryId: article?.categoryId,
          authorId: article?.authorId,
          authorName: article?.author?.name
        },
        userId: user?.id,
        sessionId: faker.string.uuid(),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        referrer: Math.random() > 0.5 ? faker.internet.url() : null,
        url: `/articles/${article?.slug || faker.lorem.slug()}`,
        deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        browser: faker.helpers.arrayElement(['chrome', 'firefox', 'safari', 'edge']),
        operatingSystem: faker.helpers.arrayElement(['windows', 'macos', 'linux', 'android', 'ios']),
        country: faker.location.countryCode(),
        city: faker.location.city(),
        timestamp: randomDate
      });
    }

    // Generate article view events
    for (let i = 0; i < 800; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      const article = articles[Math.floor(Math.random() * articles.length)];
      const user = Math.random() > 0.6 ? users[Math.floor(Math.random() * users.length)] : null;

      analyticsEvents.push({
        eventType: 'article_view',
        eventData: {
          articleId: article?.id,
          title: article?.title,
          categoryId: article?.categoryId,
          categoryName: article?.category?.name,
          authorId: article?.authorId,
          authorName: article?.author?.name,
          readTime: Math.floor(Math.random() * 10) + 2, // 2-12 minutes
          scrollDepth: Math.floor(Math.random() * 100) + 1, // 1-100%
          timeSpent: Math.floor(Math.random() * 600) + 30
        },
        userId: user?.id,
        sessionId: faker.string.uuid(),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        browser: faker.helpers.arrayElement(['chrome', 'firefox', 'safari', 'edge']),
        operatingSystem: faker.helpers.arrayElement(['windows', 'macos', 'linux', 'android', 'ios']),
        country: faker.location.countryCode(),
        timestamp: randomDate
      });
    }

    // Generate search events
    for (let i = 0; i < 300; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      const user = Math.random() > 0.8 ? users[Math.floor(Math.random() * users.length)] : null;

      analyticsEvents.push({
        eventType: 'search_query',
        eventData: {
          query: faker.lorem.words({ min: 1, max: 3 }),
          resultsCount: Math.floor(Math.random() * 50),
          filters: {
            category: Math.random() > 0.7 ? faker.lorem.word() : null,
            dateRange: Math.random() > 0.8 ? 'last-week' : null
          },
          searchType: faker.helpers.arrayElement(['global', 'category', 'author'])
        },
        userId: user?.id,
        sessionId: faker.string.uuid(),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        timestamp: randomDate
      });
    }

    // Generate newsletter signup events
    for (let i = 0; i < 150; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);

      analyticsEvents.push({
        eventType: 'newsletter_signup',
        eventData: {
          email: faker.internet.email(),
          source: faker.helpers.arrayElement(['homepage', 'article', 'footer', 'popup']),
          preferences: {
            frequency: faker.helpers.arrayElement(['daily', 'weekly', 'monthly']),
            categories: faker.helpers.arrayElements(['technology', 'business', 'lifestyle'], { min: 1, max: 3 }),
            whatsappEnabled: Math.random() > 0.7
          }
        },
        sessionId: faker.string.uuid(),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        timestamp: randomDate
      });
    }

    // Generate social share events
    for (let i = 0; i < 200; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      const article = articles[Math.floor(Math.random() * articles.length)];

      analyticsEvents.push({
        eventType: 'social_share',
        eventData: {
          articleId: article?.id,
          articleTitle: article?.title,
          platform: faker.helpers.arrayElement(['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram']),
          shareUrl: `https://example.com/articles/${article?.slug}`,
          shareType: faker.helpers.arrayElement(['article', 'excerpt', 'image'])
        },
        sessionId: faker.string.uuid(),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        timestamp: randomDate
      });
    }

    // Bulk insert analytics events
    await Analytics.bulkCreate(analyticsEvents, { ignoreDuplicates: true });
    console.log(`✅ Created ${analyticsEvents.length} analytics events`);

    // Generate SEO analytics data
    const seoData = [];
    const keywords = [
      'technology news', 'business trends', 'lifestyle tips', 'health advice',
      'travel guide', 'food recipes', 'fashion trends', 'sports news',
      'entertainment updates', 'science discoveries'
    ];

    for (let i = 0; i < 500; i++) {
      const date = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      const keyword = keywords[Math.floor(Math.random() * keywords.length)];

      seoData.push({
        keyword,
        searchEngine: faker.helpers.arrayElement(['google', 'bing', 'yahoo']),
        position: Math.floor(Math.random() * 50) + 1,
        impressions: Math.floor(Math.random() * 1000) + 10,
        clicks: Math.floor(Math.random() * 100) + 1,
        ctr: parseFloat((Math.random() * 10).toFixed(2)),
        url: `https://example.com/articles/${faker.lorem.slug()}`,
        pageTitle: faker.lorem.sentence(),
        device: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        country: faker.location.countryCode(),
        competition: parseFloat(Math.random().toFixed(2)),
        searchVolume: Math.floor(Math.random() * 10000) + 100,
        cpc: parseFloat((Math.random() * 5).toFixed(2)),
        date: date.toISOString().split('T')[0]
      });
    }

    await SEOAnalytics.bulkCreate(seoData, { ignoreDuplicates: true });
    console.log(`✅ Created ${seoData.length} SEO analytics records`);

    // Generate social media analytics data
    const socialData = [];
    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];

    for (let i = 0; i < 300; i++) {
      const date = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const article = articles[Math.floor(Math.random() * articles.length)];

      const likes = Math.floor(Math.random() * 500) + 10;
      const shares = Math.floor(Math.random() * 100) + 1;
      const comments = Math.floor(Math.random() * 50) + 1;
      const views = Math.floor(Math.random() * 5000) + 100;
      const engagement = likes + shares + comments;

      socialData.push({
        platform,
        contentId: article?.id,
        contentType: 'article',
        postId: faker.string.uuid(),
        postUrl: `https://${platform}.com/post/${faker.string.uuid()}`,
        likes,
        shares,
        comments,
        views,
        clicks: Math.floor(Math.random() * 200) + 5,
        impressions: Math.floor(Math.random() * 10000) + 500,
        reach: Math.floor(Math.random() * 8000) + 200,
        engagement,
        engagementRate: parseFloat(((engagement / views) * 100).toFixed(2)),
        postedAt: new Date(date.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        date: date.toISOString().split('T')[0],
        demographics: {
          age: {
            '18-24': Math.floor(Math.random() * 30) + 10,
            '25-34': Math.floor(Math.random() * 40) + 20,
            '35-44': Math.floor(Math.random() * 30) + 15,
            '45+': Math.floor(Math.random() * 20) + 5
          },
          gender: {
            male: Math.floor(Math.random() * 60) + 20,
            female: Math.floor(Math.random() * 60) + 20,
            other: Math.floor(Math.random() * 10) + 1
          }
        },
        hashtags: faker.helpers.arrayElements(['tech', 'news', 'lifestyle', 'business', 'health'], { min: 1, max: 3 })
      });
    }

    await SocialAnalytics.bulkCreate(socialData, { ignoreDuplicates: true });
    console.log(`✅ Created ${socialData.length} social analytics records`);

    // Generate performance metrics data
    const performanceData = [];
    const urls = [
      'https://example.com/',
      'https://example.com/articles/tech-news',
      'https://example.com/articles/business-trends',
      'https://example.com/category/technology',
      'https://example.com/search'
    ];

    for (let i = 0; i < 400; i++) {
      const timestamp = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      const url = urls[Math.floor(Math.random() * urls.length)];

      performanceData.push({
        metricType: faker.helpers.arrayElement(['page_load', 'api_response', 'error_rate']),
        url,
        userAgent: faker.internet.userAgent(),
        deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
        browser: faker.helpers.arrayElement(['chrome', 'firefox', 'safari', 'edge']),
        connectionType: faker.helpers.arrayElement(['4g', 'wifi', '3g']),
        dnsLookup: Math.floor(Math.random() * 100) + 10,
        tcpConnect: Math.floor(Math.random() * 200) + 20,
        serverResponse: Math.floor(Math.random() * 500) + 100,
        pageLoad: Math.floor(Math.random() * 3000) + 500,
        domReady: Math.floor(Math.random() * 2000) + 300,
        firstPaint: Math.floor(Math.random() * 1500) + 200,
        firstContentfulPaint: Math.floor(Math.random() * 2000) + 300,
        largestContentfulPaint: Math.floor(Math.random() * 2500) + 400,
        resourcesLoaded: Math.floor(Math.random() * 50) + 10,
        resourcesSize: Math.floor(Math.random() * 5000000) + 500000,
        errorCount: Math.random() > 0.9 ? Math.floor(Math.random() * 5) + 1 : 0,
        errorTypes: Math.random() > 0.9 ? ['javascript_error', 'network_error'] : null,
        performanceScore: Math.floor(Math.random() * 40) + 60, // 60-100
        accessibilityScore: Math.floor(Math.random() * 30) + 70, // 70-100
        bestPracticesScore: Math.floor(Math.random() * 25) + 75, // 75-100
        seoScore: Math.floor(Math.random() * 35) + 65, // 65-100
        country: faker.location.countryCode(),
        region: faker.location.state(),
        city: faker.location.city(),
        isp: faker.company.name(),
        customMetrics: {
          customMetric1: Math.floor(Math.random() * 100),
          customMetric2: Math.random() * 10
        },
        timestamp
      });
    }

    await PerformanceMetrics.bulkCreate(performanceData, { ignoreDuplicates: true });
    console.log(`✅ Created ${performanceData.length} performance metrics records`);

    console.log('🎉 Analytics data seeding completed successfully!');
    console.log(`📊 Total records created:`);
    console.log(`   - Analytics events: ${analyticsEvents.length}`);
    console.log(`   - SEO analytics: ${seoData.length}`);
    console.log(`   - Social analytics: ${socialData.length}`);
    console.log(`   - Performance metrics: ${performanceData.length}`);

  } catch (error) {
    console.error('❌ Error seeding analytics data:', error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedAnalyticsData()
    .then(() => {
      console.log('✅ Analytics data seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Analytics data seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAnalyticsData;