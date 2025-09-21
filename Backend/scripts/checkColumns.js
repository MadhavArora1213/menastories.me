const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

async function checkColumns() {
  try {
    console.log('Checking NewsletterSubscribers table columns...');
    const result = await sequelize.query('PRAGMA table_info(NewsletterSubscribers)', { type: QueryTypes.SELECT });
    console.log('Current columns:');
    result.forEach(col => {
      console.log(`- ${col.name}: ${col.type}`);
    });

    // Check for missing columns
    const columnNames = result.map(col => col.name);
    const requiredColumns = ['confirmedAt', 'unsubscribedAt'];

    console.log('\nChecking for missing columns...');
    requiredColumns.forEach(col => {
      if (columnNames.includes(col)) {
        console.log(`✓ ${col} exists`);
      } else {
        console.log(`✗ ${col} missing`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkColumns();