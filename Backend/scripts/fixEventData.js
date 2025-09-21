const { Event, Admin } = require('../models');
const sequelize = require('../config/db');

async function fixEventData() {
  try {
    console.log('🔄 Connecting to database...');

    // Get the first admin from the database
    const admin = await Admin.findOne();
    if (!admin) {
      console.log('❌ No admin found in database. Please create an admin first.');
      return;
    }

    console.log(`✅ Found admin: ${admin.name} (ID: ${admin.id})`);

    // Update all existing events to use this admin's ID
    console.log('🔄 Updating existing events to use valid admin ID...');
    const [updatedCount] = await Event.update(
      { createdBy: admin.id },
      { where: {} } // Update all events
    );

    console.log(`✅ Updated ${updatedCount} events with valid admin ID`);

    // Now fix the foreign key constraint
    console.log('🗑️ Dropping existing foreign key constraint...');
    await sequelize.query(`
      ALTER TABLE "events"
      DROP CONSTRAINT IF EXISTS "events_createdBy_fkey";
    `);

    console.log('🔗 Adding new foreign key constraint to Admins table...');
    await sequelize.query(`
      ALTER TABLE "events"
      ADD CONSTRAINT "events_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "Admins"("id") ON DELETE SET NULL;
    `);

    console.log('✅ Foreign key constraint updated successfully!');
    console.log('🎉 Events table now properly references Admins table.');

  } catch (error) {
    console.error('❌ Error fixing event data:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixEventData();