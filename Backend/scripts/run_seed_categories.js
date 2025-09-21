const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Import database configuration
const sequelize = require('../config/db');

const runSeedCategories = async () => {
  try {
    console.log('🚀 Starting category seeding process...');

    // Check existing categories
    const [existingCategories] = await sequelize.query('SELECT "id", "name", "slug" FROM "Categories"');
    const existingSlugs = new Set(existingCategories.map(cat => cat.slug));

    console.log(`📊 Found ${existingCategories.length} existing categories`);

    // Define all categories and subcategories
    const categoriesData = [
      // Main categories
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'PEOPLE & PROFILES',
        slug: 'people-profiles',
        description: 'Comprehensive personality coverage spanning entertainment figures to business innovators',
        parentId: null,
        order: 1
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'ENTERTAINMENT',
        slug: 'entertainment',
        description: 'Complete entertainment industry coverage from film and television to music and celebrity culture',
        parentId: null,
        order: 2
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'LIFESTYLE',
        slug: 'lifestyle',
        description: 'Diverse lifestyle content covering personal interests from fashion trends to family guidance',
        parentId: null,
        order: 3
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'CULTURE & SOCIETY',
        slug: 'culture-society',
        description: 'Cultural exploration encompassing artistic expression, social commentary, and contemporary trends',
        parentId: null,
        order: 4
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'BUSINESS & LEADERSHIP',
        slug: 'business-leadership',
        description: 'Professional focus on business innovation, leadership development, and financial guidance',
        parentId: null,
        order: 5
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'REGIONAL FOCUS',
        slug: 'regional-focus',
        description: 'Local emphasis on UAE-specific content including community leaders and regional developments',
        parentId: null,
        order: 6
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        name: 'SPECIAL SECTIONS',
        slug: 'special-sections',
        description: 'Curated recognition content highlighting influential personalities across various sectors',
        parentId: null,
        order: 7
      },

      // PEOPLE & PROFILES subcategories
      { id: '550e8400-e29b-41d4-a716-446655440011', name: 'Celebrity Spotlight', slug: 'celebrity-spotlight', description: 'In-depth profiles of entertainment celebrities and their impact', parentId: '550e8400-e29b-41d4-a716-446655440001', order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440012', name: 'Influencer Stories', slug: 'influencer-stories', description: 'Digital influencers and their journey to success', parentId: '550e8400-e29b-41d4-a716-446655440001', order: 2 },
      { id: '550e8400-e29b-41d4-a716-446655440013', name: 'Business Leaders', slug: 'business-leaders', description: 'Profiles of successful entrepreneurs and executives', parentId: '550e8400-e29b-41d4-a716-446655440001', order: 3 },
      { id: '550e8400-e29b-41d4-a716-446655440014', name: 'Rising Stars', slug: 'rising-stars', description: 'Emerging talents making their mark in various fields', parentId: '550e8400-e29b-41d4-a716-446655440001', order: 4 },
      { id: '550e8400-e29b-41d4-a716-446655440015', name: 'Local Personalities', slug: 'local-personalities', description: 'Community leaders and local influencers', parentId: '550e8400-e29b-41d4-a716-446655440001', order: 5 },
      { id: '550e8400-e29b-41d4-a716-446655440016', name: 'International Icons', slug: 'international-icons', description: 'Global figures shaping world events', parentId: '550e8400-e29b-41d4-a716-446655440001', order: 6 },
      { id: '550e8400-e29b-41d4-a716-446655440017', name: 'Changemakers', slug: 'changemakers', description: 'Individuals driving positive social change', parentId: '550e8400-e29b-41d4-a716-446655440001', order: 7 },
      { id: '550e8400-e29b-41d4-a716-446655440018', name: 'Entrepreneurs', slug: 'entrepreneurs', description: 'Innovative business creators and founders', parentId: '550e8400-e29b-41d4-a716-446655440001', order: 8 },

      // ENTERTAINMENT subcategories
      { id: '550e8400-e29b-41d4-a716-446655440021', name: 'Bollywood News', slug: 'bollywood-news', description: 'Latest updates from the Indian film industry', parentId: '550e8400-e29b-41d4-a716-446655440002', order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440022', name: 'Hollywood Updates', slug: 'hollywood-updates', description: 'American film industry news and developments', parentId: '550e8400-e29b-41d4-a716-446655440002', order: 2 },
      { id: '550e8400-e29b-41d4-a716-446655440023', name: 'TV Shows & Series', slug: 'tv-shows-series', description: 'Television programming and streaming content', parentId: '550e8400-e29b-41d4-a716-446655440002', order: 3 },
      { id: '550e8400-e29b-41d4-a716-446655440024', name: 'Music & Artists', slug: 'music-artists', description: 'Music industry news and artist profiles', parentId: '550e8400-e29b-41d4-a716-446655440002', order: 4 },
      { id: '550e8400-e29b-41d4-a716-446655440025', name: 'Movie Reviews', slug: 'movie-reviews', description: 'Film critiques and analysis', parentId: '550e8400-e29b-41d4-a716-446655440002', order: 5 },
      { id: '550e8400-e29b-41d4-a716-446655440026', name: 'Red Carpet Events', slug: 'red-carpet-events', description: 'Award shows and premieres coverage', parentId: '550e8400-e29b-41d4-a716-446655440002', order: 6 },
      { id: '550e8400-e29b-41d4-a716-446655440027', name: 'Award Shows', slug: 'award-shows', description: 'Major entertainment awards and ceremonies', parentId: '550e8400-e29b-41d4-a716-446655440002', order: 7 },
      { id: '550e8400-e29b-41d4-a716-446655440028', name: 'Celebrity Interviews', slug: 'celebrity-interviews', description: 'Exclusive conversations with entertainment figures', parentId: '550e8400-e29b-41d4-a716-446655440002', order: 8 },
      { id: '550e8400-e29b-41d4-a716-446655440029', name: 'Behind the Scenes', slug: 'behind-the-scenes', description: 'Production insights and making-of content', parentId: '550e8400-e29b-41d4-a716-446655440002', order: 9 },

      // LIFESTYLE subcategories
      { id: '550e8400-e29b-41d4-a716-446655440031', name: 'Fashion & Style', slug: 'fashion-style', description: 'Latest fashion trends and style guides', parentId: '550e8400-e29b-41d4-a716-446655440003', order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440032', name: 'Beauty & Skincare', slug: 'beauty-skincare', description: 'Beauty tips and skincare routines', parentId: '550e8400-e29b-41d4-a716-446655440003', order: 2 },
      { id: '550e8400-e29b-41d4-a716-446655440033', name: 'Health & Wellness', slug: 'health-wellness', description: 'Health tips and wellness practices', parentId: '550e8400-e29b-41d4-a716-446655440003', order: 3 },
      { id: '550e8400-e29b-41d4-a716-446655440034', name: 'Food & Recipes', slug: 'food-recipes', description: 'Culinary delights and cooking guides', parentId: '550e8400-e29b-41d4-a716-446655440003', order: 4 },
      { id: '550e8400-e29b-41d4-a716-446655440035', name: 'Travel & Destinations', slug: 'travel-destinations', description: 'Travel guides and destination reviews', parentId: '550e8400-e29b-41d4-a716-446655440003', order: 5 },
      { id: '550e8400-e29b-41d4-a716-446655440036', name: 'Home & Decor', slug: 'home-decor', description: 'Interior design and home improvement', parentId: '550e8400-e29b-41d4-a716-446655440003', order: 6 },
      { id: '550e8400-e29b-41d4-a716-446655440037', name: 'Relationships & Dating', slug: 'relationships-dating', description: 'Relationship advice and dating tips', parentId: '550e8400-e29b-41d4-a716-446655440003', order: 7 },
      { id: '550e8400-e29b-41d4-a716-446655440038', name: 'Parenting & Family', slug: 'parenting-family', description: 'Family life and parenting guidance', parentId: '550e8400-e29b-41d4-a716-446655440003', order: 8 },

      // CULTURE & SOCIETY subcategories
      { id: '550e8400-e29b-41d4-a716-446655440041', name: 'Art & Photography', slug: 'art-photography', description: 'Visual arts and photography showcases', parentId: '550e8400-e29b-41d4-a716-446655440004', order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440042', name: 'Books & Literature', slug: 'books-literature', description: 'Literary reviews and author spotlights', parentId: '550e8400-e29b-41d4-a716-446655440004', order: 2 },
      { id: '550e8400-e29b-41d4-a716-446655440043', name: 'Social Issues', slug: 'social-issues', description: 'Important social topics and discussions', parentId: '550e8400-e29b-41d4-a716-446655440004', order: 3 },
      { id: '550e8400-e29b-41d4-a716-446655440044', name: 'Cultural Events', slug: 'cultural-events', description: 'Cultural festivals and community events', parentId: '550e8400-e29b-41d4-a716-446655440004', order: 4 },
      { id: '550e8400-e29b-41d4-a716-446655440045', name: 'Heritage & Traditions', slug: 'heritage-traditions', description: 'Cultural heritage and traditional practices', parentId: '550e8400-e29b-41d4-a716-446655440004', order: 5 },
      { id: '550e8400-e29b-41d4-a716-446655440046', name: 'Pop Culture', slug: 'pop-culture', description: 'Popular culture trends and phenomena', parentId: '550e8400-e29b-41d4-a716-446655440004', order: 6 },
      { id: '550e8400-e29b-41d4-a716-446655440047', name: 'Digital Trends', slug: 'digital-trends', description: 'Technology and digital culture insights', parentId: '550e8400-e29b-41d4-a716-446655440004', order: 7 },
      { id: '550e8400-e29b-41d4-a716-446655440048', name: 'Youth Culture', slug: 'youth-culture', description: 'Young people and contemporary youth trends', parentId: '550e8400-e29b-41d4-a716-446655440004', order: 8 },

      // BUSINESS & LEADERSHIP subcategories
      { id: '550e8400-e29b-41d4-a716-446655440051', name: 'Industry Leaders', slug: 'industry-leaders', description: 'Profiles of business and industry leaders', parentId: '550e8400-e29b-41d4-a716-446655440005', order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440052', name: 'Startup Stories', slug: 'startup-stories', description: 'Entrepreneurial journeys and startup success', parentId: '550e8400-e29b-41d4-a716-446655440005', order: 2 },
      { id: '550e8400-e29b-41d4-a716-446655440053', name: 'Women in Business', slug: 'women-in-business', description: 'Female entrepreneurs and business leaders', parentId: '550e8400-e29b-41d4-a716-446655440005', order: 3 },
      { id: '550e8400-e29b-41d4-a716-446655440054', name: 'Corporate News', slug: 'corporate-news', description: 'Corporate developments and business news', parentId: '550e8400-e29b-41d4-a716-446655440005', order: 4 },
      { id: '550e8400-e29b-41d4-a716-446655440055', name: 'Economic Trends', slug: 'economic-trends', description: 'Economic analysis and market insights', parentId: '550e8400-e29b-41d4-a716-446655440005', order: 5 },
      { id: '550e8400-e29b-41d4-a716-446655440056', name: 'Leadership Insights', slug: 'leadership-insights', description: 'Leadership strategies and management tips', parentId: '550e8400-e29b-41d4-a716-446655440005', order: 6 },
      { id: '550e8400-e29b-41d4-a716-446655440057', name: 'Career Advice', slug: 'career-advice', description: 'Professional development and career guidance', parentId: '550e8400-e29b-41d4-a716-446655440005', order: 7 },
      { id: '550e8400-e29b-41d4-a716-446655440058', name: 'Money & Finance', slug: 'money-finance', description: 'Financial planning and investment advice', parentId: '550e8400-e29b-41d4-a716-446655440005', order: 8 },

      // REGIONAL FOCUS subcategories
      { id: '550e8400-e29b-41d4-a716-446655440061', name: 'UAE Spotlight', slug: 'uae-spotlight', description: 'UAE news and developments', parentId: '550e8400-e29b-41d4-a716-446655440006', order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440062', name: 'Local Events', slug: 'local-events', description: 'Community events and local happenings', parentId: '550e8400-e29b-41d4-a716-446655440006', order: 2 },
      { id: '550e8400-e29b-41d4-a716-446655440063', name: 'Community Heroes', slug: 'community-heroes', description: 'Local heroes and community leaders', parentId: '550e8400-e29b-41d4-a716-446655440006', order: 3 },
      { id: '550e8400-e29b-41d4-a716-446655440064', name: 'Government News', slug: 'government-news', description: 'Government initiatives and policies', parentId: '550e8400-e29b-41d4-a716-446655440006', order: 4 },
      { id: '550e8400-e29b-41d4-a716-446655440065', name: 'Cultural Festivals', slug: 'cultural-festivals', description: 'Traditional and cultural celebrations', parentId: '550e8400-e29b-41d4-a716-446655440006', order: 5 },
      { id: '550e8400-e29b-41d4-a716-446655440066', name: 'Business Hub', slug: 'business-hub', description: 'Business developments and opportunities', parentId: '550e8400-e29b-41d4-a716-446655440006', order: 6 },
      { id: '550e8400-e29b-41d4-a716-446655440067', name: 'Tourism & Attractions', slug: 'tourism-attractions', description: 'Tourist destinations and attractions', parentId: '550e8400-e29b-41d4-a716-446655440006', order: 7 },
      { id: '550e8400-e29b-41d4-a716-446655440068', name: 'Local Personalities', slug: 'local-personalities-uae', description: 'Prominent local figures and influencers', parentId: '550e8400-e29b-41d4-a716-446655440006', order: 8 },

      // SPECIAL SECTIONS subcategories
      { id: '550e8400-e29b-41d4-a716-446655440071', name: 'Power Lists (30 Under 30, 40 Under 40)', slug: 'power-lists', description: 'Young leaders and influential personalities', parentId: '550e8400-e29b-41d4-a716-446655440007', order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440072', name: 'Annual Awards', slug: 'annual-awards', description: 'Recognition and achievement celebrations', parentId: '550e8400-e29b-41d4-a716-446655440007', order: 2 },
      { id: '550e8400-e29b-41d4-a716-446655440073', name: 'Top Doctors', slug: 'top-doctors', description: 'Medical professionals and healthcare leaders', parentId: '550e8400-e29b-41d4-a716-446655440007', order: 3 },
      { id: '550e8400-e29b-41d4-a716-446655440074', name: 'Women Leaders', slug: 'women-leaders', description: 'Influential women in various fields', parentId: '550e8400-e29b-41d4-a716-446655440007', order: 4 },
      { id: '550e8400-e29b-41d4-a716-446655440075', name: 'Most Influential', slug: 'most-influential', description: 'People with significant impact and influence', parentId: '550e8400-e29b-41d4-a716-446655440007', order: 5 },
      { id: '550e8400-e29b-41d4-a716-446655440076', name: 'Rising Entrepreneurs', slug: 'rising-entrepreneurs', description: 'Emerging business leaders and innovators', parentId: '550e8400-e29b-41d4-a716-446655440007', order: 6 },
      { id: '550e8400-e29b-41d4-a716-446655440077', name: 'Social Impact Leaders', slug: 'social-impact-leaders', description: 'Individuals driving positive social change', parentId: '550e8400-e29b-41d4-a716-446655440007', order: 7 }
    ];

    let insertedCount = 0;
    let skippedCount = 0;

    // Insert categories one by one, skipping duplicates
    for (const category of categoriesData) {
      if (!existingSlugs.has(category.slug)) {
        try {
          const parentIdValue = category.parentId ? `'${category.parentId}'` : 'NULL';
          const sql = `
            INSERT INTO "Categories" ("id", "name", "slug", "description", "design", "status", "featureImage", "parentId", "order", "isActive", "createdAt", "updatedAt")
            VALUES ('${category.id}', '${category.name.replace(/'/g, "''")}', '${category.slug}', '${category.description.replace(/'/g, "''")}', 'design1', 'active', NULL, ${parentIdValue}, ${category.order}, true, NOW(), NOW())
          `;

          await sequelize.query(sql);
          insertedCount++;
          console.log(`✅ Inserted: ${category.name}`);
        } catch (error) {
          console.error(`❌ Error inserting ${category.name}:`, error.message);
        }
      } else {
        skippedCount++;
        console.log(`⚠️  Skipped (exists): ${category.name}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Inserted: ${insertedCount} categories`);
    console.log(`⚠️  Skipped: ${skippedCount} categories (already exist)`);

    // Verify final count
    const [finalResults] = await sequelize.query('SELECT COUNT(*) as total FROM "Categories"');
    const totalCategories = finalResults[0].total;
    console.log(`📈 Total categories in database: ${totalCategories}`);

    // Show category hierarchy
    const [categories] = await sequelize.query(`
      SELECT
        c1.name as parent_name,
        COUNT(c2.id) as subcategory_count
      FROM "Categories" c1
      LEFT JOIN "Categories" c2 ON c2."parentId" = c1.id
      WHERE c1."parentId" IS NULL
      GROUP BY c1.id, c1.name
      ORDER BY c1.name
    `);

    console.log('\n📂 Category Hierarchy:');
    categories.forEach(cat => {
      console.log(`🏷️  ${cat.parent_name} (${cat.subcategory_count} subcategories)`);
    });

  } catch (error) {
    console.error('❌ Error during category seeding:', error);
    throw error;
  }
};

// Export for use in other scripts
module.exports = { runSeedCategories };

// Run if called directly
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection established successfully.');
      return runSeedCategories();
    })
    .then(() => {
      console.log('🎉 All categories seeded successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Category seeding failed:', error);
      process.exit(1);
    });
}