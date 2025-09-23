const { Subcategory } = require('./models');
const { sequelize, Op } = require('sequelize');

async function fixImageUrlsForDevelopment() {
  try {
    console.log('🔍 Fixing image URLs for development environment...');

    // Get all subcategories with featureImage URLs
    const subcategoriesWithImages = await Subcategory.findAll({
      where: {
        featureImage: {
          [Op.ne]: null,
          [Op.ne]: '',
          [Op.like]: 'https://menastories.me/api/storage/images/%' // Only fix production URLs
        }
      }
    });

    console.log(`📝 Found ${subcategoriesWithImages.length} subcategories with production image URLs`);

    if (subcategoriesWithImages.length === 0) {
      console.log('✅ No subcategories need URL fixes for development');
      return;
    }

    const LOCAL_API_URL = 'http://localhost:5000';

    let fixedCount = 0;
    let errors = [];

    // Fix each subcategory
    for (const subcategory of subcategoriesWithImages) {
      try {
        const currentUrl = subcategory.featureImage;
        console.log(`\n🔍 Processing subcategory: ${subcategory.name}`);
        console.log(`   Current URL: ${currentUrl}`);

        // Convert production URL to local development URL
        if (currentUrl.startsWith('https://menastories.me/api/storage/images/')) {
          const newUrl = currentUrl.replace('https://menastories.me', LOCAL_API_URL);
          await subcategory.update({ featureImage: newUrl });
          console.log(`   ✅ Fixed for development: ${newUrl}`);
          fixedCount++;
        } else {
          console.log(`   ℹ️ URL is already correct for development`);
        }

      } catch (error) {
        console.error(`   ❌ Error processing subcategory ${subcategory.name}:`, error.message);
        errors.push({ subcategory: subcategory.name, error: error.message });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 DEVELOPMENT IMAGE URL FIX SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Fixed subcategories: ${fixedCount}`);
    console.log(`❌ Errors encountered: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.subcategory}: ${error.error}`);
      });
    }

    // Show final URLs
    console.log('\n📋 Final subcategory image URLs (for development):');
    const finalSubcategories = await Subcategory.findAll({
      where: {
        featureImage: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      }
    });

    finalSubcategories.forEach(sub => {
      console.log(`   ${sub.name}: ${sub.featureImage}`);
    });

    console.log('\n✅ Development image URL fix completed successfully');

  } catch (error) {
    console.error('❌ Error fixing image URLs for development:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixImageUrlsForDevelopment();