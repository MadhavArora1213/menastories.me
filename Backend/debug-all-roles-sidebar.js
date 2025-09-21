const { Role } = require('./models');
require('dotenv').config();

async function debugAllRolesSidebar() {
  console.log('🔍 Debugging Sidebar for ALL Roles...\n');

  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Get all roles
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'isAdmin', 'canManageUsers', 'canManageRoles', 'rolePermissions'],
      order: [['accessLevel', 'DESC']]
    });

    console.log('📋 SIDEBAR ANALYSIS FOR ALL ROLES:');
    console.log('='.repeat(80));

    // Define all sidebar sections
    const navSections = [
      { title: "Content Management", key: "content", requiredPermission: "content" },
      { title: "Downloads", key: "downloads", requiredPermission: "content" },
      { title: "Media Kit", key: "media-kit", requiredPermission: "content" },
      { title: "User Management", key: "users", requiredPermission: "users" },
      { title: "Communication", key: "communication", requiredPermission: "communication" },
      { title: "Analytics & Performance", key: "analytics", requiredPermission: "analytics" },
      { title: "Security", key: "security", requiredPermission: "security" },
      { title: "System", key: "system", requiredPermission: "system" }
    ];

    // Test each role
    for (const role of roles) {
      console.log(`\n🎯 ${role.name} Role Analysis:`);
      console.log('-'.repeat(50));

      // Simulate hasPermission function
      const hasPermission = (permission) => {
        if (!permission) return false;
        const perms = role.rolePermissions || {};
        return !!perms[permission];
      };

      // Current hardcoded logic (what we have now)
      const currentFilteredSections = navSections.filter(section => {
        if (role.name === 'Master Admin') return true;
        if (role.name === 'Webmaster') {
          return ['analytics', 'security', 'system', 'content', 'users'].includes(section.key);
        }
        if (role.name === 'Content Admin') {
          return ['content', 'analytics', 'users', 'communication'].includes(section.key);
        }
        if (['Editor-in-Chief', 'Section Editors'].includes(role.name)) {
          return ['content', 'users'].includes(section.key);
        }
        if (['Senior Writers', 'Staff Writers', 'Contributors', 'Reviewers', 'Social Media Manager'].includes(role.name)) {
          return ['content', 'users'].includes(section.key);
        }
        return hasPermission(section.requiredPermission);
      });

      // Better permission-based logic (what we should have)
      const betterFilteredSections = navSections.filter(section => {
        // Master Admin sees everything
        if (role.name === 'Master Admin') return true;

        // Check actual permissions
        return hasPermission(section.requiredPermission);
      });

      console.log(`Current Logic: ${currentFilteredSections.length} sections`);
      console.log(`Better Logic: ${betterFilteredSections.length} sections`);

      // Show differences
      const currentKeys = currentFilteredSections.map(s => s.key);
      const betterKeys = betterFilteredSections.map(s => s.key);

      const extraInCurrent = currentKeys.filter(k => !betterKeys.includes(k));
      const missingInCurrent = betterKeys.filter(k => !currentKeys.includes(k));

      if (extraInCurrent.length > 0) {
        console.log(`❌ Current shows extra: ${extraInCurrent.join(', ')}`);
      }
      if (missingInCurrent.length > 0) {
        console.log(`❌ Current misses: ${missingInCurrent.join(', ')}`);
      }

      // Show actual permissions
      console.log(`Permissions: ${Object.keys(role.rolePermissions || {}).filter(k => role.rolePermissions[k]).join(', ')}`);

      // Show what sections they should see based on permissions
      console.log(`Should see: ${betterKeys.join(', ')}`);
    }

    console.log('\n📊 RECOMMENDED FIXES:');
    console.log('='.repeat(50));

    console.log('1. 🔧 Replace hardcoded role checks with pure permission-based filtering');
    console.log('2. 🔧 Remove role-specific exceptions and use hasPermission() consistently');
    console.log('3. 🔧 Let permissions determine access, not role names');

    console.log('\n✨ BENEFITS:');
    console.log('• More accurate access control');
    console.log('• Easier permission management');
    console.log('• Consistent behavior across roles');
    console.log('• No need to update sidebar code when roles change');

    await sequelize.close();
    console.log('\n✅ Analysis completed successfully!');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

debugAllRolesSidebar();