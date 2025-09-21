require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Use the same connection as the main app
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
  },
  logging: console.log
});

async function fixUserSchema() {
  try {
    console.log('Starting User table schema fix...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if name column exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users' AND column_name = 'name'
    `);

    if (results.length === 0) {
      console.log('Adding missing "name" column to Users table...');
      
      // Add the missing name column
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN IF NOT EXISTS "name" VARCHAR(255) NOT NULL DEFAULT 'Unknown User'
      `);
      
      console.log('✅ "name" column added successfully');
    } else {
      console.log('✅ "name" column already exists');
    }

    // Check for other potentially missing columns and add them
    const requiredColumns = [
      { name: 'isMfaEnabled', type: 'BOOLEAN DEFAULT false' },
      { name: 'mfaSecret', type: 'VARCHAR(255)' },
      { name: 'mfaBackupCodes', type: 'JSONB' },
      { name: 'phoneNumber', type: 'VARCHAR(255)' },
      { name: 'isAccountLocked', type: 'BOOLEAN DEFAULT false' },
      { name: 'lockoutUntil', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'failedLoginAttempts', type: 'INTEGER DEFAULT 0' },
      { name: 'lastLoginAt', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'lastLoginIp', type: 'VARCHAR(255)' },
      { name: 'passwordResetToken', type: 'VARCHAR(255)' },
      { name: 'passwordResetExpires', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'refreshToken', type: 'TEXT' },
      { name: 'refreshTokenExpires', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'termsAccepted', type: 'BOOLEAN DEFAULT false' },
      { name: 'termsAcceptedAt', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'termsVersion', type: 'VARCHAR(255) DEFAULT \'1.0\'' },
      { name: 'avatar', type: 'VARCHAR(255)' },
      { name: 'bio', type: 'TEXT' },
      { name: 'isActive', type: 'BOOLEAN DEFAULT true' }
    ];

    for (const column of requiredColumns) {
      const [columnExists] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = '${column.name}'
      `);

      if (columnExists.length === 0) {
        console.log(`Adding missing "${column.name}" column...`);
        await sequelize.query(`
          ALTER TABLE "Users" 
          ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type}
        `);
        console.log(`✅ "${column.name}" column added`);
      }
    }

    console.log('✅ User table schema fix completed successfully');

  } catch (error) {
    console.error('❌ Error fixing User schema:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixUserSchema()
  .then(() => {
    console.log('Schema fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Schema fix failed:', error);
    process.exit(1);
  });