const sequelize = require('../config/db');

async function fixEventForeignKey() {
  try {
    console.log('🔄 Connecting to database...');

    // Drop the existing foreign key constraint
    console.log('🗑️ Dropping existing foreign key constraint...');
    await sequelize.query(`
      ALTER TABLE "events"
      DROP CONSTRAINT IF EXISTS "events_createdBy_fkey";
    `);

    // Add the new foreign key constraint pointing to Admins table
    console.log('🔗 Adding new foreign key constraint to Admins table...');
    await sequelize.query(`
      ALTER TABLE "events"
      ADD CONSTRAINT "events_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "Admins"("id") ON DELETE SET NULL;
    `);

    console.log('✅ Foreign key constraint updated successfully!');
    console.log('🎉 Events table now properly references Admins table.');

  } catch (error) {
    console.error('❌ Error fixing foreign key constraint:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixEventForeignKey();