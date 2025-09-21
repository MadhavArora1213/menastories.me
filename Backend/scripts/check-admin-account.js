const { Admin, Role } = require('../models');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

async function checkAdminAccount() {
  try {
    console.log('🔄 Connecting to database...');

    // Find the admin account
    const admin = await Admin.findOne({
      where: { email: 'masteradmin1@magazine.com' },
      include: [{ model: Role, as: 'role' }]
    });

    if (!admin) {
      console.log('❌ Admin account not found');
      console.log('📋 Checking all admin accounts...');

      const allAdmins = await Admin.findAll({
        include: [{ model: Role, as: 'role' }]
      });

      console.log(`📊 Found ${allAdmins.length} admin accounts:`);
      allAdmins.forEach((adm, index) => {
        console.log(`${index + 1}. ${adm.email} - ${adm.name} - Role: ${adm.role?.name || 'No role'}`);
      });

      return;
    }

    console.log('✅ Admin account found:');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔒 Password hash:', admin.password ? admin.password.substring(0, 20) + '...' : 'No password');
    console.log('🎭 Role:', admin.role?.name || 'No role');
    console.log('✅ Active:', admin.isActive);
    console.log('🔐 Login attempts:', admin.loginAttempts);
    console.log('⏰ Lockout until:', admin.lockoutUntil);

    // Test password verification
    const testPassword = 'MasterAdmin@123';
    console.log('\n🔍 Testing password verification...');
    const isValid = await admin.checkPassword(testPassword);
    console.log('✅ Password valid:', isValid);

    if (!isValid) {
      console.log('❌ Password verification failed!');
      console.log('🔄 Re-hashing password for testing...');

      // Re-hash the password
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      await admin.update({ password: hashedPassword });

      console.log('✅ Password re-hashed successfully');

      // Test again
      const retestValid = await admin.checkPassword(testPassword);
      console.log('🔄 Retest password valid:', retestValid);
    }

  } catch (error) {
    console.error('❌ Error checking admin account:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkAdminAccount();