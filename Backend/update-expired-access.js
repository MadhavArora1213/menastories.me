require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function updateExpiredAccessTypes() {
  try {
    console.log('🔄 Updating expired access types...');

    // Calculate date 2 months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Update magazines that are older than 2 months and still have 'free' access
    const updateQuery = `
      UPDATE "flipbook_magazines"
      SET "accessType" = 'paid', "updatedAt" = NOW()
      WHERE "accessType" = 'free'
        AND "publishedAt" < $1
        AND "isPublished" = true
    `;

    const result = await pool.query(updateQuery, [twoMonthsAgo]);

    console.log(`✅ Updated ${result.rowCount} magazines from 'free' to 'paid' access type`);

    if (result.rowCount > 0) {
      // Get the updated magazines for logging
      const selectQuery = `
        SELECT id, title, "publishedAt"
        FROM "flipbook_magazines"
        WHERE "accessType" = 'paid'
          AND "updatedAt" >= NOW() - INTERVAL '1 minute'
      `;

      const updatedMagazines = await pool.query(selectQuery);
      console.log('📋 Updated magazines:');
      updatedMagazines.rows.forEach(magazine => {
        console.log(`   - ${magazine.title} (ID: ${magazine.id})`);
      });
    }

    return result.rowCount;

  } catch (error) {
    console.error('❌ Error updating expired access types:', error);
    return 0;
  } finally {
    await pool.end();
  }
}

// Run the update
updateExpiredAccessTypes().then((count) => {
  console.log(`🎉 Access type update completed. ${count} magazines updated.`);
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});