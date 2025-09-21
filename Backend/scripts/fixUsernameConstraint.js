require('dotenv').config();
const { Sequelize } = require('sequelize');

// Use the same connection as the main app
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
  },
  logging: console.log
});

async function fixUsernameConstraint() {
  try {
    console.log('Fixing username constraint...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Make username column nullable and give it a default value
    console.log('Making username column nullable...');
    await sequelize.query(`
      ALTER TABLE "Users" ALTER COLUMN "username" DROP NOT NULL;
    `);
    console.log('✅ Username constraint removed');

    // Set a default value for existing null usernames
    console.log('Setting default values for null usernames...');
    await sequelize.query(`
      UPDATE "Users" SET "username" = "email" WHERE "username" IS NULL;
    `);
    console.log('✅ Default usernames set');

    // Also fix any other problematic constraints
    console.log('Checking other potential issues...');
    
    // Make firstName and lastName nullable if they exist
    const [columns] = await sequelize.query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Users' AND column_name IN ('firstName', 'lastName')
    `);
    
    for (const column of columns) {
      if (column.is_nullable === 'NO') {
        console.log(`Making ${column.column_name} nullable...`);
        await sequelize.query(`
          ALTER TABLE "Users" ALTER COLUMN "${column.column_name}" DROP NOT NULL;
        `);
        console.log(`✅ ${column.column_name} constraint removed`);
      }
    }

    console.log('✅ Username constraint fix completed successfully');

  } catch (error) {
    console.error('❌ Error fixing username constraint:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixUsernameConstraint()
  .then(() => {
    console.log('Username constraint fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Username constraint fix failed:', error);
    process.exit(1);
  });