const { Admin } = require('../models');
const sequelize = require('../config/db');

const fixAdminPasswords = async () => {
  try {
    console.log('🔧 Fixing admin passwords...');

    // Get all admin accounts
    const admins = await Admin.findAll();

    if (admins.length === 0) {
      console.log('❌ No admin accounts found');
      return;
    }

    console.log(`Found ${admins.length} admin accounts`);

    let fixedCount = 0;

    for (const admin of admins) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      if (!admin.password.startsWith('$2')) {
        console.log(`🔄 Hashing password for ${admin.email}`);

        // Hash the plain text password
        await admin.hashPassword();
        await admin.save();

        fixedCount++;
        console.log(`✅ Password hashed for ${admin.email}`);
      } else {
        console.log(`⏭️ Password already hashed for ${admin.email}`);
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} admin passwords`);
    console.log('✅ All admin passwords are now properly hashed');

  } catch (error) {
    console.error('❌ Error fixing admin passwords:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  fixAdminPasswords();
}

module.exports = { fixAdminPasswords };