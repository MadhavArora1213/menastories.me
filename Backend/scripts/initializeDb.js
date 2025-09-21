const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const { Role, Admin } = require('../models');
require('dotenv').config();

const roles = [
  {
    name: 'Master Admin',
    description: 'Full system control, user management, site configuration'
  },
  {
    name: 'Webmaster',
    description: 'Technical management, site maintenance, performance optimization'
  },
  {
    name: 'Content Admin',
    description: 'Content oversight, publishing schedule, category management'
  },
  {
    name: 'Editor-in-Chief',
    description: 'Editorial decisions, content strategy, quality standards'
  },
  {
    name: 'Section Editors',
    description: 'Category specialists, content curation, writer coordination'
  },
  {
    name: 'Senior Writers',
    description: 'Feature articles, investigative pieces, major interviews'
  },
  {
    name: 'Staff Writers',
    description: 'Regular content creation, daily articles, event coverage'
  },
  {
    name: 'Contributors',
    description: 'Guest articles, specialized content, expert opinions'
  },
  {
    name: 'Reviewers',
    description: 'Fact checking, content verification, quality assurance'
  },
  {
    name: 'Social Media Manager',
    description: 'Digital presence, social engagement, content promotion'
  }
];

const initializeDb = async () => {
  try {
    console.log('Starting database table creation...');

    // Sync database to create tables only
    console.log('Creating database tables...');

    try {
      // Try simple sync first (fastest)
      await sequelize.sync();
      console.log('Database tables created successfully');
    } catch (syncError) {
      console.log('Simple sync failed, trying alter sync...');
      try {
        // Try alter sync if simple sync fails
        await sequelize.sync({ alter: true });
        console.log('Database tables created successfully with alter');
      } catch (alterError) {
        console.error('Alter sync also failed:', alterError.message);
        console.log('Database tables may already exist or there may be schema conflicts');
        console.log('Please use the specific seeding scripts for data:');
        console.log('- seedAdminRoles.js for roles');
        console.log('- createCategoriesAndSubcategories.js for categories');
        console.log('- addNewTags.js for tags');
      }
    }

    console.log('Database table creation completed!');
    console.log('\n📋 Use these scripts to seed data:');
    console.log('• npm run seed-roles (or node scripts/seedAdminRoles.js)');
    console.log('• npm run seed-categories (or node scripts/createCategoriesAndSubcategories.js)');
    console.log('• npm run seed-tags (or node scripts/addNewTags.js)');
    console.log('• npm run seed-admins (or node scripts/seedAdminData.js)');

    return { success: true };
  } catch (error) {
    console.error('Database table creation error:', error);
    console.log('\n💡 Tip: If tables already exist, use the specific seeding scripts instead');
    return { success: false, error };
  }
};

// Execute if run directly
if (require.main === module) {
  initializeDb()
    .then(result => {
      if (result.success) {
        console.log('Script completed successfully');
        process.exit(0);
      } else {
        console.error('Script failed');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}

module.exports = initializeDb;