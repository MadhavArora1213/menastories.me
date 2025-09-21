const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    ssl: false
  }
);

async function checkMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    const [results] = await sequelize.query(`
      SELECT name
      FROM "SequelizeMeta"
      ORDER BY name;
    `);

    console.log('\n📋 Completed migrations:');
    results.forEach(row => {
      console.log(`- ${row.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkMigrations();