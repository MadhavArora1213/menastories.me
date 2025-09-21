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

async function checkAuthorsAndAdmins() {
  try {
    console.log('🔍 Checking authors in database...');

    const authorsResult = await pool.query('SELECT id, name, email FROM "Authors" ORDER BY name LIMIT 5');

    console.log(`📊 Found ${authorsResult.rows.length} authors:`);
    authorsResult.rows.forEach((author, index) => {
      console.log(`${index + 1}. ${author.name} (${author.email}) - ID: ${author.id}`);
    });

    console.log('\n🔍 Checking admins in database...');

    const adminsResult = await pool.query('SELECT id, name, email FROM "Admins" ORDER BY name LIMIT 5');

    console.log(`📊 Found ${adminsResult.rows.length} admins:`);
    adminsResult.rows.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ID: ${admin.id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkAuthorsAndAdmins();