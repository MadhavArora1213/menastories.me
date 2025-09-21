const { FlipbookMagazine } = require('./models');
const path = require('path');
const fs = require('fs').promises;

async function manualFix() {
  try {
    console.log('Manual fix for flipbook issues...');

    // Get all magazines with issues
    const failedMagazines = await FlipbookMagazine.findAll({
      where: {
        processingStatus: 'failed',
        totalPages: 0
      },
      attributes: ['id', 'title', 'slug', 'createdAt', 'updatedAt']
    });

    console.log('Failed magazines:');
    failedMagazines.forEach(magazine => {
      console.log(`- ${magazine.title}`);
      console.log(`  Created: ${magazine.createdAt}`);
      console.log(`  Updated: ${magazine.updatedAt}`);
      console.log('');
    });

    // Get all PDF files with their modification times
    const storageDir = '/var/www/menastories/menastories.me/Backend/storage/flipbooks';
    const files = await fs.readdir(storageDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    console.log('PDF files with modification times:');
    for (const pdfFile of pdfFiles.slice(0, 10)) { // Show first 10
      try {
        const filePath = path.join(storageDir, pdfFile);
        const stats = await fs.stat(filePath);
        console.log(`${pdfFile}: ${stats.mtime}`);
      } catch (error) {
        console.error(`Error checking ${pdfFile}:`, error.message);
      }
    }

    // For now, let's try to manually assign files to magazines
    // Since we can't determine automatically, let's provide options

    console.log('\n=== MANUAL ASSIGNMENT NEEDED ===');
    console.log('Please identify which PDF file corresponds to each magazine:');
    console.log('');

    failedMagazines.forEach((magazine, index) => {
      console.log(`${index + 1}. ${magazine.title}`);
      console.log(`   ID: ${magazine.id}`);
      console.log(`   Created: ${magazine.createdAt.toISOString()}`);
      console.log('');
    });

    console.log('Available PDF files (showing some recent ones):');
    // Sort files by modification time (newest first)
    const fileStats = [];
    for (const pdfFile of pdfFiles) {
      try {
        const filePath = path.join(storageDir, pdfFile);
        const stats = await fs.stat(filePath);
        fileStats.push({ name: pdfFile, mtime: stats.mtime, size: stats.size });
      } catch (error) {
        // Skip files we can't access
      }
    }

    fileStats.sort((a, b) => b.mtime - a.mtime); // Newest first

    fileStats.slice(0, 15).forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (${Math.round(file.size / 1024)}KB) - ${file.mtime.toISOString()}`);
    });

    console.log('\nTo fix this, you would need to manually identify which file belongs to which magazine.');
    console.log('Then I can update the database accordingly.');

  } catch (error) {
    console.error('Error in manual fix:', error);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const sequelize = require('./config/db');

  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully');
      return manualFix();
    })
    .then(() => {
      console.log('\nManual fix analysis completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = { manualFix };