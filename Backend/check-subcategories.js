const { Subcategory } = require('./models');

(async () => {
  try {
    const subs = await Subcategory.findAll({
      attributes: ['id', 'name', 'featureImage', 'slug']
    });

    console.log('All subcategories:');
    subs.forEach((sub, i) => {
      console.log((i+1) + '. ' + sub.name + ' (' + sub.slug + '): ' + (sub.featureImage || 'NULL'));
    });

    console.log('\nTotal: ' + subs.length + ' subcategories');

    // Check for null featureImages specifically
    const nullFeatureImages = subs.filter(sub => !sub.featureImage);
    console.log('\nSubcategories with NULL featureImage: ' + nullFeatureImages.length);
    nullFeatureImages.forEach((sub, i) => {
      console.log('  ' + (i+1) + '. ' + sub.name + ' (' + sub.slug + ')');
    });

  } catch (error) {
    console.error('Error:', error);
  }
})();