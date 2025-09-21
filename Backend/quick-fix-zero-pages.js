const { FlipbookMagazine } = require('./models');
const path = require('path');
const fs = require('fs').promises;

async function quickFixZeroPages() {
  try {
    console.log('Quick fix for zero-page magazines...');

    // Get failed magazines
    const failedMagazines = await FlipbookMagazine.findAll({
      where: {
        processingStatus: 'failed',
        totalPages: 0
      },
      attributes: ['id', 'title', 'slug']
    });

    console.log(`Found ${failedMagazines.length} failed magazines`);

    // Get all PDF files
    const storageDir = '/var/www/menastories/menastories.me/Backend/storage/flipbooks';
    const files = await fs.readdir(storageDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    console.log(`Found ${pdfFiles.length} PDF files`);

    // Simple mapping: try to match by filename patterns
    const fixes = [];

    for (const magazine of failedMagazines) {
      console.log(`\nProcessing: ${magazine.title}`);

      // Try to find a matching file
      let matchedFile = null;

      // Look for files that might match the magazine title
      const titleWords = magazine.title.toLowerCase().split(' ');
      for (const pdfFile of pdfFiles) {
        const fileName = pdfFile.toLowerCase();
        // Check if any word from title appears in filename
        const hasMatch = titleWords.some(word =>
          word.length > 3 && fileName.includes(word.replace(/[^a-z0-9]/g, ''))
        );

        if (hasMatch) {
          matchedFile = pdfFile;
          console.log(`Found potential match: ${pdfFile}`);
          break;
        }
      }

      if (matchedFile) {
        const fullPath = path.join(storageDir, matchedFile);

        // Update the magazine
        await magazine.update({
          originalFilePath: fullPath,
          processingStatus: 'pending'
        });

        fixes.push({
          id: magazine.id,
          title: magazine.title,
          file: matchedFile
        });

        console.log(`✅ Updated ${magazine.title} with ${matchedFile}`);
      } else {
        console.log(`❌ No match found for ${magazine.title}`);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Fixed ${fixes.length} out of ${failedMagazines.length} magazines`);

    if (fixes.length > 0) {
      console.log('\nFixed magazines:');
      fixes.forEach(fix => {
        console.log(`- ${fix.title} -> ${fix.file}`);
      });

      console.log('\nNext step: Run the reprocessing to extract page counts');
    }

    return fixes.length;

  } catch (error) {
    console.error('Error in quick fix:', error);
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
      return quickFixZeroPages();
    })
    .then(fixed => {
      console.log(`\nFixed ${fixed} magazines`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = { quickFixZeroPages };