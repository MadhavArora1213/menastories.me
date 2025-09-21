const { Category } = require('../models');

const checkCurrentCategories = async () => {
  try {
    console.log('Checking current main categories...');

    const categories = await Category.findAll({
      where: { parentId: null },
      order: [['order', 'ASC']]
    });

    console.log(`Found ${categories.length} main categories:`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (slug: ${cat.slug}, id: ${cat.id})`);
    });

    // Also check subcategories
    const subcategories = await Category.findAll({
      where: { parentId: { [require('sequelize').Op.ne]: null } },
      order: [['parentId', 'ASC'], ['order', 'ASC']]
    });

    console.log(`\nFound ${subcategories.length} subcategories`);
    const grouped = {};
    subcategories.forEach(sub => {
      if (!grouped[sub.parentId]) grouped[sub.parentId] = [];
      grouped[sub.parentId].push(sub.name);
    });

    for (const [parentId, subs] of Object.entries(grouped)) {
      const parent = categories.find(c => c.id === parentId);
      console.log(`- ${parent ? parent.name : 'Unknown'}: ${subs.length} subcategories`);
    }

  } catch (error) {
    console.error('Error checking categories:', error);
    process.exit(1);
  }
};

checkCurrentCategories().then(() => {
  console.log('\n✅ Check completed!');
  process.exit(0);
});