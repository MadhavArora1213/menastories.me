const { Subcategory } = require('./models');
const { sequelize } = require('./config/db');

async function fixSubcategoryImageUrls() {
  try {
    console.log('🔄 Starting subcategory image URL fix...');

    // Get all subcategories with featureImage URLs
    const subcategories = await Subcategory.findAll({
      where: {
        featureImage: {
          [require('sequelize').Op.ne]: null,
          [require('sequelize').Op.ne]: ''
        }
      }
    });

    console.log(`📊 Found ${subcategories.length} subcategories with featureImage URLs`);

    const serverUrl = process.env.SERVER_URL || 'https://menastories.me';
    const correctBaseUrl = `${serverUrl}/storage/images/`;

    let updatedCount = 0;
    let skippedCount = 0;

    for (const subcategory of subcategories) {
      const currentUrl = subcategory.featureImage;
      let newUrl = currentUrl;

      // Check if URL needs fixing
      if (currentUrl.includes('localhost:5000')) {
        // Extract filename from localhost URL
        const filename = currentUrl.split('/').pop();
        newUrl = `${correctBaseUrl}${filename}`;
        console.log(`🔧 Fixing ${subcategory.name}: ${currentUrl} → ${newUrl}`);
      } else if (currentUrl.includes('menastories.me') && !currentUrl.startsWith(correctBaseUrl)) {
        // Handle other menastories.me URLs that might have wrong format
        const filename = currentUrl.split('/').pop();
        newUrl = `${correctBaseUrl}${filename}`;
        console.log(`🔧 Fixing ${subcategory.name}: ${currentUrl} → ${newUrl}`);
      } else if (!currentUrl.startsWith('http')) {
        // Handle relative URLs
        const filename = currentUrl.replace(/^\/+/, '');
        newUrl = `${correctBaseUrl}${filename}`;
        console.log(`🔧 Fixing ${subcategory.name}: ${currentUrl} → ${newUrl}`);
      } else {
        // URL is already correct
        skippedCount++;
        continue;
      }

      // Update the subcategory
      await subcategory.update({ featureImage: newUrl });
      updatedCount++;
      console.log(`✅ Updated ${subcategory.name} with new URL: ${newUrl}`);
    }

    console.log(`🎉 Fixed ${updatedCount} subcategories`);
    console.log(`⏭️  Skipped ${skippedCount} subcategories (already correct)`);

    // Verify the fixes
    const verifySubcategories = await Subcategory.findAll({
      where: {
        featureImage: {
          [require('sequelize').Op.ne]: null,
          [require('sequelize').Op.ne]: ''
        }
      },
      limit: 5
    });

    console.log('🔍 Verification - Sample of updated URLs:');
    verifySubcategories.forEach(sub => {
      console.log(`  ${sub.name}: ${sub.featureImage}`);
    });

    console.log('✅ Subcategory image URL fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing subcategory image URLs:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixSubcategoryImageUrls();