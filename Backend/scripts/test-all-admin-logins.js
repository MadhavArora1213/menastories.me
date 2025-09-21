const { Admin } = require('../models');
const sequelize = require('../config/db');

async function testAllAdminLogins() {
  try {
    console.log('🔄 Testing all admin logins...\n');

    // Get all admin accounts
    const admins = await Admin.findAll();

    console.log(`📊 Found ${admins.length} admin accounts\n`);

    // Test each admin login
    for (const admin of admins) {
      console.log(`🔍 Testing: ${admin.email}`);

      // Determine the correct password based on email
      let expectedPassword = '';
      if (admin.email.includes('masteradmin')) expectedPassword = 'MasterAdmin@123';
      else if (admin.email.includes('webmaster')) expectedPassword = 'Webmaster@123';
      else if (admin.email.includes('contentadmin')) expectedPassword = 'ContentAdmin@123';
      else if (admin.email.includes('editor-in-chief')) expectedPassword = 'Editor-in-Chief@123';
      else if (admin.email.includes('sectioneditors')) expectedPassword = 'SectionEditors@123';
      else if (admin.email.includes('seniorwriters')) expectedPassword = 'SeniorWriters@123';
      else if (admin.email.includes('staffwriters')) expectedPassword = 'StaffWriters@123';
      else if (admin.email.includes('contributors')) expectedPassword = 'Contributors@123';
      else if (admin.email.includes('reviewers')) expectedPassword = 'Reviewers@123';
      else if (admin.email.includes('socialmediamanager')) expectedPassword = 'SocialMediaManager@123';

      if (expectedPassword) {
        const isValid = await admin.checkPassword(expectedPassword);
        console.log(`  ✅ Password valid: ${isValid ? 'YES' : 'NO'}`);
        if (!isValid) {
          console.log(`  🔄 Re-hashing password...`);
          const bcrypt = require('bcryptjs');
          const hashedPassword = await bcrypt.hash(expectedPassword, 12);
          await admin.update({ password: hashedPassword });
          console.log(`  ✅ Password fixed!`);
        }
      } else {
        console.log(`  ⚠️  Could not determine password for ${admin.email}`);
      }

      console.log('');
    }

    console.log('🎉 Admin login testing completed!');

  } catch (error) {
    console.error('❌ Error testing admin logins:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testAllAdminLogins();