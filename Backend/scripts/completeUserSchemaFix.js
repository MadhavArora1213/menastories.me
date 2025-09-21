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

async function completeUserSchemaFix() {
  try {
    console.log('Starting complete User table schema fix...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Get all existing columns
    const [existingColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
    `);
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('Existing columns:', existingColumnNames);

    // Define all required columns with their full specifications
    const requiredColumns = [
      { name: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()' },
      { name: 'name', type: 'VARCHAR(255) NOT NULL DEFAULT \'Unknown User\'' },
      { name: 'email', type: 'VARCHAR(255) NOT NULL UNIQUE' },
      { name: 'password', type: 'VARCHAR(255) NOT NULL' },
      { name: 'isEmailVerified', type: 'BOOLEAN DEFAULT false' },
      { name: 'roleId', type: 'UUID REFERENCES "Roles"(id)' },
      { name: 'isMfaEnabled', type: 'BOOLEAN DEFAULT false' },
      { name: 'mfaSecret', type: 'VARCHAR(255)' },
      { name: 'mfaBackupCodes', type: 'JSONB DEFAULT \'[]\'' },
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
      { name: 'isActive', type: 'BOOLEAN DEFAULT true' },
      { name: 'createdAt', type: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' }
    ];

    // Add missing columns
    for (const column of requiredColumns) {
      if (!existingColumnNames.includes(column.name)) {
        console.log(`Adding missing "${column.name}" column...`);
        try {
          await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type}
          `);
          console.log(`✅ "${column.name}" column added successfully`);
        } catch (error) {
          console.log(`⚠️  Warning: Could not add "${column.name}": ${error.message}`);
        }
      } else {
        console.log(`✅ "${column.name}" column already exists`);
      }
    }

    // Update the updatedAt trigger if it doesn't exist
    console.log('Setting up updatedAt trigger...');
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await sequelize.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON "Users";
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON "Users" 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Complete User table schema fix completed successfully');

  } catch (error) {
    console.error('❌ Error fixing User schema:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the fix
completeUserSchemaFix()
  .then(() => {
    console.log('Complete schema fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Complete schema fix failed:', error);
    process.exit(1);
  });