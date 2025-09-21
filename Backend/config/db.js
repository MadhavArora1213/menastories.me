const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Database configuration with SQLite fallback for development
const createConnection = () => {
  // Check if SQLite fallback is enabled
  if (process.env.USE_SQLITE === 'true') {
    console.log('🔄 Using SQLite for local development...');

    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    });

    return sequelize;
  }

  // PostgreSQL configuration
  console.log('🔄 Connecting to PostgreSQL database...');

  // Determine if SSL should be used (only for remote connections)
  const isLocalConnection = process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';
  // Disable SSL for servers that don't support it (e.g., specific IP addresses)
  const disableSSLHosts = ['72.60.108.85', 'localhost', '127.0.0.1']; // Add hosts that don't support SSL
  const shouldUseSSL = !isLocalConnection && !disableSSLHosts.includes(process.env.DB_HOST);

  const sslConfig = shouldUseSSL ? {
    require: true,
    rejectUnauthorized: false // Set to true in production with proper certificates
  } : false;

  console.log('🔐 SSL Configuration Debug:');
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- isLocalConnection:', isLocalConnection);
  console.log('- disableSSLHosts.includes(DB_HOST):', disableSSLHosts.includes(process.env.DB_HOST));
  console.log('- shouldUseSSL:', shouldUseSSL);
  console.log('- sslConfig:', sslConfig);

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      dialectOptions: sslConfig ? { ssl: sslConfig } : {},
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      timezone: '+05:30' // Set to India timezone
    }
  );

  return sequelize;
};

// Create the connection
sequelize = createConnection();

const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error.message);
      
      if (i < retries - 1) {
        console.log(`⏳ Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.error('❌ All database connection attempts failed.');
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Check if your database is running and accessible');
  console.log('2. Verify your database credentials in .env file');
  console.log('3. If using Neon, check if your database is paused (visit neon.tech dashboard)');
  console.log('4. Try using SQLite for local development (see documentation)');
  
  return false;
};

// Test connection when module loads
testConnection();

module.exports = sequelize;