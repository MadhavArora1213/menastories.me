const { Role, Permission, RolePermission } = require('./models');
require('dotenv').config();

async function testRoleUpdates() {
  console.log('🧪 Testing Role Updates...');

  try {
    // Connect to database
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Find a test role (let's use Social Media Manager as it's not critical)
    const testRole = await Role.findOne({ where: { name: 'Social Media Manager' } });
    if (!testRole) {
      console.log('❌ Social Media Manager role not found');
      return;
    }

    console.log(`📝 Testing updates on role: ${testRole.name}`);
    console.log(`   Original isAdmin: ${testRole.isAdmin}`);
    console.log(`   Original accessLevel: ${testRole.accessLevel}`);
    console.log(`   Original canManageUsers: ${testRole.canManageUsers}`);
    console.log(`   Original canManageRoles: ${testRole.canManageRoles}`);

    // Test updating the role fields
    const originalValues = {
      isAdmin: testRole.isAdmin,
      accessLevel: testRole.accessLevel,
      canManageUsers: testRole.canManageUsers,
      canManageRoles: testRole.canManageRoles
    };

    // Update to different values
    await testRole.update({
      isAdmin: !originalValues.isAdmin,
      accessLevel: originalValues.accessLevel === 1 ? 2 : 1,
      canManageUsers: !originalValues.canManageUsers,
      canManageRoles: !originalValues.canManageRoles
    });

    console.log(`✅ Updated role successfully!`);
    console.log(`   New isAdmin: ${testRole.isAdmin}`);
    console.log(`   New accessLevel: ${testRole.accessLevel}`);
    console.log(`   New canManageUsers: ${testRole.canManageUsers}`);
    console.log(`   New canManageRoles: ${testRole.canManageRoles}`);

    // Verify the changes persisted by fetching again
    const refreshedRole = await Role.findByPk(testRole.id);
    console.log(`🔍 Verifying persistence...`);
    console.log(`   Refreshed isAdmin: ${refreshedRole.isAdmin}`);
    console.log(`   Refreshed accessLevel: ${refreshedRole.accessLevel}`);
    console.log(`   Refreshed canManageUsers: ${refreshedRole.canManageUsers}`);
    console.log(`   Refreshed canManageRoles: ${refreshedRole.canManageRoles}`);

    // Check if values match
    const persisted = (
      refreshedRole.isAdmin === testRole.isAdmin &&
      refreshedRole.accessLevel === testRole.accessLevel &&
      refreshedRole.canManageUsers === testRole.canManageUsers &&
      refreshedRole.canManageRoles === testRole.canManageRoles
    );

    if (persisted) {
      console.log('✅ All changes persisted successfully!');
    } else {
      console.log('❌ Changes did not persist properly!');
    }

    // Restore original values
    await testRole.update(originalValues);
    console.log('🔄 Restored original values');

    await sequelize.close();
    console.log('🎉 Role update test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRoleUpdates();