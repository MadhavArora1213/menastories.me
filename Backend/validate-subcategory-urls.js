const { Subcategory } = require('./models');
const { sequelize, Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function validateSubcategoryUrls() {
  try {
    console.log('🔍 Validating subcategory image URLs...');

    const storageImagesDir = path.join(__dirname, 'storage', 'images');

    // Get all subcategories
    const allSubcategories = await Subcategory.findAll();
    console.log(`📝 Found ${allSubcategories.length} total subcategories`);

    // Get list of valid image files in storage
    const validImageFiles = fs.readdirSync(storageImagesDir).filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file) && fs.statSync(path.join(storageImagesDir, file)).size > 0
    );

    console.log(`📁 Found ${validImageFiles.length} valid image files in storage`);

    let issuesFound = 0;
    let fixedCount = 0;

    // Check each subcategory
    for (const subcategory of allSubcategories) {
      const hasImageUrl = subcategory.featureImage && subcategory.featureImage.trim() !== '';

      if (hasImageUrl) {
        const imageUrl = subcategory.featureImage;
        console.log(`\n🔍 Checking subcategory: ${subcategory.name}`);
        console.log(`   Current URL: ${imageUrl}`);

        // Extract filename from URL
        let filename = null;
        if (imageUrl.includes('/')) {
          filename = imageUrl.split('/').pop();
        } else {
          filename = imageUrl;
        }

        // Check if the image file exists and has content
        const imagePath = path.join(storageImagesDir, filename);
        const imageExists = fs.existsSync(imagePath);
        const hasContent = imageExists ? fs.statSync(imagePath).size > 0 : false;

        if (!imageExists || !hasContent) {
          console.log(`   ❌ Issue found: Image file is missing or corrupted`);
          issuesFound++;

          // Try to fix by setting to null (will use default image)
          await subcategory.update({ featureImage: null });
          console.log(`   🔧 Fixed: Set featureImage to null`);
          fixedCount++;
        } else {
          console.log(`   ✅ Image file is valid`);
        }
      } else {
        console.log(`\n🔍 Checking subcategory: ${subcategory.name}`);
        console.log(`   ℹ️ No featureImage URL set (this is fine)`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUBCATEGORY URL VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`📝 Total subcategories checked: ${allSubcategories.length}`);
    console.log(`❌ Issues found: ${issuesFound}`);
    console.log(`🔧 Fixed: ${fixedCount}`);

    if (issuesFound === 0) {
      console.log('✅ All subcategory image URLs are valid!');
    } else {
      console.log('⚠️ Some issues were found and fixed.');
    }

    console.log('\n📋 Subcategories with valid image URLs:');
    const subcategoriesWithImages = await Subcategory.findAll({
      where: {
        featureImage: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      }
    });

    subcategoriesWithImages.forEach(sub => {
      console.log(`   ${sub.name}: ${sub.featureImage}`);
    });

    console.log('\n✅ Subcategory URL validation completed successfully');

  } catch (error) {
    console.error('❌ Error validating subcategory URLs:', error);
  } finally {
    process.exit(0);
  }
}

// Run the validation
validateSubcategoryUrls();