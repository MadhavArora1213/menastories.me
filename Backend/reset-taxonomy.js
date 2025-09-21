require('dotenv').config();
const { Category, Subcategory } = require('./models');
const sequelize = require('./config/db');

// New taxonomy data
const categories = [
  { id: 1, name: 'News Content', description: 'News articles, reporting, and editorial content' },
  { id: 2, name: 'Geographic Coverage', description: 'Regional and country-specific content location' },
  { id: 3, name: 'Real Estate', description: 'Real estate sectors and property-related classifications' },
  { id: 4, name: 'Industries', description: 'Business sectors and industry verticals' },
  { id: 5, name: 'Finance', description: 'Company size, maturity, funding, and financial classifications' },
  { id: 6, name: 'Consumer Categories', description: 'Lifestyle segments and consumer behavior patterns' },
  { id: 7, name: 'Web3', description: 'Blockchain, crypto, and decentralized technologies' },
  { id: 8, name: 'Hospitality', description: 'Hospitality, tourism, and accommodation industry' }
];

const subcategories = [
  // News Content (Category 1)
  { id: 1, name: 'Hard News', categoryId: 1 },
  { id: 2, name: 'Soft News', categoryId: 1 },
  { id: 3, name: 'Investigative Reporting', categoryId: 1 },
  { id: 4, name: 'Feature Articles', categoryId: 1 },
  { id: 5, name: 'Analysis & Commentary', categoryId: 1 },
  { id: 6, name: 'Opinion Pieces', categoryId: 1 },
  { id: 7, name: 'Commentary', categoryId: 1 },
  { id: 8, name: 'Columns', categoryId: 1 },
  { id: 9, name: 'Letters to Editor', categoryId: 1 },
  { id: 10, name: 'Market Reports', categoryId: 1 },
  { id: 11, name: 'Earnings Coverage', categoryId: 1 },
  { id: 12, name: 'Economic Analysis', categoryId: 1 },
  { id: 13, name: 'Industry Reports', categoryId: 1 },
  { id: 14, name: 'Executive Profiles', categoryId: 1 },
  { id: 15, name: 'Company News', categoryId: 1 },
  { id: 16, name: 'Video Content', categoryId: 1 },
  { id: 17, name: 'Audio Content', categoryId: 1 },
  { id: 18, name: 'Visual Content', categoryId: 1 },
  { id: 19, name: 'Interactive Content', categoryId: 1 },
  { id: 20, name: 'Social Media Content', categoryId: 1 },
  { id: 21, name: 'Newsletter Content', categoryId: 1 },
  { id: 22, name: 'Mobile-Specific', categoryId: 1 },
  { id: 23, name: 'Emerging Formats', categoryId: 1 },

  // Geographic Coverage (Category 2)
  { id: 24, name: 'Global', categoryId: 2 },
  { id: 25, name: 'East Asia and Pacific', categoryId: 2 },
  { id: 26, name: 'Europe and Central Asia', categoryId: 2 },
  { id: 27, name: 'Latin America and Caribbean', categoryId: 2 },
  { id: 28, name: 'Middle East, North Africa, Afghanistan and Pakistan', categoryId: 2 },
  { id: 29, name: 'North America', categoryId: 2 },
  { id: 30, name: 'South Asia', categoryId: 2 },
  { id: 31, name: 'Sub-Saharan Africa', categoryId: 2 },
  { id: 32, name: 'Northeast Asia', categoryId: 2 },
  { id: 33, name: 'Southeast Asia (ASEAN)', categoryId: 2 },
  { id: 34, name: 'Oceania', categoryId: 2 },
  { id: 35, name: 'Western Europe', categoryId: 2 },
  { id: 36, name: 'Eastern Europe', categoryId: 2 },
  { id: 37, name: 'Balkans', categoryId: 2 },
  { id: 38, name: 'Central Asia', categoryId: 2 },
  { id: 39, name: 'South America', categoryId: 2 },
  { id: 40, name: 'Central America', categoryId: 2 },
  { id: 41, name: 'Caribbean', categoryId: 2 },
  { id: 42, name: 'Gulf Cooperation Council (GCC)', categoryId: 2 },
  { id: 43, name: 'Middle East', categoryId: 2 },
  { id: 44, name: 'North Africa', categoryId: 2 },
  { id: 45, name: 'Extended Region', categoryId: 2 },
  { id: 46, name: 'West Africa', categoryId: 2 },
  { id: 47, name: 'East Africa', categoryId: 2 },
  { id: 48, name: 'Central Africa', categoryId: 2 },
  { id: 49, name: 'Southern Africa', categoryId: 2 },

  // Real Estate (Category 3)
  { id: 50, name: 'Residential Real Estate', categoryId: 3 },
  { id: 51, name: 'Commercial Real Estate', categoryId: 3 },
  { id: 52, name: 'Industrial Real Estate', categoryId: 3 },
  { id: 53, name: 'Retail Properties', categoryId: 3 },
  { id: 54, name: 'Real Estate Investment Trusts (REITs)', categoryId: 3 },
  { id: 55, name: 'Property Management', categoryId: 3 },
  { id: 56, name: 'Real Estate Development', categoryId: 3 },
  { id: 57, name: 'PropTech', categoryId: 3 },

  // Industries (Category 4)
  { id: 57, name: 'Technology & Digital', categoryId: 4 },
  { id: 58, name: 'Financial Services', categoryId: 4 },
  { id: 60, name: 'Healthcare & Life Sciences', categoryId: 4 },
  { id: 61, name: 'Manufacturing & Industrial', categoryId: 4 },
  { id: 62, name: 'Consumer Goods & Retail', categoryId: 4 },
  { id: 63, name: 'Real Estate & Construction', categoryId: 4 },
  { id: 64, name: 'Media & Entertainment', categoryId: 4 },
  { id: 65, name: 'Education', categoryId: 4 },
  { id: 66, name: 'Agriculture & Food', categoryId: 4 },
  { id: 67, name: 'Software & Services', categoryId: 4 },
  { id: 68, name: 'Hardware & Equipment', categoryId: 4 },
  { id: 69, name: 'Internet & Digital Media', categoryId: 4 },
  { id: 70, name: 'Fintech', categoryId: 4 },
  { id: 71, name: 'Web3 & Blockchain', categoryId: 4 },
  { id: 72, name: 'Banking', categoryId: 4 },
  { id: 73, name: 'Insurance', categoryId: 4 },
  { id: 74, name: 'Investment Management', categoryId: 4 },
  { id: 75, name: 'Capital Markets', categoryId: 4 },
  { id: 76, name: 'Pharmaceuticals', categoryId: 4 },
  { id: 77, name: 'Medical Devices', categoryId: 4 },
  { id: 78, name: 'Healthcare Services', categoryId: 4 },
  { id: 79, name: 'Digital Health', categoryId: 4 },
  { id: 80, name: 'Oil & Gas', categoryId: 4 },
  { id: 81, name: 'Renewable Energy', categoryId: 4 },
  { id: 82, name: 'Electric Utilities', categoryId: 4 },
  { id: 83, name: 'Clean Technology', categoryId: 4 },
  { id: 84, name: 'Automotive', categoryId: 4 },
  { id: 85, name: 'Aerospace & Defense', categoryId: 4 },
  { id: 86, name: 'Industrial Equipment', categoryId: 4 },
  { id: 87, name: 'Materials', categoryId: 4 },
  { id: 88, name: 'Consumer Products', categoryId: 4 },
  { id: 89, name: 'Fashion & Apparel', categoryId: 4 },
  { id: 90, name: 'Retail', categoryId: 4 },
  { id: 91, name: 'Hospitality', categoryId: 4 },
  { id: 92, name: 'Residential Real Estate', categoryId: 4 },
  { id: 93, name: 'Commercial Real Estate', categoryId: 4 },
  { id: 94, name: 'Construction', categoryId: 4 },
  { id: 95, name: 'Property Technology (PropTech)', categoryId: 4 },
  { id: 96, name: 'Traditional Media', categoryId: 4 },
  { id: 97, name: 'Digital Media', categoryId: 4 },
  { id: 98, name: 'Entertainment', categoryId: 4 },
  { id: 99, name: 'Advertising', categoryId: 4 },
  { id: 100, name: 'Higher Education', categoryId: 4 },
  { id: 101, name: 'K-12 Education', categoryId: 4 },
  { id: 102, name: 'EdTech', categoryId: 4 },
  { id: 103, name: 'Professional Training', categoryId: 4 },
  { id: 104, name: 'Crop Production', categoryId: 4 },
  { id: 105, name: 'Livestock', categoryId: 4 },
  { id: 106, name: 'Food Processing', categoryId: 4 },
  { id: 107, name: 'Agricultural Technology', categoryId: 4 },

  // Finance (Category 5)
  { id: 108, name: 'Banking', categoryId: 5 },
  { id: 109, name: 'Insurance', categoryId: 5 },
  { id: 110, name: 'Investment Management', categoryId: 5 },
  { id: 111, name: 'Capital Markets', categoryId: 5 },
  { id: 112, name: 'Fintech', categoryId: 5 },
  { id: 113, name: 'Private Equity', categoryId: 5 },
  { id: 114, name: 'Venture Capital', categoryId: 5 },
  { id: 115, name: 'Hedge Funds', categoryId: 5 },
  { id: 116, name: 'Pre-Seed Funding', categoryId: 5 },
  { id: 117, name: 'Seed Funding', categoryId: 5 },
  { id: 118, name: 'Series A', categoryId: 5 },
  { id: 119, name: 'Series B', categoryId: 5 },
  { id: 120, name: 'Series C+', categoryId: 5 },
  { id: 121, name: 'IPO/Exit', categoryId: 5 },

  // Consumer Categories (Category 6)
  { id: 122, name: 'Innovators', categoryId: 6 },
  { id: 123, name: 'Thinkers', categoryId: 6 },
  { id: 124, name: 'Achievers', categoryId: 6 },
  { id: 125, name: 'Experiencers', categoryId: 6 },
  { id: 126, name: 'Believers', categoryId: 6 },
  { id: 127, name: 'Strivers', categoryId: 6 },
  { id: 128, name: 'Makers', categoryId: 6 },
  { id: 129, name: 'Survivors', categoryId: 6 },
  { id: 130, name: 'Health & Fitness', categoryId: 6 },
  { id: 131, name: 'Technology', categoryId: 6 },
  { id: 132, name: 'Luxury & Premium', categoryId: 6 },
  { id: 133, name: 'Environmental', categoryId: 6 },
  { id: 134, name: 'Young Adults (18-30)', categoryId: 6 },
  { id: 135, name: 'Young Families (30-45)', categoryId: 6 },
  { id: 136, name: 'Established Families (35-55)', categoryId: 6 },
  { id: 137, name: 'Empty Nesters (50-70)', categoryId: 6 },
  { id: 138, name: 'Retirees (65+)', categoryId: 6 },

  // Web3 (Category 7)
  { id: 139, name: 'Blockchain', categoryId: 7 },
  { id: 140, name: 'Cryptocurrencies', categoryId: 7 },
  { id: 141, name: 'Non-Fungible Tokens (NFTs)', categoryId: 7 },
  { id: 142, name: 'Decentralized Finance (DeFi)', categoryId: 7 },
  { id: 143, name: 'Decentralized Applications (dApps)', categoryId: 7 },
  { id: 144, name: 'DAOs (Decentralized Autonomous Organizations)', categoryId: 7 },
  { id: 145, name: 'Smart Contracts', categoryId: 7 },
  { id: 146, name: 'Web3 Gaming', categoryId: 7 },
  { id: 147, name: 'Metaverse', categoryId: 7 },
  { id: 148, name: 'Tokenization', categoryId: 7 },
  { id: 149, name: 'Layer 1 Protocols', categoryId: 7 },
  { id: 150, name: 'Layer 2 Solutions', categoryId: 7 },

  // Hospitality (Category 8)
  { id: 179, name: 'Hotels & Accommodations', categoryId: 8 },
  { id: 180, name: 'Restaurants & Food Service', categoryId: 8 },
  { id: 181, name: 'Travel & Tourism', categoryId: 8 },
  { id: 182, name: 'Luxury Hotels', categoryId: 8 },
  { id: 183, name: 'Budget Accommodations', categoryId: 8 },
  { id: 184, name: 'Resort Management', categoryId: 8 },
  { id: 185, name: 'Event Management', categoryId: 8 },
  { id: 186, name: 'Cruise Industry', categoryId: 8 },
  { id: 187, name: 'Airlines', categoryId: 8 },
  { id: 188, name: 'Food & Beverage', categoryId: 8 },
  { id: 189, name: 'Hotel Technology', categoryId: 8 },
  { id: 190, name: 'Tourism Boards', categoryId: 8 },
  { id: 191, name: 'Hospitality Management', categoryId: 8 },
  { id: 192, name: 'Guest Services', categoryId: 8 },
  { id: 193, name: 'Hospitality Innovation', categoryId: 8 }
];

// Helper function to generate slug
function generateSlug(name, existingSlugs = new Set()) {
  let baseSlug = name
    .toLowerCase()
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

async function resetTaxonomy() {
  try {
    console.log('🔄 Connecting to database...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      console.log('\n🗑️  Deleting existing subcategories...');
      await Subcategory.destroy({ where: {}, transaction });

      console.log('🗑️  Deleting existing categories...');
      await Category.destroy({ where: {}, transaction });

      console.log('\n📝 Inserting new categories...');

      // Track existing slugs to avoid duplicates
      const existingSlugs = new Set();

      // Insert categories with generated slugs
      const categoryInserts = categories.map(cat => ({
        name: cat.name,
        slug: generateSlug(cat.name, existingSlugs),
        description: cat.description,
        status: 'active',
        isActive: true,
        order: cat.id
      }));

      await Category.bulkCreate(categoryInserts, { transaction });

      console.log('✅ Categories inserted successfully');

      // Get the inserted categories to map their IDs
      const insertedCategories = await Category.findAll({
        attributes: ['id', 'name', 'order'],
        order: [['order', 'ASC']],
        transaction
      });

      // Create a mapping from the original category ID to the new UUID
      const categoryIdMap = {};
      insertedCategories.forEach((cat, index) => {
        categoryIdMap[(index + 1).toString()] = cat.id;
      });

      console.log('\n📝 Inserting new subcategories...');

      // Insert subcategories with generated slugs
      const subcategoryInserts = subcategories.map(sub => ({
        name: sub.name,
        slug: generateSlug(sub.name, existingSlugs),
        categoryId: categoryIdMap[sub.categoryId.toString()],
        status: 'active',
        isActive: true,
        type: 'regular',
        order: sub.id
      }));

      await Subcategory.bulkCreate(subcategoryInserts, { transaction });

      console.log('✅ Subcategories inserted successfully');

      // Commit transaction
      await transaction.commit();

      console.log('\n📊 SUMMARY:');
      console.log(`Categories inserted: ${categories.length}`);
      console.log(`Subcategories inserted: ${subcategories.length}`);
      console.log('✅ Taxonomy reset completed successfully!');

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error resetting taxonomy:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the reset
if (require.main === module) {
  resetTaxonomy().catch(console.error);
}

module.exports = { resetTaxonomy };