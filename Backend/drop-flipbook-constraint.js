const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function dropConstraint() {
  try {
    console.log('Dropping foreign key constraint...');

    // Drop the foreign key constraint
    await pool.query(`
      ALTER TABLE "flipbook_magazines"
      DROP CONSTRAINT IF EXISTS "flipbook_magazines_createdBy_fkey"
    `);

    console.log('✅ Foreign key constraint dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping constraint:', error);
  } finally {
    await pool.end();
  }
}

dropConstraint();