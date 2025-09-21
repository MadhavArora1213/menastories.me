const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

async function fixCategoriesEnum() {
  try {
    console.log('🔧 Fixing Categories enum issue...');

    // First, let's see what values are currently in the design column
    const currentDesignValues = await sequelize.query(
      'SELECT DISTINCT "design" FROM "Categories"',
      { type: QueryTypes.SELECT }
    );

    console.log('📊 Current design values in Categories:', currentDesignValues);

    // Update any invalid design values to 'design1'
    await sequelize.query(
      'UPDATE "Categories" SET "design" = \'design1\' WHERE "design" NOT IN (\'design1\', \'design2\', \'design3\') OR "design" IS NULL',
      { type: QueryTypes.UPDATE }
    );

    // Check status values
    const currentStatusValues = await sequelize.query(
      'SELECT DISTINCT "status" FROM "Categories"',
      { type: QueryTypes.SELECT }
    );

    console.log('📊 Current status values in Categories:', currentStatusValues);

    // Update any invalid status values to 'active'
    await sequelize.query(
      'UPDATE "Categories" SET "status" = \'active\' WHERE "status" NOT IN (\'active\', \'inactive\') OR "status" IS NULL',
      { type: QueryTypes.UPDATE }
    );

    console.log('✅ Categories enum values fixed successfully!');

    // Now let's see the updated values
    const updatedDesignValues = await sequelize.query(
      'SELECT DISTINCT "design" FROM "Categories"',
      { type: QueryTypes.SELECT }
    );

    const updatedStatusValues = await sequelize.query(
      'SELECT DISTINCT "status" FROM "Categories"',
      { type: QueryTypes.SELECT }
    );

    console.log('📊 Updated design values:', updatedDesignValues);
    console.log('📊 Updated status values:', updatedStatusValues);

  } catch (error) {
    console.error('❌ Error fixing Categories enum:', error);
    throw error;
  }
}

// Run the fix
fixCategoriesEnum()
  .then(() => {
    console.log('🎉 Categories enum fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Categories enum fix failed:', error);
    process.exit(1);
  });