const { Subcategory } = require('./models');

async function checkRecentSubcategories() {
  try {
    console.log('Checking recent subcategories...');
    const subcategories = await Subcategory.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    console.log('Found', subcategories.length, 'recent subcategories:');
    subcategories.forEach((sub, index) => {
      console.log((index + 1) + '. ' + sub.name + ': ' + (sub.featureImage || 'NULL') + ' - Created: ' + sub.createdAt);
    });

    // Check if any have images
    const withImages = subcategories.filter(sub => sub.featureImage);
    console.log('\nSubcategories with images: ' + withImages.length + '/' + subcategories.length);
  } catch (error) {
    console.error('Error checking subcategories:', error);
  }
}

checkRecentSubcategories();