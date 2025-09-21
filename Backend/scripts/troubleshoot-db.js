const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🔧 Database Connection Troubleshooting Tool\n');

// Test different connection methods
const troubleshootDatabase = async () => {
  console.log('1️⃣ Checking environment variables...');
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`   DB_SSL: ${process.env.DB_SSL}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log();

  // Test 1: Cloud Database (Neon)
  if (process.env.DATABASE_URL) {
    console.log('2️⃣ Testing cloud database connection (Neon)...');
    
    const cloudDB = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: false
    });

    try {
      await cloudDB.authenticate();
      console.log('   ✅ Cloud database connection successful!');
      await cloudDB.close();
      return 'cloud';
    } catch (error) {
      console.log('   ❌ Cloud database connection failed:', error.message);
      
      // Common Neon-specific issues
      if (error.message.includes('Connection terminated unexpectedly')) {
        console.log('   💡 This usually means:');
        console.log('      - Your Neon database is paused (auto-pauses after inactivity)');
        console.log('      - Visit https://console.neon.tech to wake up your database');
        console.log('      - Or the connection string has expired');
      }
      
      await cloudDB.close();
    }
  }

  console.log();

  // Test 2: SQLite (Local fallback)
  console.log('3️⃣ Testing SQLite fallback...');
  
  const sqliteDB = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });

  try {
    await sqliteDB.authenticate();
    console.log('   ✅ SQLite connection successful!');
    console.log('   📁 Database file: ./database.sqlite');
    await sqliteDB.close();
    return 'sqlite';
  } catch (error) {
    console.log('   ❌ SQLite connection failed:', error.message);
    await sqliteDB.close();
  }

  console.log();
  console.log('❌ All database connection methods failed!');
  return null;
};

// Provide solutions
const provideSolutions = (workingDB) => {
  console.log('\n🔧 SOLUTIONS:\n');

  if (workingDB === 'cloud') {
    console.log('✅ Your cloud database is working! You can proceed with:');
    console.log('   npm run init-db');
    console.log('   npm run init-roles');
    return;
  }

  if (workingDB === 'sqlite') {
    console.log('✅ SQLite is working! To use SQLite for development:');
    console.log('   1. Update your .env file:');
    console.log('      # Comment out DATABASE_URL');
    console.log('      # DATABASE_URL=...');
    console.log('      USE_SQLITE=true');
    console.log('   2. Then run:');
    console.log('      npm run init-db');
    console.log('      npm run init-roles');
    return;
  }

  console.log('❌ No database connections working. Try these solutions:');
  console.log();
  console.log('FOR NEON DATABASE:');
  console.log('1. Visit https://console.neon.tech');
  console.log('2. Check if your database is paused (common cause)');
  console.log('3. Click to wake up/activate your database');
  console.log('4. Get a fresh connection string if needed');
  console.log('5. Update your .env file with the new connection string');
  console.log();
  console.log('FOR LOCAL DEVELOPMENT:');
  console.log('1. Install PostgreSQL locally:');
  console.log('   - Windows: Download from postgresql.org');
  console.log('   - Mac: brew install postgresql');
  console.log('   - Linux: sudo apt-get install postgresql');
  console.log('2. Create a local database');
  console.log('3. Update .env with local credentials');
  console.log();
  console.log('FOR QUICK TESTING:');
  console.log('1. Use SQLite (no setup required):');
  console.log('   Add USE_SQLITE=true to your .env file');
  console.log('   This will create a local SQLite file');
};

// Run the troubleshooting
const main = async () => {
  try {
    const workingDB = await troubleshootDatabase();
    provideSolutions(workingDB);
  } catch (error) {
    console.error('Troubleshooting failed:', error);
  }
};

main();