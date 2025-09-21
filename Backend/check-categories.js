require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
});

async function checkCategories() {
  try {
    console.log('🔍 Checking categories in database...');

    const result = await pool.query('SELECT id, name, slug FROM "Categories" ORDER BY name');

    console.log(`📊 Found ${result.rows.length} categories:`);
    result.rows.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug}) - ID: ${cat.id}`);
    });

    // Also check flipbooks
    const flipbookResult = await pool.query('SELECT id, title, "accessType", category FROM "flipbook_magazines"');
    console.log(`\n📚 Found ${flipbookResult.rows.length} flipbooks:`);
    flipbookResult.rows.forEach((fb, index) => {
      console.log(`${index + 1}. ${fb.title} - Access: ${fb.accessType}, Category: ${fb.category}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkCategories();