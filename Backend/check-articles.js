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

async function checkArticles() {
  try {
    console.log('🔍 Checking articles in database...');

    // First, find news category
    const catResult = await pool.query('SELECT id, name, slug FROM "Categories" WHERE name ILIKE \'%news%\' LIMIT 1');

    if (catResult.rows.length === 0) {
      console.log('No news category found. Listing all categories:');
      const allCats = await pool.query('SELECT id, name, slug FROM "Categories" ORDER BY name');
      allCats.rows.forEach(cat => console.log(`${cat.name} (${cat.slug}) - ID: ${cat.id}`));
      return;
    }

    const newsCategory = catResult.rows[0];
    console.log(`Found news category: ${newsCategory.name} (${newsCategory.id})`);

    // Get articles in news category
    const articles = await pool.query(`
      SELECT id, title, tags
      FROM "Articles"
      WHERE "categoryId" = $1 AND status = 'published'
      LIMIT 10
    `, [newsCategory.id]);

    console.log(`📊 Found ${articles.rows.length} published articles in news category:`);
    articles.rows.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Tags: ${article.tags ? article.tags.join(', ') : 'None'}`);
      console.log(`   ID: ${article.id}`);
      console.log('');
    });

    // Collect all unique tags
    const allTags = new Set();
    articles.rows.forEach(article => {
      if (article.tags) {
        article.tags.forEach(tag => allTags.add(tag));
      }
    });

    console.log('All unique tags in news articles:');
    console.log(Array.from(allTags).join(', '));

    // Get an author ID
    const authorResult = await pool.query('SELECT id, name FROM "Authors" LIMIT 1');
    if (authorResult.rows.length > 0) {
      console.log(`Sample Author ID: ${authorResult.rows[0].id} (${authorResult.rows[0].name})`);
    }

    // Get an admin ID
    const adminResult = await pool.query('SELECT id, name FROM "Admins" LIMIT 1');
    if (adminResult.rows.length > 0) {
      console.log(`Sample Admin ID: ${adminResult.rows[0].id} (${adminResult.rows[0].name})`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkArticles();