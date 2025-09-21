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

async function checkVideoArticlesTable() {
  try {
    console.log('🔍 Checking VideoArticles table structure...');

    // Check if table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'VideoArticles'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ VideoArticles table does not exist');
      return;
    }

    console.log('✅ VideoArticles table exists');

    // Get column information
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'VideoArticles'
      ORDER BY ordinal_position;
    `);

    console.log(`📊 Found ${columns.rows.length} columns:`);
    columns.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check existing records
    const records = await pool.query('SELECT COUNT(*) as count FROM "VideoArticles"');
    console.log(`📈 Total records: ${records.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkVideoArticlesTable();