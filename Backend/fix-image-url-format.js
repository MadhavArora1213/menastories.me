const { Subcategory } = require('./models');
const { sequelize, Op } = require('sequelize');

async function fixImageUrlFormat() {
  try {
    console.log('🔍 Fixing image URL format in subcategories...');

    // Get all subcategories with featureImage URLs
    const subcategoriesWithImages = await Subcategory.findAll({
      where: {
        featureImage: {
          [Op.ne]: null,
          [Op.ne]: '',
          [Op.like]: '/api/storage/images/%' // Only fix relative API paths
        }
      }
    });

    console.log(`📝 Found ${subcategoriesWithImages.length} subcategories with relative API image URLs`);

    if (subcategoriesWithImages.length === 0) {
      console.log('✅ No subcategories need URL format fixes');
      return;
    }

    const API_BASE_URL = process.env.NODE_ENV === 'production'
      ? 'https://menastories.me'
      : 'http://localhost:5000';

    let fixedCount = 0;
    let errors = [];

    // Fix each subcategory
    for (const subcategory of subcategoriesWithImages) {
      try {
        const currentUrl = subcategory.featureImage;
        console.log(`\n🔍 Processing subcategory: ${subcategory.name}`);
        console.log(`   Current URL: ${currentUrl}`);

        // Convert relative API path to full URL
        if (currentUrl.startsWith('/api/storage/images/')) {
          const newUrl = `${API_BASE_URL}${currentUrl}`;
          await subcategory.update({ featureImage: newUrl });
          console.log(`   ✅ Fixed: ${newUrl}`);
          fixedCount++;
        } else {
          console.log(`   ℹ️ URL format is already correct`);
        }

      } catch (error) {
        console.error(`   ❌ Error processing subcategory ${subcategory.name}:`, error.message);
        errors.push({ subcategory: subcategory.name, error: error.message });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 IMAGE URL FORMAT FIX SUMMARY');
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
    console.log('\n📋 Final subcategory image URLs:');
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

    console.log('\n✅ Image URL format fix completed successfully');

  } catch (error) {
    console.error('❌ Error fixing image URL format:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixImageUrlFormat();