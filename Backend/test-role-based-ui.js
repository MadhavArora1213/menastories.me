const { Admin, Role } = require('./models');
const { getAccessibleMenuItems } = require('./middleware/rbacMiddleware');

// Test script to verify role-based UI access control
async function testRoleBasedUI() {
  try {
    console.log('🧪 Testing Role-Based UI Access Control\n');

    // Test different roles
    const rolesToTest = [
      'Master Admin',
      'Webmaster',
      'Content Admin',
      'Editor-in-Chief',
      'Section Editors',
      'Senior Writers',
      'Staff Writers',
      'Contributors',
      'Reviewers',
      'Social Media Manager'
    ];

    for (const roleName of rolesToTest) {
      console.log(`\n📋 Testing Role: ${roleName}`);
      console.log('='.repeat(50));

      // Get role with permissions
      const role = await Role.findOne({
        where: { name: roleName }
      });

      if (!role) {
        console.log(`❌ Role "${roleName}" not found`);
        continue;
      }

      // Get accessible menu items
      const permissions = role.rolePermissions || {};
      const accessibleMenuItems = getAccessibleMenuItems(permissions);

      console.log(`✅ Found ${accessibleMenuItems.length} accessible menu items:`);

      // Group menu items by section
      const sections = {};
      accessibleMenuItems.forEach(item => {
        const section = item.path.split('/')[2] || 'other'; // Extract section from path
        if (!sections[section]) sections[section] = [];
        sections[section].push(item.label);
      });

      // Display accessible sections and items
      Object.keys(sections).forEach(section => {
        console.log(`  📁 ${section.toUpperCase()}:`);
        sections[section].forEach(item => {
          console.log(`    • ${item}`);
        });
      });

      // Test specific permissions
      console.log('\n🔐 Key Permissions Check:');
      const keyPermissions = [
        'content.read',
        'content.create',
        'content.edit',
        'content.delete',
        'users.read',
        'users.manage_roles',
        'analytics.read',
        'analytics.export',
        'security.read',
        'system.settings'
      ];

      keyPermissions.forEach(perm => {
        const hasPermission = role.hasPermission(perm);
        console.log(`  ${hasPermission ? '✅' : '❌'} ${perm}`);
      });

      console.log('');
    }

    console.log('\n🎉 Role-based UI testing completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
testRoleBasedUI();