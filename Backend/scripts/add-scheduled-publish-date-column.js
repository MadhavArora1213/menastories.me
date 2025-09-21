const { Client } = require('pg');
require('dotenv').config();

const addScheduledPublishDateColumn = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Articles' AND column_name = 'scheduled_publish_date';
    `;

    const result = await client.query(checkColumnQuery);

    if (result.rows.length > 0) {
      console.log('Column scheduled_publish_date already exists');
    } else {
      // Add the column
      const addColumnQuery = `
        ALTER TABLE "Articles" ADD COLUMN "scheduled_publish_date" TIMESTAMP;
      `;

      await client.query(addColumnQuery);
      console.log('✅ Added scheduled_publish_date column to Articles table');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
};

// Run the script
addScheduledPublishDateColumn().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});