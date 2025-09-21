const { Subcategory } = require('./models');

async function checkSubcategoryImages() {
  try {
    console.log('Checking subcategory images in database...');
    const subcategories = await Subcategory.findAll({ limit: 10 });

    console.log('Found', subcategories.length, 'subcategories:');
    subcategories.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.name}: ${sub.featureImage || 'NULL'}`);
    });

    // Check if any have images
    const withImages = subcategories.filter(sub => sub.featureImage);
    console.log(`\nSubcategories with images: ${withImages.length}/${subcategories.length}`);

    if (withImages.length > 0) {
      console.log('\nSample image URLs:');
      withImages.slice(0, 3).forEach((sub, index) => {
        console.log(`  ${index + 1}. ${sub.name}: ${sub.featureImage}`);
      });
    }
  } catch (error) {
    console.error('Error checking subcategories:', error);
  }
}

checkSubcategoryImages();