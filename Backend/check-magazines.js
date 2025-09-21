require('dotenv').config();
const sequelize = require('./config/db');
const { FlipbookMagazine } = require('./models');

async function checkMagazines() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const magazines = await FlipbookMagazine.findAll({
      attributes: ['id', 'title', 'slug']
    });

    console.log('\nAvailable magazines:');
    magazines.forEach(magazine => {
      console.log(`${magazine.id} - ${magazine.title} (${magazine.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMagazines();