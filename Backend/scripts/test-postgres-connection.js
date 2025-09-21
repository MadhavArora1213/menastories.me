const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🔗 Testing PostgreSQL connection...');
console.log(`📍 Host: ${process.env.DB_HOST}`);
console.log(`📊 Database: ${process.env.DB_NAME}`);
console.log(`👤 User: ${process.env.DB_USER}`);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // TODO: Set to true in production with proper SSL certificates
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection successful!');

    // Test basic query
    const result = await sequelize.query('SELECT version()', { type: sequelize.QueryTypes.SELECT });
    console.log('📋 PostgreSQL version:', result[0].version);

    // Check if database is empty
    const tablesResult = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(`\n📊 Found ${tablesResult.length} tables in database:`);
    if (tablesResult.length > 0) {
      tablesResult.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });

      // Check data in key tables
      console.log('\n📈 Checking data in migrated tables:');

      // Check Categories
      try {
        const categoriesResult = await sequelize.query('SELECT COUNT(*) as count FROM "Categories"', { type: sequelize.QueryTypes.SELECT });
        console.log(`   📂 Categories: ${categoriesResult[0].count} records`);
      } catch (err) {
        console.log('   📂 Categories: Table not found or error');
      }

      // Check Tags
      try {
        const tagsResult = await sequelize.query('SELECT COUNT(*) as count FROM "Tags"', { type: sequelize.QueryTypes.SELECT });
        console.log(`   🏷️  Tags: ${tagsResult[0].count} records`);
      } catch (err) {
        console.log('   🏷️  Tags: Table not found or error');
      }

    } else {
      console.log('ℹ️  Database is empty (no tables found)');
    }

  } catch (error) {
    console.error('❌ PostgreSQL connection failed:');
    console.error('Error:', error.message);

    if (error.original) {
      console.error('Original error:', error.original.message);
    }

    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check if PostgreSQL server is running');
    console.log('2. Verify database credentials in .env file');
    console.log('3. Ensure database exists and user has access');
    console.log('4. Check firewall settings');
    console.log('5. Verify host and port are correct');

  } finally {
    await sequelize.close();
  }
}

testConnection();