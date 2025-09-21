const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '72.60.108.85',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'magazine',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'Advocate@vandan@28',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function dropConstraint() {
  try {
    console.log('Connecting to database...');

    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');

    console.log('Dropping foreign key constraint...');

    // Drop the foreign key constraint
    await client.query(`
      ALTER TABLE "flipbook_magazines"
      DROP CONSTRAINT IF EXISTS "flipbook_magazines_createdBy_fkey"
    `);

    console.log('✅ Foreign key constraint dropped successfully');

    client.release();
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

dropConstraint();