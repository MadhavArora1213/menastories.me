require('dotenv').config();
const { Pool } = require('pg');
const { Category, Subcategory } = require('./models');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkDatabaseContent() {
  try {
    console.log('🔍 Checking database content...\n');

    // Check categories
    console.log('📂 CATEGORIES:');
    const categories = await Category.findAll({
      order: [['createdAt', 'ASC']]
    });

    console.log(`Total categories found: ${categories.length}`);
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (ID: ${cat.id})`);
    });

    console.log('\n📝 SUBCATEGORIES:');

    // Check subcategories with category info
    const subcategories = await Subcategory.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }],
      order: [['categoryId', 'ASC'], ['order', 'ASC']]
    });

    console.log(`Total subcategories found: ${subcategories.length}`);

    // Group by category
    const categoryGroups = {};
    subcategories.forEach(sub => {
      const catName = sub.category?.name || 'Unknown';
      if (!categoryGroups[catName]) {
        categoryGroups[catName] = [];
      }
      categoryGroups[catName].push(sub);
    });

    // Display grouped results
    Object.entries(categoryGroups).forEach(([catName, subs]) => {
      console.log(`\n${catName} (${subs.length} subcategories):`);
      subs.forEach((sub, index) => {
        console.log(`  ${index + 1}. ${sub.name} (slug: ${sub.slug})`);
      });
    });

    // Check for any orphaned subcategories
    console.log('\n🔍 Checking for orphaned subcategories...');
    const orphanedSubs = await Subcategory.findAll({
      include: [{
        model: Category,
        as: 'category',
        required: false
      }],
      where: {
        '$category.id$': null
      }
    });

    if (orphanedSubs.length > 0) {
      console.log(`⚠️  Found ${orphanedSubs.length} orphaned subcategories:`);
      orphanedSubs.forEach(sub => {
        console.log(`  - ${sub.name} (ID: ${sub.id})`);
      });
    } else {
      console.log('✅ No orphaned subcategories found.');
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   • Categories: ${categories.length}`);
    console.log(`   • Subcategories: ${subcategories.length}`);
    console.log(`   • Expected total: 7 categories + 56 subcategories`);

    const expectedTotal = 56;
    if (subcategories.length === expectedTotal) {
      console.log('✅ All subcategories accounted for!');
    } else {
      console.log(`❌ Missing ${expectedTotal - subcategories.length} subcategories`);
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

async function testDatabaseContent() {
  try {
    console.log('Testing database connection and content...\n');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');
    
    // Check tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    const tablesResult = await pool.query(tablesQuery);
    console.log('📋 Available tables:');
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
    console.log();
    
    // Count records in each table
    const tables = ['Tags', 'Categories', 'Articles', 'ArticleTags'];
    
    for (const table of tables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(countResult.rows[0].count);
        console.log(`📊 ${table}: ${count} records`);
        
        // Show sample data
        if (count > 0) {
          const sampleResult = await pool.query(`SELECT * FROM ${table} LIMIT 3`);
          console.log(`   Sample data:`);
          sampleResult.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(row)}`);
          });
          console.log();
        }
      } catch (error) {
        console.log(`❌ Error checking ${table}: ${error.message}`);
      }
    }
    
    // Test the API query for tags
    console.log('🔍 Testing tags API query...');
    const tagsQuery = `
      SELECT t.*, COUNT(at."ArticleId") as article_count
      FROM "Tags" t
      LEFT JOIN "ArticleTags" at ON t.id = at."TagId"
      GROUP BY t.id, t.name, t.slug, t."createdAt", t."updatedAt"
      ORDER BY t.name ASC
    `;
    
    const tagsResult = await pool.query(tagsQuery);
    console.log(`Tags query returned ${tagsResult.rows.length} results`);
    tagsResult.rows.slice(0, 5).forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag.name} (${tag.article_count} articles)`);
    });
    console.log();
    
    // Test the API query for categories
    console.log('🔍 Testing categories API query...');
    const categoriesQuery = `
      SELECT c.*, COUNT(ac."ArticleId") as article_count
      FROM "Categories" c
      LEFT JOIN "ArticleCategories" ac ON c.id = ac."CategoryId"
      GROUP BY c.id, c.name, c.slug, c.description, c."createdAt", c."updatedAt"
      ORDER BY c.name ASC
    `;
    
    const categoriesResult = await pool.query(categoriesQuery);
    console.log(`Categories query returned ${categoriesResult.rows.length} results`);
    categoriesResult.rows.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} (${category.article_count} articles)`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the checks
checkDatabaseContent().catch(console.error);
testDatabaseContent();