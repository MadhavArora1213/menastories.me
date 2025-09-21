const { Admin } = require('../models');
const sequelize = require('../config/db');

async function unlockAdminAccount() {
  try {
    console.log('🔄 Connecting to database...');

    // Find the admin account
    const admin = await Admin.findOne({
      where: { email: 'masteradmin1@magazine.com' }
    });

    if (!admin) {
      console.log('❌ Admin account not found');
      return;
    }

    console.log('✅ Admin account found:');
    console.log('📧 Email:', admin.email);
    console.log('🔐 Current login attempts:', admin.loginAttempts);
    console.log('⏰ Current lockout until:', admin.lockoutUntil);

    // Reset login attempts and unlock account
    admin.loginAttempts = 0;
    admin.lockoutUntil = null;
    await admin.save();

    console.log('✅ Admin account unlocked successfully!');
    console.log('🔐 Login attempts reset to:', admin.loginAttempts);
    console.log('⏰ Lockout until set to:', admin.lockoutUntil);

  } catch (error) {
    console.error('❌ Error unlocking admin account:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

unlockAdminAccount();