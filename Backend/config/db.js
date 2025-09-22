const { Sequelize } = require('sequelize');
const { Pool } = require('pg');
require('dotenv').config();

let sequelize;
let pool;

// Environment variable validation
const validateEnvironmentVariables = () => {
  const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    return false;
  }

  return true;
};

// Database configuration with SQLite fallback for development
const createConnection = () => {
  // Validate environment variables first
  if (!validateEnvironmentVariables()) {
    throw new Error('Environment variables validation failed');
  }

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
  // Disable SSL for servers that don't support it
  const disableSSLHosts = ['72.60.108.85', 'localhost', '127.0.0.1'];
  const shouldUseSSL = !isLocalConnection && !disableSSLHosts.includes(process.env.DB_HOST);

  const sslConfig = shouldUseSSL ? {
    require: true,
    rejectUnauthorized: false
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
      timezone: '+05:30'
    }
  );

  return sequelize;
};

const createPool = () => {
  // Check if SQLite fallback is enabled
  if (process.env.USE_SQLITE === 'true') {
    console.log('🔄 Using SQLite for local development (Pool not available)...');
    return null;
  }

  // PostgreSQL Pool configuration
  console.log('🔄 Creating PostgreSQL Pool connection...');

  const isLocalConnection = process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';
  const disableSSLHosts = ['72.60.108.85', 'localhost', '127.0.0.1'];
  const shouldUseSSL = !isLocalConnection && !disableSSLHosts.includes(process.env.DB_HOST);

  const sslConfig = shouldUseSSL ? {
    require: true,
    rejectUnauthorized: false
  } : false;

  const poolInstance = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: sslConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  return poolInstance;
};

// Initialize connections
try {
  sequelize = createConnection();
  pool = createPool();
  
  console.log('✅ Database configuration initialized successfully');
} catch (error) {
  console.error('❌ Failed to create database connection:', error.message);
  console.error('Please check your environment variables and database configuration.');
  
  // Create fallback instances to prevent undefined errors
  sequelize = null;
  pool = null;
}

const testConnection = async (retries = 3) => {
  if (!sequelize) {
    console.error('❌ Sequelize instance is not available. Check environment variables.');
    return false;
  }

  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Sequelize connection established successfully.');

      if (pool) {
        const client = await pool.connect();
        console.log('✅ Pool connection established successfully.');
        client.release();
      }

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
  console.log('3. If using Neon, check if your database is paused');
  console.log('4. Try using SQLite for local development');

  return false;
};

// Test connection when module loads (but don't block)
if (sequelize && pool) {
  testConnection().catch(err => {
    console.error('Connection test failed on module load:', err.message);
  });
}

// FIXED: Export sequelize instance directly for models to use
module.exports = sequelize;

// If you need both sequelize and pool elsewhere, create a separate export
module.exports.sequelize = sequelize;
module.exports.pool = pool;