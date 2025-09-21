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

async function verifyVideoArticles() {
  try {
    console.log('🔍 Verifying video articles in News Content category...');

    const result = await pool.query(`
      SELECT
        va.id,
        va.title,
        va.slug,
        va.status,
        va."videoType",
        va."youtubeUrl",
        va."categoryId",
        c.name as category_name,
        a.name as author_name,
        va."createdAt"
      FROM "VideoArticles" va
      JOIN "Categories" c ON va."categoryId" = c.id
      JOIN "Authors" a ON va."authorId" = a.id
      ORDER BY va."createdAt" DESC
    `);

    console.log(`📊 Found ${result.rows.length} video articles:`);
    result.rows.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Status: ${article.status}`);
      console.log(`   Video Type: ${article.videoType}`);
      console.log(`   Category: ${article.category_name}`);
      console.log(`   Author: ${article.author_name}`);
      console.log(`   YouTube URL: ${article.youtubeUrl}`);
      console.log(`   Created: ${article.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

verifyVideoArticles();