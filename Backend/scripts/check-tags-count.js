const { Tag } = require('../models');
const sequelize = require('../config/db');

async function checkTagsCount() {
  try {
    console.log('🔄 Checking tags in database...\n');

    // Get total count
    const totalCount = await Tag.count();
    console.log(`📊 Total tags in database: ${totalCount}\n`);

    if (totalCount === 0) {
      console.log('❌ No tags found! This explains why it shows 0 tags.');
      console.log('🔍 Checking if Tags table exists...\n');

      // Check if table exists
      const [results] = await sequelize.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'Tags'
        );
      `);

      if (results[0].exists) {
        console.log('✅ Tags table exists but is empty');
        console.log('🔄 Need to seed tags. Let me check available tag scripts...\n');

        // Check if there are tag seeding scripts
        const fs = require('fs');
        const path = require('path');

        const scriptsDir = path.join(__dirname);
        const files = fs.readdirSync(scriptsDir);

        const tagScripts = files.filter(file =>
          file.includes('tag') && file.endsWith('.js')
        );

        console.log('📋 Available tag scripts:');
        tagScripts.forEach(script => {
          console.log(`  - ${script}`);
        });

        if (tagScripts.includes('add-140-tags.js')) {
          console.log('\n🎯 Found add-140-tags.js script!');
          console.log('🔄 Running tag seeding script...\n');

          // Run the tag seeding script
          const { execSync } = require('child_process');
          try {
            execSync('node add-140-tags.js', { cwd: __dirname, stdio: 'inherit' });
            console.log('\n✅ Tag seeding completed!');
          } catch (error) {
            console.log('\n❌ Error running tag seeding script:', error.message);
          }
        }

      } else {
        console.log('❌ Tags table does not exist!');
        console.log('🔧 Database schema issue detected.');
      }

    } else {
      console.log('✅ Tags found in database');
      console.log('📋 Sample tags:');

      // Get sample tags
      const sampleTags = await Tag.findAll({
        limit: 10,
        attributes: ['id', 'name', 'slug']
      });

      sampleTags.forEach((tag, index) => {
        console.log(`  ${index + 1}. ${tag.name} (${tag.slug})`);
      });

      if (totalCount > 10) {
        console.log(`  ... and ${totalCount - 10} more tags`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking tags:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkTagsCount();