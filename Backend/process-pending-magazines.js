const { FlipbookMagazine } = require('./models');
const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');

async function processPendingMagazines() {
  try {
    console.log('Processing pending magazines...');

    // Get magazines that are pending or failed but have file paths
    const pendingMagazines = await FlipbookMagazine.findAll({
      where: {
        processingStatus: ['pending', 'failed'],
        originalFilePath: { [require('sequelize').Op.ne]: null },
        totalPages: 0
      },
      attributes: ['id', 'title', 'slug', 'originalFilePath', 'processingStatus']
    });

    console.log(`Found ${pendingMagazines.length} magazines to process`);

    for (const magazine of pendingMagazines) {
      try {
        console.log(`\nProcessing: ${magazine.title}`);
        console.log(`File: ${magazine.originalFilePath}`);

        // Check if file exists
        try {
          await fs.access(magazine.originalFilePath);
          console.log('✅ File exists');
        } catch (error) {
          console.log('❌ File not found');
          continue;
        }

        // Extract page count
        let totalPages = 0;
        try {
          const dataBuffer = await fs.readFile(magazine.originalFilePath);
          const data = await pdf(dataBuffer);
          totalPages = data.numpages;
          console.log(`📄 Extracted ${totalPages} pages`);
        } catch (error) {
          console.log(`❌ Failed to extract pages: ${error.message}`);
          continue;
        }

        // Update magazine
        if (totalPages > 0) {
          await magazine.update({
            totalPages: totalPages,
            processingStatus: 'completed',
            processingProgress: 100
          });
          console.log(`✅ Updated ${magazine.title}: ${totalPages} pages`);
        } else {
          console.log(`❌ Still 0 pages for ${magazine.title}`);
        }

      } catch (error) {
        console.error(`Error processing ${magazine.title}:`, error.message);
      }
    }

    // Final summary
    const finalMagazines = await FlipbookMagazine.findAll({
      attributes: ['id', 'title', 'totalPages', 'processingStatus']
    });

    console.log('\n=== FINAL SUMMARY ===');
    finalMagazines.forEach(magazine => {
      console.log(`${magazine.title}: ${magazine.totalPages} pages (${magazine.processingStatus})`);
    });

  } catch (error) {
    console.error('Error in process pending magazines:', error);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const sequelize = require('./config/db');

  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully');
      return processPendingMagazines();
    })
    .then(() => {
      console.log('\nProcessing completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = { processPendingMagazines };