const { Admin } = require('../models');
const sequelize = require('../config/db');

async function resetAdminLockout() {
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

    console.log('📋 Found admin:', admin.email);
    console.log('🔒 Current lockout status:', {
      loginAttempts: admin.loginAttempts,
      lockoutUntil: admin.lockoutUntil,
      isAccountLocked: admin.isAccountLocked
    });

    // Reset lockout
    await admin.update({
      loginAttempts: 0,
      lockoutUntil: null,
      isAccountLocked: false
    });

    console.log('✅ Admin lockout reset successfully!');
    console.log('🔓 New lockout status:', {
      loginAttempts: admin.loginAttempts,
      lockoutUntil: admin.lockoutUntil,
      isAccountLocked: admin.isAccountLocked
    });

  } catch (error) {
    console.error('❌ Error resetting admin lockout:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

resetAdminLockout();