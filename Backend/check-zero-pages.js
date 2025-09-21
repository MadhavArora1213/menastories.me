const { FlipbookMagazine } = require('./models');
const { Op } = require('sequelize');

async function checkZeroPageMagazines() {
  try {
    console.log('Checking for magazines with 0 pages...');

    const zeroPageMagazines = await FlipbookMagazine.findAll({
      where: {
        totalPages: 0,
        processingStatus: 'completed',
        originalFilePath: {
          [Op.ne]: null
        }
      },
      attributes: ['id', 'title', 'slug', 'totalPages', 'originalFilePath', 'processingStatus']
    });

    console.log(`Found ${zeroPageMagazines.length} magazines with 0 pages:`);

    zeroPageMagazines.forEach(magazine => {
      console.log(`- ${magazine.title} (${magazine.id})`);
      console.log(`  File: ${magazine.originalFilePath}`);
      console.log(`  Status: ${magazine.processingStatus}`);
      console.log('');
    });

    // Also check for magazines that are still processing
    const processingMagazines = await FlipbookMagazine.findAll({
      where: {
        processingStatus: 'processing'
      },
      attributes: ['id', 'title', 'slug', 'totalPages', 'processingStatus', 'processingProgress']
    });

    console.log(`Found ${processingMagazines.length} magazines still processing:`);
    processingMagazines.forEach(magazine => {
      console.log(`- ${magazine.title} (${magazine.id}) - Progress: ${magazine.processingProgress}%`);
    });

    return zeroPageMagazines.length;

  } catch (error) {
    console.error('Error checking zero page magazines:', error);
    return 0;
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const sequelize = require('./config/db');

  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully');
      return checkZeroPageMagazines();
    })
    .then(count => {
      console.log(`\nTotal magazines with 0 pages: ${count}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = { checkZeroPageMagazines };