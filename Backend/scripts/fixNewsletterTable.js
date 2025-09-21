const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

const fixNewsletterTable = async () => {
  try {
    console.log('Checking NewsletterSubscribers table...');

    // Check if confirmationToken column exists
    const columns = await sequelize.query(
      "PRAGMA table_info(NewsletterSubscribers)",
      { type: QueryTypes.SELECT }
    );

    const hasConfirmationToken = columns.some(col => col.name === 'confirmationToken');

    if (!hasConfirmationToken) {
      console.log('Adding confirmationToken column...');
      await sequelize.query(
        "ALTER TABLE NewsletterSubscribers ADD COLUMN confirmationToken VARCHAR(255)",
        { type: QueryTypes.RAW }
      );
      console.log('confirmationToken column added successfully');
    } else {
      console.log('confirmationToken column already exists');
    }

    console.log('NewsletterSubscribers table fix completed');
  } catch (error) {
    console.error('Error fixing NewsletterSubscribers table:', error);
  } finally {
    await sequelize.close();
  }
};

// Execute if run directly
if (require.main === module) {
  fixNewsletterTable()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

module.exports = fixNewsletterTable;