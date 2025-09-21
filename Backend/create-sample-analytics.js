const {
  WebsiteAnalytics,
  UserEngagementAnalytics,
  ArticleView,
  VideoArticleView,
  EventAnalytics,
  FlipbookAnalytics,
  DownloadAnalytics,
  Article,
  VideoArticle,
  Event,
  FlipbookMagazine,
  Download,
  sequelize
} = require('./models');

// Sample data generators
const sampleData = {
  // Device types and their distribution
  deviceTypes: ['desktop', 'mobile', 'tablet'],
  deviceWeights: [0.6, 0.35, 0.05], // 60% desktop, 35% mobile, 5% tablet

  // Browsers and their distribution
  browsers: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'],
  browserWeights: [0.65, 0.15, 0.10, 0.08, 0.02],

  // Operating systems
  operatingSystems: ['Windows', 'macOS', 'Linux', 'Android', 'iOS'],
  osWeights: [0.45, 0.25, 0.10, 0.15, 0.05],

  // Countries (top 10 by web traffic)
  countries: ['US', 'IN', 'GB', 'DE', 'FR', 'BR', 'JP', 'CA', 'AU', 'NL'],
  countryWeights: [0.25, 0.15, 0.08, 0.07, 0.06, 0.05, 0.05, 0.04, 0.03, 0.02],

  // Cities for each country
  cities: {
    'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
    'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
    'GB': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'],
    'DE': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'],
    'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'],
    'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'],
    'JP': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo'],
    'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton'],
    'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    'NL': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven']
  },

  // Referrer domains
  referrerDomains: [
    'google.com', 'facebook.com', 'twitter.com', 'linkedin.com',
    'reddit.com', 'youtube.com', 'instagram.com', 'pinterest.com',
    't.co', 'bing.com', null // null for direct traffic
  ],

  // Page URLs for the magazine
  pageUrls: [
    '/',
    '/articles',
    '/videos',
    '/events',
    '/flipbooks',
    '/downloads',
    '/about',
    '/contact',
    '/search',
    '/categories/tech',
    '/categories/business',
    '/categories/lifestyle',
    '/categories/health'
  ],

  // Event types for website analytics
  websiteEventTypes: [
    'page_view', 'session_start', 'session_end', 'user_engagement',
    'scroll_depth', 'time_on_page', 'bounce', 'conversion',
    'search_performed', 'social_share', 'newsletter_signup',
    'contact_form_submit', 'download_initiated', 'video_play',
    'article_read', 'comment_posted', 'user_registration',
    'user_login', 'error_occurred'
  ],

  // Event types for user engagement
  engagementEventTypes: [
    'view', 'like', 'share', 'bookmark', 'comment', 'follow',
    'subscribe', 'download', 'rate', 'review', 'save'
  ],

  // Content types
  contentTypes: ['article', 'video_article', 'event', 'flipbook', 'download'],

  // Campaign sources
  campaignSources: ['google', 'facebook', 'twitter', 'linkedin', 'email', 'direct', null],
  campaignMediums: ['cpc', 'organic', 'social', 'email', 'referral', null],
  campaignNames: ['summer_campaign', 'newsletter_promo', 'social_boost', 'seo_campaign', null]
};

// Utility functions
function getRandomWeightedItem(items, weights) {
  const random = Math.random();
  let cumulativeWeight = 0;

  for (let i = 0; i < items.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateIPAddress() {
  return `${getRandomInt(1, 255)}.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}.${getRandomInt(1, 255)}`;
}

function getRandomDateInRange(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

// Main data generation functions
async function generateWebsiteAnalyticsData(days = 30, recordsPerDay = 100) {
  console.log('Generating website analytics data...');

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

  const records = [];

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate.getTime() + (day * 24 * 60 * 60 * 1000));

    for (let i = 0; i < recordsPerDay; i++) {
      const sessionId = generateSessionId();
      const country = getRandomWeightedItem(sampleData.countries, sampleData.countryWeights);
      const city = getRandomItem(sampleData.cities[country]);
      const deviceType = getRandomWeightedItem(sampleData.deviceTypes, sampleData.deviceWeights);
      const browser = getRandomWeightedItem(sampleData.browsers, sampleData.browserWeights);
      const os = getRandomWeightedItem(sampleData.operatingSystems, sampleData.osWeights);

      // Generate session start event
      records.push({
        sessionId,
        eventType: 'session_start',
        pageUrl: '/',
        pageTitle: 'Home - Magazine Website',
        deviceType,
        browser,
        os,
        country,
        city,
        ipAddress: generateIPAddress(),
        sessionDuration: getRandomInt(30, 3600), // 30 seconds to 1 hour
        pageLoadTime: getRandomInt(500, 3000), // 0.5 to 3 seconds
        timeOnPage: getRandomInt(10, 600), // 10 seconds to 10 minutes
        scrollDepth: getRandomFloat(0.1, 1.0),
        isBounce: Math.random() < 0.4, // 40% bounce rate
        eventTimestamp: getRandomDateInRange(date, new Date(date.getTime() + 24 * 60 * 60 * 1000))
      });

      // Generate additional page views for the session
      const pageViews = getRandomInt(1, 8);
      for (let j = 0; j < pageViews; j++) {
        const pageUrl = getRandomItem(sampleData.pageUrls);
        const pageTitle = pageUrl === '/' ? 'Home - Magazine Website' :
                         pageUrl.includes('/articles') ? 'Articles - Magazine Website' :
                         pageUrl.includes('/videos') ? 'Videos - Magazine Website' :
                         pageUrl.includes('/events') ? 'Events - Magazine Website' :
                         `${pageUrl.split('/').pop().charAt(0).toUpperCase() + pageUrl.split('/').pop().slice(1)} - Magazine Website`;

        records.push({
          sessionId,
          eventType: 'page_view',
          pageUrl,
          pageTitle,
          referrer: j === 0 ? getRandomItem(sampleData.referrerDomains) : null,
          referrerDomain: j === 0 ? getRandomItem(sampleData.referrerDomains) : null,
          campaignSource: Math.random() < 0.1 ? getRandomItem(sampleData.campaignSources) : null,
          campaignMedium: Math.random() < 0.1 ? getRandomItem(sampleData.campaignMediums) : null,
          campaignName: Math.random() < 0.1 ? getRandomItem(sampleData.campaignNames) : null,
          deviceType,
          browser,
          os,
          country,
          city,
          ipAddress: generateIPAddress(),
          sessionDuration: getRandomInt(30, 3600),
          pageLoadTime: getRandomInt(300, 2000),
          timeOnPage: getRandomInt(15, 900),
          scrollDepth: getRandomFloat(0.2, 1.0),
          isBounce: false,
          eventTimestamp: getRandomDateInRange(
            new Date(date.getTime() + (j * 5 * 60 * 1000)),
            new Date(date.getTime() + ((j + 1) * 5 * 60 * 1000))
          )
        });
      }

      // Generate engagement events
      if (Math.random() < 0.3) { // 30% of sessions have engagement
        records.push({
          sessionId,
          eventType: getRandomItem(['user_engagement', 'social_share', 'newsletter_signup', 'contact_form_submit']),
          pageUrl: getRandomItem(sampleData.pageUrls),
          deviceType,
          browser,
          os,
          country,
          city,
          ipAddress: generateIPAddress(),
          isConversion: Math.random() < 0.1,
          conversionType: Math.random() < 0.1 ? 'newsletter_signup' : null,
          conversionValue: Math.random() < 0.1 ? getRandomFloat(0, 50) : null,
          eventTimestamp: getRandomDateInRange(date, new Date(date.getTime() + 24 * 60 * 60 * 1000))
        });
      }
    }
  }

  // Insert records in batches
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await WebsiteAnalytics.bulkCreate(batch);
    console.log(`Inserted ${Math.min(i + batchSize, records.length)}/${records.length} website analytics records`);
  }

  console.log(`Generated ${records.length} website analytics records`);
}

async function generateUserEngagementData(days = 30, recordsPerDay = 50) {
  console.log('Generating user engagement analytics data...');

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

  // Get existing content IDs
  const articles = await Article.findAll({ attributes: ['id'] });
  const videos = await VideoArticle.findAll({ attributes: ['id'] });
  const events = await Event.findAll({ attributes: ['id'] });
  const flipbooks = await FlipbookMagazine.findAll({ attributes: ['id'] });
  const downloads = await Download.findAll({ attributes: ['id'] });

  const contentMap = {
    article: articles.map(a => a.id),
    video_article: videos.map(v => v.id),
    event: events.map(e => e.id),
    flipbook: flipbooks.map(f => f.id),
    download: downloads.map(d => d.id)
  };

  const records = [];

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate.getTime() + (day * 24 * 60 * 60 * 1000));

    for (let i = 0; i < recordsPerDay; i++) {
      const contentType = getRandomWeightedItem(
        sampleData.contentTypes,
        [0.4, 0.3, 0.15, 0.1, 0.05] // Distribution favoring articles and videos
      );

      const contentIds = contentMap[contentType];
      if (!contentIds || contentIds.length === 0) continue;

      const contentId = getRandomItem(contentIds);
      const eventType = getRandomWeightedItem(
        sampleData.engagementEventTypes,
        [0.5, 0.15, 0.1, 0.08, 0.07, 0.05, 0.03, 0.01, 0.005, 0.005, 0.005] // View most common
      );

      const country = getRandomWeightedItem(sampleData.countries, sampleData.countryWeights);
      const city = getRandomItem(sampleData.cities[country]);

      records.push({
        contentId,
        contentType,
        eventType,
        platform: getRandomWeightedItem(
          ['website', 'mobile_app', 'social_facebook', 'social_twitter'],
          [0.7, 0.2, 0.05, 0.05]
        ),
        deviceType: getRandomWeightedItem(sampleData.deviceTypes, sampleData.deviceWeights),
        browser: getRandomWeightedItem(sampleData.browsers, sampleData.browserWeights),
        os: getRandomWeightedItem(sampleData.operatingSystems, sampleData.osWeights),
        country,
        city,
        referrer: getRandomItem(sampleData.referrerDomains),
        ipAddress: generateIPAddress(),
        engagementScore: getRandomInt(1, 25),
        timeSpent: getRandomInt(10, 1800), // 10 seconds to 30 minutes
        interactionDepth: getRandomFloat(0.1, 1.0),
        sentiment: Math.random() < 0.8 ? 'positive' : Math.random() < 0.15 ? 'neutral' : 'negative',
        tags: Math.random() < 0.3 ? ['sample', 'test'] : [],
        eventTimestamp: getRandomDateInRange(date, new Date(date.getTime() + 24 * 60 * 60 * 1000))
      });
    }
  }

  // Insert records in batches
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await UserEngagementAnalytics.bulkCreate(batch);
    console.log(`Inserted ${Math.min(i + batchSize, records.length)}/${records.length} user engagement records`);
  }

  console.log(`Generated ${records.length} user engagement analytics records`);
}

async function generateArticleViewData(days = 30, recordsPerDay = 80) {
  console.log('Generating article view data...');

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

  const articles = await Article.findAll({ attributes: ['id'] });
  if (articles.length === 0) {
    console.log('No articles found, skipping article view generation');
    return;
  }

  const records = [];

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate.getTime() + (day * 24 * 60 * 60 * 1000));

    for (let i = 0; i < recordsPerDay; i++) {
      const article = getRandomItem(articles);

      records.push({
        articleId: article.id,
        ipAddress: generateIPAddress(),
        userAgent: `Mozilla/5.0 (${getRandomItem(sampleData.operatingSystems)}) ${getRandomItem(sampleData.browsers)}`,
        referrer: getRandomItem(sampleData.referrerDomains),
        sessionId: generateSessionId(),
        readingTime: getRandomInt(30, 1800), // 30 seconds to 30 minutes
        scrollDepth: getRandomFloat(0.1, 1.0),
        viewedAt: getRandomDateInRange(date, new Date(date.getTime() + 24 * 60 * 60 * 1000))
      });
    }
  }

  // Insert records in batches
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await ArticleView.bulkCreate(batch);
    console.log(`Inserted ${Math.min(i + batchSize, records.length)}/${records.length} article view records`);
  }

  console.log(`Generated ${records.length} article view records`);
}

async function generateVideoArticleViewData(days = 30, recordsPerDay = 40) {
  console.log('Generating video article view data...');

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

  const videos = await VideoArticle.findAll({ attributes: ['id'] });
  if (videos.length === 0) {
    console.log('No video articles found, skipping video view generation');
    return;
  }

  const records = [];

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate.getTime() + (day * 24 * 60 * 60 * 1000));

    for (let i = 0; i < recordsPerDay; i++) {
      const video = getRandomItem(videos);

      records.push({
        videoArticleId: video.id,
        ipAddress: generateIPAddress(),
        userAgent: `Mozilla/5.0 (${getRandomItem(sampleData.operatingSystems)}) ${getRandomItem(sampleData.browsers)}`,
        referrer: getRandomItem(sampleData.referrerDomains),
        sessionId: generateSessionId(),
        watchTime: getRandomInt(10, 1800), // 10 seconds to 30 minutes
        totalDuration: getRandomInt(60, 3600), // 1 minute to 1 hour
        currentTime: getRandomInt(10, 1800),
        quality: getRandomItem(['720p', '1080p', '1440p', '4K']),
        deviceType: getRandomWeightedItem(sampleData.deviceTypes, sampleData.deviceWeights),
        browser: getRandomWeightedItem(sampleData.browsers, sampleData.browserWeights),
        os: getRandomWeightedItem(sampleData.operatingSystems, sampleData.osWeights),
        country: getRandomWeightedItem(sampleData.countries, sampleData.countryWeights),
        city: getRandomItem(sampleData.cities[getRandomWeightedItem(sampleData.countries, sampleData.countryWeights)]),
        referrer: getRandomItem(sampleData.referrerDomains),
        ipAddress: generateIPAddress(),
        viewedAt: getRandomDateInRange(date, new Date(date.getTime() + 24 * 60 * 60 * 1000))
      });
    }
  }

  // Insert records in batches
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await VideoArticleView.bulkCreate(batch);
    console.log(`Inserted ${Math.min(i + batchSize, records.length)}/${records.length} video article view records`);
  }

  console.log(`Generated ${records.length} video article view records`);
}

async function generateEventAnalyticsData(days = 30, recordsPerDay = 20) {
  console.log('Generating event analytics data...');

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

  const events = await Event.findAll({ attributes: ['id'] });
  if (events.length === 0) {
    console.log('No events found, skipping event analytics generation');
    return;
  }

  const records = [];

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate.getTime() + (day * 24 * 60 * 60 * 1000));

    for (let i = 0; i < recordsPerDay; i++) {
      const event = getRandomItem(events);
      const country = getRandomWeightedItem(sampleData.countries, sampleData.countryWeights);
      const city = getRandomItem(sampleData.cities[country]);

      records.push({
        eventId: event.id,
        eventType: getRandomItem(['view', 'registration_start', 'registration_complete', 'attendee_checkin', 'share', 'bookmark', 'calendar_add', 'reminder_set', 'feedback_submit', 'download_ics', 'contact_organizer']),
        deviceType: getRandomWeightedItem(sampleData.deviceTypes, sampleData.deviceWeights),
        browser: getRandomWeightedItem(sampleData.browsers, sampleData.browserWeights),
        os: getRandomWeightedItem(sampleData.operatingSystems, sampleData.osWeights),
        country,
        city,
        referrer: getRandomItem(sampleData.referrerDomains),
        ipAddress: generateIPAddress(),
        eventTimestamp: getRandomDateInRange(date, new Date(date.getTime() + 24 * 60 * 60 * 1000))
      });
    }
  }

  // Insert records in batches
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await EventAnalytics.bulkCreate(batch);
    console.log(`Inserted ${Math.min(i + batchSize, records.length)}/${records.length} event analytics records`);
  }

  console.log(`Generated ${records.length} event analytics records`);
}

async function generateFlipbookAnalyticsData(days = 30, recordsPerDay = 15) {
  console.log('Generating flipbook analytics data...');

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

  const flipbooks = await FlipbookMagazine.findAll({ attributes: ['id'] });
  if (flipbooks.length === 0) {
    console.log('No flipbooks found, skipping flipbook analytics generation');
    return;
  }

  const records = [];

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate.getTime() + (day * 24 * 60 * 60 * 1000));

    for (let i = 0; i < recordsPerDay; i++) {
      const flipbook = getRandomItem(flipbooks);
      const country = getRandomWeightedItem(sampleData.countries, sampleData.countryWeights);
      const city = getRandomItem(sampleData.cities[country]);

      records.push({
        flipbookId: flipbook.id,
        eventType: getRandomItem(['view_start', 'view_complete', 'page_view', 'page_turn', 'zoom_change', 'fullscreen_enter', 'fullscreen_exit', 'download_start', 'download_complete', 'share', 'bookmark', 'print_attempt', 'search', 'annotation_add', 'annotation_remove']),
        currentPage: getRandomInt(1, 50),
        totalPages: getRandomInt(10, 100),
        readTime: getRandomInt(30, 3600), // 30 seconds to 1 hour
        totalReadTime: getRandomInt(60, 7200), // 1 minute to 2 hours
        zoomLevel: getRandomFloat(0.5, 2.0),
        deviceType: getRandomWeightedItem(sampleData.deviceTypes, sampleData.deviceWeights),
        browser: getRandomWeightedItem(sampleData.browsers, sampleData.browserWeights),
        os: getRandomWeightedItem(sampleData.operatingSystems, sampleData.osWeights),
        country,
        city,
        referrer: getRandomItem(sampleData.referrerDomains),
        ipAddress: generateIPAddress(),
        eventTimestamp: getRandomDateInRange(date, new Date(date.getTime() + 24 * 60 * 60 * 1000))
      });
    }
  }

  // Insert records in batches
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await FlipbookAnalytics.bulkCreate(batch);
    console.log(`Inserted ${Math.min(i + batchSize, records.length)}/${records.length} flipbook analytics records`);
  }

  console.log(`Generated ${records.length} flipbook analytics records`);
}

async function generateDownloadAnalyticsData(days = 30, recordsPerDay = 10) {
  console.log('Generating download analytics data...');

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

  const downloads = await Download.findAll({ attributes: ['id'] });
  if (downloads.length === 0) {
    console.log('No downloads found, skipping download analytics generation');
    return;
  }

  const records = [];

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate.getTime() + (day * 24 * 60 * 60 * 1000));

    for (let i = 0; i < recordsPerDay; i++) {
      const download = getRandomItem(downloads);
      const country = getRandomWeightedItem(sampleData.countries, sampleData.countryWeights);
      const city = getRandomItem(sampleData.cities[country]);

      records.push({
        downloadId: download.id,
        eventType: getRandomItem(['initiated', 'completed', 'cancelled', 'error']),
        fileSize: getRandomInt(100000, 50000000), // 100KB to 50MB
        downloadSpeed: getRandomInt(100000, 10000000), // 100KB/s to 10MB/s
        downloadTime: getRandomInt(1, 300), // 1 second to 5 minutes
        deviceType: getRandomWeightedItem(sampleData.deviceTypes, sampleData.deviceWeights),
        browser: getRandomWeightedItem(sampleData.browsers, sampleData.browserWeights),
        os: getRandomWeightedItem(sampleData.operatingSystems, sampleData.osWeights),
        country,
        city,
        referrer: getRandomItem(sampleData.referrerDomains),
        ipAddress: generateIPAddress(),
        eventTimestamp: getRandomDateInRange(date, new Date(date.getTime() + 24 * 60 * 60 * 1000))
      });
    }
  }

  // Insert records in batches
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await DownloadAnalytics.bulkCreate(batch);
    console.log(`Inserted ${Math.min(i + batchSize, records.length)}/${records.length} download analytics records`);
  }

  console.log(`Generated ${records.length} download analytics records`);
}

// Main execution function
async function createSampleAnalyticsData() {
  try {
    console.log('Starting sample analytics data generation...');

    // Generate data for different analytics tables
    await generateWebsiteAnalyticsData(30, 100); // 30 days, 100 records per day
    await generateUserEngagementData(30, 50);    // 30 days, 50 records per day
    await generateArticleViewData(30, 80);       // 30 days, 80 records per day
    await generateVideoArticleViewData(30, 40);  // 30 days, 40 records per day
    await generateEventAnalyticsData(30, 20);    // 30 days, 20 records per day
    await generateFlipbookAnalyticsData(30, 15); // 30 days, 15 records per day
    await generateDownloadAnalyticsData(30, 10); // 30 days, 10 records per day

    console.log('Sample analytics data generation completed successfully!');

  } catch (error) {
    console.error('Error generating sample analytics data:', error);
    throw error;
  }
}

// Export the function
module.exports = createSampleAnalyticsData;

// If run directly
if (require.main === module) {
  createSampleAnalyticsData()
    .then(() => {
      console.log('Sample analytics data created successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create sample analytics data:', error);
      process.exit(1);
    });
}