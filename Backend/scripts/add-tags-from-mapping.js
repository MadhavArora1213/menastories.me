const fs = require('fs');
const path = require('path');
const { Category, Tag } = require('../models');

const generateSlug = (name, category = '') => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // If category is provided and it's a subcategory, include category in slug
  if (category && category !== 'Main Category') {
    const categorySlug = category
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `${baseSlug}-${categorySlug}`;
  }

  return baseSlug;
};

const addTagsFromMapping = async () => {
  try {
    console.log('🚀 Starting to add tags from tagMapping.json to database...');

    // Read the tag mapping file
    const mappingPath = path.join(__dirname, '../config/tagMapping.json');
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

    let totalTagsCreated = 0;

    // Process each category and its tags
    for (const [categoryName, tags] of Object.entries(mappingData)) {
      console.log(`\n📂 Processing category: ${categoryName}`);

      // Find or create the category in database
      const [category, categoryCreated] = await Category.findOrCreate({
        where: { name: categoryName },
        defaults: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          type: 'main'
        }
      });

      if (categoryCreated) {
        console.log(`   ✅ Created category: ${categoryName}`);
      } else {
        console.log(`   ⏭️  Category already exists: ${categoryName}`);
      }

      console.log(`   Category ID: ${category.id}`);

      // Add tags for this category
      for (const tagName of tags) {
        try {
          const [tag, created] = await Tag.findOrCreate({
            where: { slug: generateSlug(tagName) },
            defaults: {
              name: tagName,
              slug: generateSlug(tagName),
              type: 'regular',
              category: categoryName,
              categoryId: category.id
            }
          });

          if (created) {
            console.log(`   ✅ Created tag: ${tagName}`);
            totalTagsCreated++;
          } else {
            console.log(`   ⏭️  Tag already exists: ${tagName}`);
          }
        } catch (tagError) {
          console.log(`   ❌ Error creating tag "${tagName}": ${tagError.message}`);
        }
      }
    }

    console.log(`\n🎉 Tag creation completed!`);
    console.log(`📊 Total tags created: ${totalTagsCreated}`);

    // Verify final count
    const allTags = await Tag.findAll();
    console.log(`📈 Total tags in database: ${allTags.length}`);

    // Group by category
    const categoryCounts = {};
    for (const tag of allTags) {
      const catName = tag.category || 'Uncategorized';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    }

    console.log(`\n📋 Tags by category:`);
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   • ${cat}: ${count} tags`);
    });

  } catch (error) {
    console.error('❌ Error adding tags:', error);
    throw error;
  }
};

// Run the script
addTagsFromMapping()
  .then(() => {
    console.log('\n✅ Tags addition from mapping process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Tags addition from mapping failed:', error);
    process.exit(1);
  });