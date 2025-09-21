const { Admin } = require('./models');

async function testFixedPermissions() {
  try {
    console.log('🧪 Testing fixed permission system...\n');

    // Test with Social Media Manager
    const socialAdmin = await Admin.findOne({
      where: { email: 'socialmanager@magazine.com' },
      include: [{
        model: require('./models').Role,
        as: 'role',
        attributes: ['name', 'rolePermissions']
      }],
      attributes: { exclude: ['password'] }
    });

    if (!socialAdmin) {
      console.log('❌ Social Media Manager admin not found!');
      return;
    }

    console.log('✅ Social Media Manager admin found:');
    console.log(`   Email: ${socialAdmin.email}`);
    console.log(`   Role: ${socialAdmin.role?.name}`);
    console.log(`   Role Permissions:`, socialAdmin.role?.rolePermissions);

    // Test getFullPermissions method
    const permissions = socialAdmin.getFullPermissions();
    console.log(`\n🔐 Full Permissions (${Object.keys(permissions).length}):`);
    Object.keys(permissions).forEach(perm => {
      console.log(`   - ${perm}: ${permissions[perm]}`);
    });

    // Test permission checking
    console.log('\n🛡️ Permission Checks:');
    console.log(`   Has 'social.manage_platforms': ${socialAdmin.hasPermission('social.manage_platforms')}`);
    console.log(`   Has 'content.create': ${socialAdmin.hasPermission('content.create')}`);
    console.log(`   Has 'system.full_access': ${socialAdmin.hasPermission('system.full_access')}`);

    console.log('\n✅ Permission system test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing fixed permissions:', error);
  } finally {
    process.exit(0);
  }
}

testFixedPermissions();