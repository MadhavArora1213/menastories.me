const { Subcategory } = require('./models');
const { sequelize, Op } = require('sequelize');

async function fixSubcategoryImageUrls() {
  try {
    console.log('🔍 Checking for subcategories with incorrect image URLs...');

    // Find subcategories with featureImage URLs that contain the production domain
    const subcategoriesWithWrongUrls = await Subcategory.findAll({
      where: {
        featureImage: {
          [Op.like]: '%menastories.me%'
        }
      }
    });

    console.log(`📝 Found ${subcategoriesWithWrongUrls.length} subcategories with production URLs`);

    if (subcategoriesWithWrongUrls.length === 0) {
      console.log('✅ No subcategories need URL fixes');
      return;
    }

    // Update each subcategory to use localhost URLs
    for (const subcategory of subcategoriesWithWrongUrls) {
      if (subcategory.featureImage) {
        const oldUrl = subcategory.featureImage;
        const newUrl = oldUrl.replace('https://menastories.me', 'http://localhost:5000');

        console.log(`🔄 Updating ${subcategory.name}:`);
        console.log(`   From: ${oldUrl}`);
        console.log(`   To:   ${newUrl}`);

        await subcategory.update({ featureImage: newUrl });
      }
    }

    console.log('✅ Successfully updated all subcategory image URLs');

    // Verify the changes
    const updatedSubcategories = await Subcategory.findAll({
      where: {
        featureImage: {
          [Op.like]: '%localhost:5000%'
        }
      }
    });

    console.log(`✅ Verification: ${updatedSubcategories.length} subcategories now use localhost URLs`);

  } catch (error) {
    console.error('❌ Error fixing subcategory image URLs:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixSubcategoryImageUrls();