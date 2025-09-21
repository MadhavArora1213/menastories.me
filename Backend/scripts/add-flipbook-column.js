const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addFlipbookColumn() {
  try {
    console.log('Adding originalFilePath column to flipbook_magazines table...');

    const query = `
      ALTER TABLE "flipbook_magazines"
      ADD COLUMN IF NOT EXISTS "originalFilePath" VARCHAR(500);
    `;

    await pool.query(query);
    console.log('✅ Successfully added originalFilePath column');

    // Test the column exists
    const testQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'flipbook_magazines'
      AND column_name = 'originalFilePath';
    `;

    const result = await pool.query(testQuery);
    if (result.rows.length > 0) {
      console.log('✅ Column originalFilePath exists in flipbook_magazines table');
    } else {
      console.log('❌ Column originalFilePath was not added');
    }

  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addFlipbookColumn()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

module.exports = addFlipbookColumn;