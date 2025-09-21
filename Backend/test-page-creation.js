const { FlipbookMagazine, FlipbookPage } = require('./models');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

async function testPageCreation() {
  try {
    console.log('Testing page creation for flipbook...');

    // Get the first magazine with pages > 0
    const magazine = await FlipbookMagazine.findOne({
      where: {
        totalPages: {
          [require('sequelize').Op.gt]: 0
        },
        originalFilePath: {
          [require('sequelize').Op.ne]: null
        }
      }
    });

    if (!magazine) {
      console.log('No suitable magazine found for testing');
      return;
    }

    console.log(`Testing with magazine: ${magazine.title} (${magazine.id})`);
    console.log(`Total pages: ${magazine.totalPages}`);
    console.log(`File path: ${magazine.originalFilePath}`);

    // Check if file exists
    try {
      await fs.access(magazine.originalFilePath);
      console.log('✅ PDF file exists');
    } catch (error) {
      console.log('❌ PDF file does not exist');
      return;
    }

    // Check current pages in database
    const existingPages = await FlipbookPage.findAll({
      where: { magazineId: magazine.id }
    });

    console.log(`Found ${existingPages.length} existing pages in database`);

    if (existingPages.length === 0) {
      console.log('No pages found, attempting to create them...');

      // Create pages directory
      const pagesDir = path.join(path.dirname(magazine.originalFilePath), 'pages');
      try {
        await fs.mkdir(pagesDir, { recursive: true });
        console.log(`Created pages directory: ${pagesDir}`);
      } catch (error) {
        console.log(`Pages directory already exists or error: ${error.message}`);
      }

      // Create first page as test
      const pageImagePath = path.join(pagesDir, `page_1.png`);
      const thumbnailPath = path.join(pagesDir, `page_1_thumb.png`);

      console.log('Creating page 1...');

      // Create page image using Ghostscript
      await new Promise((resolve, reject) => {
        const gs = spawn('C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe', [
          '-sDEVICE=png16m',
          '-r150',
          '-dFirstPage=1',
          '-dLastPage=1',
          '-dNOPAUSE',
          '-dQUIET',
          '-dBATCH',
          `-sOutputFile=${pageImagePath}`,
          magazine.originalFilePath
        ]);

        gs.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Page 1 image created successfully');
            resolve();
          } else {
            reject(new Error(`Ghostscript failed with code ${code}`));
          }
        });

        gs.on('error', reject);
      });

      // Create thumbnail
      await new Promise((resolve, reject) => {
        const gs = spawn('C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe', [
          '-sDEVICE=png16m',
          '-r72',
          '-dFirstPage=1',
          '-dLastPage=1',
          '-dNOPAUSE',
          '-dQUIET',
          '-dBATCH',
          `-sOutputFile=${thumbnailPath}`,
          magazine.originalFilePath
        ]);

        gs.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Page 1 thumbnail created successfully');
            resolve();
          } else {
            reject(new Error(`Ghostscript thumbnail failed with code ${code}`));
          }
        });

        gs.on('error', reject);
      });

      // Create page record in database
      // Convert absolute paths to relative URLs for frontend access
      const imageUrl = pageImagePath.replace(/\\/g, '/').replace(/.*\/storage/, '/storage');
      const thumbnailUrl = thumbnailPath.replace(/\\/g, '/').replace(/.*\/storage/, '/storage');

      await FlipbookPage.create({
        magazineId: magazine.id,
        pageNumber: 1,
        imagePath: pageImagePath,
        imageUrl: imageUrl,
        thumbnailPath: thumbnailPath,
        thumbnailUrl: thumbnailUrl,
        processingStatus: 'completed'
      });

      console.log('✅ Page 1 record created in database');

      // Verify the page was created
      const newPages = await FlipbookPage.findAll({
        where: { magazineId: magazine.id }
      });

      console.log(`Now have ${newPages.length} pages in database`);

      if (newPages.length > 0) {
        console.log('Sample page data:', {
          id: newPages[0].id,
          pageNumber: newPages[0].pageNumber,
          imagePath: newPages[0].imagePath,
          thumbnailPath: newPages[0].thumbnailPath
        });
      }

    } else {
      console.log('Pages already exist, no need to create');
    }

  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const sequelize = require('./config/db');

  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully');
      return testPageCreation();
    })
    .then(() => {
      console.log('\nTest completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testPageCreation };