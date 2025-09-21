const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to NewsletterSubscribers table...');

    // Check if columns already exist
    const existingColumns = await sequelize.query('PRAGMA table_info(NewsletterSubscribers)', { type: QueryTypes.SELECT });
    const columnNames = existingColumns.map(col => col.name);

    if (!columnNames.includes('confirmedAt')) {
      console.log('Adding confirmedAt column...');
      await sequelize.query('ALTER TABLE NewsletterSubscribers ADD COLUMN confirmedAt DATETIME', { type: QueryTypes.RAW });
      console.log('✓ confirmedAt column added');
    } else {
      console.log('✓ confirmedAt column already exists');
    }

    if (!columnNames.includes('unsubscribedAt')) {
      console.log('Adding unsubscribedAt column...');
      await sequelize.query('ALTER TABLE NewsletterSubscribers ADD COLUMN unsubscribedAt DATETIME', { type: QueryTypes.RAW });
      console.log('✓ unsubscribedAt column added');
    } else {
      console.log('✓ unsubscribedAt column already exists');
    }

    console.log('All missing columns processed successfully');

  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    await sequelize.close();
  }
}

addMissingColumns();