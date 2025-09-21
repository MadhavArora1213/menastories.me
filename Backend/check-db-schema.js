const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Check Articles table schema
    const [results] = await sequelize.query("PRAGMA table_info(Articles);");
    console.log('Articles table columns:');
    results.forEach(column => {
      console.log(`- ${column.name}: ${column.type}`);
    });

    // Check if description column exists
    const descriptionColumn = results.find(col => col.name === 'description');
    if (descriptionColumn) {
      console.log('✓ Description column exists');
    } else {
      console.log('✗ Description column missing');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkSchema();