const { FlipbookPage } = require('./models');
const path = require('path');

async function fixFlipbookUrls() {
  try {
    console.log('Starting flipbook URL fix process...');

    // Get all pages with incorrect URLs
    const pages = await FlipbookPage.findAll({
      where: {
        imageUrl: {
          [require('sequelize').Op.like]: '%Magazine_Website%'
        }
      }
    });

    console.log(`Found ${pages.length} pages with incorrect URLs`);

    for (const page of pages) {
      try {
        // Fix the imageUrl and thumbnailUrl
        const correctedImageUrl = `/api${page.imagePath.replace(/\\/g, '/').replace(/.*\/storage/, '/storage')}`;
        const correctedThumbnailUrl = page.thumbnailPath ?
          `/api${page.thumbnailPath.replace(/\\/g, '/').replace(/.*\/storage/, '/storage')}` :
          null;

        await page.update({
          imageUrl: correctedImageUrl,
          thumbnailUrl: correctedThumbnailUrl
        });

        console.log(`✅ Fixed URL for page ${page.pageNumber} of magazine ${page.magazineId}`);
      } catch (error) {
        console.error(`❌ Failed to fix URL for page ${page.pageNumber}:`, error.message);
      }
    }

    console.log('🎉 URL fix process completed');

  } catch (error) {
    console.error('Error in URL fix process:', error);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const sequelize = require('./config/db');

  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully');
      return fixFlipbookUrls();
    })
    .then(() => {
      console.log('\n🎉 URL fix completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = { fixFlipbookUrls };