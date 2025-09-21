require('dotenv').config();
const { Tag } = require('./models');
const sequelize = require('./config/db');

async function cleanupDuplicateTags() {
  try {
    console.log('🔄 Connecting to database...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      console.log('\n🔍 Finding duplicate tags...');

      // Get all tags
      const allTags = await Tag.findAll({
        attributes: ['id', 'name', 'slug', 'categoryId'],
        order: [['name', 'ASC'], ['slug', 'ASC']],
        transaction
      });

      console.log(`📊 Found ${allTags.length} total tags`);

      // Group tags by name to identify duplicates
      const tagGroups = {};
      allTags.forEach(tag => {
        if (!tagGroups[tag.name]) {
          tagGroups[tag.name] = [];
        }
        tagGroups[tag.name].push(tag);
      });

      // Find tags with duplicates (those ending with -1, -2, etc.)
      const duplicateTagsToDelete = [];
      const originalTagsToKeep = [];

      Object.values(tagGroups).forEach(tags => {
        if (tags.length > 1) {
          // Sort by slug to identify which ones to keep/delete
          tags.sort((a, b) => {
            // Prefer tags without numeric suffixes
            const aHasSuffix = /\-\d+$/.test(a.slug);
            const bHasSuffix = /\-\d+$/.test(b.slug);

            if (!aHasSuffix && bHasSuffix) return -1;
            if (aHasSuffix && !bHasSuffix) return 1;

            // If both have suffixes or neither, sort by slug length (shorter first)
            return a.slug.length - b.slug.length;
          });

          // Keep the first one (original), delete the rest (duplicates)
          originalTagsToKeep.push(tags[0]);
          duplicateTagsToDelete.push(...tags.slice(1));
        } else {
          // No duplicates, keep this one
          originalTagsToKeep.push(tags[0]);
        }
      });

      console.log(`\n🗑️  Found ${duplicateTagsToDelete.length} duplicate tags to delete`);
      console.log(`✅ Keeping ${originalTagsToKeep.length} original tags`);

      if (duplicateTagsToDelete.length > 0) {
        console.log('\n📋 Duplicate tags to be deleted:');
        duplicateTagsToDelete.forEach(tag => {
          console.log(`   - ${tag.name} (${tag.slug})`);
        });

        // Delete duplicate tags
        const duplicateIds = duplicateTagsToDelete.map(tag => tag.id);
        await Tag.destroy({
          where: { id: duplicateIds },
          transaction
        });

        console.log(`\n✅ Successfully deleted ${duplicateTagsToDelete.length} duplicate tags`);
      }

      // Commit transaction
      await transaction.commit();

      // Get final count
      const finalCount = await Tag.count();
      console.log('\n📊 FINAL SUMMARY:');
      console.log(`Tags remaining: ${finalCount}`);

      if (finalCount === 84) {
        console.log('✅ Perfect! Exactly 84 tags remaining as expected.');
      } else {
        console.log(`⚠️  Expected 84 tags, but found ${finalCount}.`);
      }

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error cleaning up duplicate tags:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupDuplicateTags().catch(console.error);
}

module.exports = { cleanupDuplicateTags };