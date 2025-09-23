const { Subcategory } = require('./models');
const { sequelize, Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function comprehensiveSubcategoryImageFix() {
  try {
    console.log('🔍 Starting comprehensive subcategory image fix...');

    const storageImagesDir = path.join(__dirname, 'storage', 'images');

    // Get all subcategories with featureImage URLs
    const subcategoriesWithImages = await Subcategory.findAll({
      where: {
        featureImage: {
          [Op.ne]: null,
          [Op.ne]: ''
        }
      }
    });

    console.log(`📝 Found ${subcategoriesWithImages.length} subcategories with featureImage URLs`);

    if (subcategoriesWithImages.length === 0) {
      console.log('✅ No subcategories with featureImage URLs found');
      return;
    }

    // Get list of valid image files in storage
    const validImageFiles = fs.readdirSync(storageImagesDir).filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file) && fs.statSync(path.join(storageImagesDir, file)).size > 0
    );

    console.log(`📁 Found ${validImageFiles.length} valid image files in storage`);

    let fixedCount = 0;
    let removedCount = 0;
    let errors = [];

    // Process each subcategory
    for (const subcategory of subcategoriesWithImages) {
      try {
        const currentImageUrl = subcategory.featureImage;
        console.log(`\n🔍 Processing subcategory: ${subcategory.name}`);
        console.log(`   Current featureImage: ${currentImageUrl}`);

        // Extract filename from URL
        let filename = null;
        if (currentImageUrl.includes('/')) {
          filename = currentImageUrl.split('/').pop();
        } else {
          filename = currentImageUrl;
        }

        console.log(`   Extracted filename: ${filename}`);

        // Check if the image file exists and has content
        const imagePath = path.join(storageImagesDir, filename);
        const imageExists = fs.existsSync(imagePath);
        const hasContent = imageExists ? fs.statSync(imagePath).size > 0 : false;

        console.log(`   Image exists: ${imageExists}, Has content: ${hasContent}`);

        if (!imageExists || !hasContent) {
          console.log(`   ❌ Image file is missing or corrupted`);

          // Try to find a suitable replacement image
          let replacementImage = null;

          // Look for featured images that might be suitable
          const featuredImages = validImageFiles.filter(file =>
            file.startsWith('featured_image-') && file.endsWith('.png')
          );

          if (featuredImages.length > 0) {
            // Use the first available featured image
            replacementImage = featuredImages[0];
            console.log(`   ✅ Found replacement image: ${replacementImage}`);
          } else {
            // Look for any valid image
            replacementImage = validImageFiles[0];
            console.log(`   ✅ Found fallback image: ${replacementImage}`);
          }

          if (replacementImage) {
            const newImageUrl = `/api/storage/images/${replacementImage}`;
            await subcategory.update({ featureImage: newImageUrl });
            console.log(`   🔄 Updated to: ${newImageUrl}`);
            fixedCount++;
          } else {
            // No replacement images available, set to null
            await subcategory.update({ featureImage: null });
            console.log(`   🗑️ Set featureImage to null (no replacement available)`);
            removedCount++;
          }
        } else {
          console.log(`   ✅ Image file is valid`);
        }

      } catch (error) {
        console.error(`   ❌ Error processing subcategory ${subcategory.name}:`, error.message);
        errors.push({ subcategory: subcategory.name, error: error.message });
      }
    }

    // Generate summary report
    console.log('\n' + '='.repeat(50));
    console.log('📊 COMPREHENSIVE SUBCATEGORY IMAGE FIX SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Fixed subcategories: ${fixedCount}`);
    console.log(`🗑️ Removed invalid URLs: ${removedCount}`);
    console.log(`❌ Errors encountered: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.subcategory}: ${error.error}`);
      });
    }

    // List all subcategories with their final image URLs
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

    console.log('\n✅ Comprehensive subcategory image fix completed successfully');

  } catch (error) {
    console.error('❌ Error in comprehensive subcategory image fix:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
comprehensiveSubcategoryImageFix();