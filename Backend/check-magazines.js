const { FlipbookMagazine } = require('./models');

async function checkMagazines() {
  try {
    const magazines = await FlipbookMagazine.findAll({
      limit: 5,
      attributes: ['id', 'title', 'accessType', 'originalFilePath']
    });

    console.log('Available magazines:');
    magazines.forEach(m => {
      console.log(`ID: ${m.id}, Title: ${m.title}, Access: ${m.accessType}, File: ${m.originalFilePath ? 'Yes' : 'No'}`);
    });

    if (magazines.length === 0) {
      console.log('No magazines found in database');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMagazines();