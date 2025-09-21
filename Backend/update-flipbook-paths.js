const { FlipbookMagazine } = require('./models');
const path = require('path');

async function updateFlipbookPaths() {
  try {
    console.log('Updating flipbook file paths...');

    // Update existing magazines with PDF file paths
    const updates = [
      {
        id: 'dbb1df1d-d4d3-4270-9ed6-6d38c419cc60',
        originalFilePath: path.join(__dirname, '../Magazine_Website/public/tech-conference.pdf'),
        fileSize: '2048000',
        totalPages: 25
      },
      {
        id: '2d708be5-2824-4694-b85c-6d6f6f772482',
        originalFilePath: path.join(__dirname, '../Magazine_Website/public/book.pdf'),
        fileSize: '1024000',
        totalPages: 20
      }
    ];

    for (const update of updates) {
      try {
        await FlipbookMagazine.update(
          {
            originalFilePath: update.originalFilePath,
            fileSize: update.fileSize,
            totalPages: update.totalPages
          },
          { where: { id: update.id } }
        );
        console.log(`Updated magazine ${update.id}`);
      } catch (err) {
        console.error(`Failed to update magazine ${update.id}:`, err.message);
      }
    }

    console.log('Flipbook paths updated successfully!');
  } catch (error) {
    console.error('Error updating flipbook paths:', error);
  } finally {
    process.exit(0);
  }
}

updateFlipbookPaths();