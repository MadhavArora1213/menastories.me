const { FlipbookMagazine } = require('./models');

async function checkMagazines() {
  try {
    const magazines = await FlipbookMagazine.findAll({
      attributes: ['id', 'title', 'originalFilePath', 'processingStatus', 'totalPages']
    });

    console.log('Existing magazines:');
    console.log('==================');

    if (magazines.length === 0) {
      console.log('No magazines found in database');
      return;
    }

    magazines.forEach(m => {
      console.log(`- ID: ${m.id}`);
      console.log(`  Title: ${m.title}`);
      console.log(`  File: ${m.originalFilePath ? 'EXISTS' : 'MISSING'}`);
      console.log(`  Status: ${m.processingStatus}`);
      console.log(`  Pages: ${m.totalPages || 0}`);
      console.log('');
    });

    // Check if "Ot" magazine exists
    const otMagazine = magazines.find(m => m.id === 'Ot');
    if (otMagazine) {
      console.log('Magazine with ID "Ot" found:');
      console.log(JSON.stringify(otMagazine, null, 2));
    } else {
      console.log('Magazine with ID "Ot" NOT found in database');
    }

  } catch (error) {
    console.error('Error checking magazines:', error);
  }
}

checkMagazines();