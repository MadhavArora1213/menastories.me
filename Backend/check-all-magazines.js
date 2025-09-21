const { FlipbookMagazine } = require('./models');

async function checkAllMagazines() {
  try {
    console.log('Checking all magazines in database...');

    const allMagazines = await FlipbookMagazine.findAll({
      attributes: ['id', 'title', 'slug', 'totalPages', 'originalFilePath', 'processingStatus', 'processingProgress']
    });

    console.log(`Found ${allMagazines.length} magazines total:`);

    allMagazines.forEach(magazine => {
      console.log(`- ${magazine.title} (${magazine.id})`);
      console.log(`  Pages: ${magazine.totalPages}`);
      console.log(`  Status: ${magazine.processingStatus}`);
      console.log(`  Progress: ${magazine.processingProgress}%`);
      console.log(`  File: ${magazine.originalFilePath || 'No file path'}`);
      console.log('');
    });

    // Summary
    const completed = allMagazines.filter(m => m.processingStatus === 'completed');
    const processing = allMagazines.filter(m => m.processingStatus === 'processing');
    const failed = allMagazines.filter(m => m.processingStatus === 'failed');
    const pending = allMagazines.filter(m => m.processingStatus === 'pending');

    console.log('Summary:');
    console.log(`- Completed: ${completed.length}`);
    console.log(`- Processing: ${processing.length}`);
    console.log(`- Failed: ${failed.length}`);
    console.log(`- Pending: ${pending.length}`);

    const zeroPages = allMagazines.filter(m => m.totalPages === 0);
    console.log(`- Zero pages: ${zeroPages.length}`);

    return allMagazines.length;

  } catch (error) {
    console.error('Error checking all magazines:', error);
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
      return checkAllMagazines();
    })
    .then(count => {
      console.log(`\nTotal magazines: ${count}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = { checkAllMagazines };