const { sequelize } = require('../models');

async function addDescriptionToTags() {
  try {
    console.log('Adding description column to Tags table...');

    // Add description column to Tags table
    await sequelize.getQueryInterface().addColumn('Tags', 'description', {
      type: require('sequelize').DataTypes.TEXT,
      allowNull: true
    });

    console.log('Description column added successfully to Tags table');
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('duplicate column name')) {
      console.log('Description column already exists in Tags table');
    } else {
      console.error('Error adding description column:', error);
      throw error;
    }
  }
}

// Run the migration
addDescriptionToTags()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });