const sequelize = require('../config/db');
const Admin = require('../models/Admin');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

const fixAdminPasswords = async () => {
  try {
    console.log('Starting admin password fix...');

    // Get all existing admins
    const admins = await Admin.findAll();
    console.log(`Found ${admins.length} admin users`);

    for (const admin of admins) {
      console.log(`Processing ${admin.email}...`);

      // Get the original password based on role
      let originalPassword;
      if (admin.email === 'masteradmin1@magazine.com') {
        originalPassword = 'MasterAdmin@123';
      } else if (admin.email === 'webmaster1@magazine.com') {
        originalPassword = 'Webmaster@123';
      } else if (admin.email === 'contentadmin1@magazine.com') {
        originalPassword = 'ContentAdmin@123';
      } else if (admin.email === 'editor-in-chief1@magazine.com') {
        originalPassword = 'Editor-in-Chief@123';
      } else if (admin.email === 'sectioneditors1@magazine.com') {
        originalPassword = 'SectionEditors@123';
      } else if (admin.email === 'seniorwriters1@magazine.com') {
        originalPassword = 'SeniorWriters@123';
      } else if (admin.email === 'staffwriters1@magazine.com') {
        originalPassword = 'StaffWriters@123';
      } else if (admin.email === 'contributors1@magazine.com') {
        originalPassword = 'Contributors@123';
      } else if (admin.email === 'reviewers1@magazine.com') {
        originalPassword = 'Reviewers@123';
      } else if (admin.email === 'socialmediamanager1@magazine.com') {
        originalPassword = 'SocialMediaManager@123';
      }

      if (originalPassword) {
        // Hash the password properly
        const hashedPassword = await bcrypt.hash(originalPassword, 12);
        admin.password = hashedPassword;
        await admin.save();
        console.log(`✅ Fixed password for ${admin.email}`);
      }
    }

    console.log('Admin password fix completed!');

  } catch (error) {
    console.error('Error fixing admin passwords:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  fixAdminPasswords();
}

module.exports = fixAdminPasswords;