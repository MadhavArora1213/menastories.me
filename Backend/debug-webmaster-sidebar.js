const { Role } = require('./models');
require('dotenv').config();

async function debugWebmasterSidebar() {
  console.log('🔍 Debugging Webmaster Sidebar Permissions...\n');

  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Get Webmaster role
    const webmasterRole = await Role.findOne({ where: { name: 'Webmaster' } });
    if (!webmasterRole) {
      console.log('❌ Webmaster role not found');
      return;
    }

    console.log('🎯 WEBMASTER ROLE DETAILS:');
    console.log('='.repeat(50));
    console.log(`Name: ${webmasterRole.name}`);
    console.log(`Admin: ${webmasterRole.isAdmin}`);
    console.log(`Can Manage Users: ${webmasterRole.canManageUsers}`);
    console.log(`Can Manage Roles: ${webmasterRole.canManageRoles}`);
    console.log(`Access Level: ${webmasterRole.accessLevel}`);
    console.log('\n📋 PERMISSIONS OBJECT:');
    console.log(JSON.stringify(webmasterRole.rolePermissions, null, 2));

    // Simulate hasPermission function
    const hasPermission = (permission) => {
      if (!permission) return false;
      const perms = webmasterRole.rolePermissions || {};
      return !!perms[permission];
    };

    console.log('\n🔍 PERMISSION CHECKS:');
    console.log(`content: ${hasPermission('content')} (${!!webmasterRole.rolePermissions?.content})`);
    console.log(`users: ${hasPermission('users')} (${!!webmasterRole.rolePermissions?.users})`);
    console.log(`analytics: ${hasPermission('analytics')} (${!!webmasterRole.rolePermissions?.analytics})`);
    console.log(`security: ${hasPermission('security')} (${!!webmasterRole.rolePermissions?.security})`);
    console.log(`system: ${hasPermission('system')} (${!!webmasterRole.rolePermissions?.system})`);
    console.log(`communication: ${hasPermission('communication')} (${!!webmasterRole.rolePermissions?.communication})`);

    // Simulate the exact filtering logic from sidebar
    const navSections = [
      { title: "Content Management", key: "content", requiredPermission: "content" },
      { title: "User Management", key: "users", requiredPermission: "users" },
      { title: "Analytics & Performance", key: "analytics", requiredPermission: "analytics" },
      { title: "Security", key: "security", requiredPermission: "security" },
      { title: "System", key: "system", requiredPermission: "system" },
      { title: "Communication", key: "communication", requiredPermission: "communication" }
    ];

    console.log('\n📊 SIDEBAR FILTERING SIMULATION:');
    console.log('='.repeat(50));

    const filteredNavSections = navSections
      .filter(section => {
        console.log(`\n🔍 Checking section: ${section.title} (${section.key})`);

        // Master Admin can see all sections
        if (webmasterRole.name === 'Master Admin') {
          console.log(`   ✅ Master Admin - showing all sections`);
          return true;
        }

        // Webmaster can see technical sections
        if (webmasterRole.name === 'Webmaster') {
          const allowedSections = ['analytics', 'security', 'system', 'content', 'users'];
          const isAllowed = allowedSections.includes(section.key);
          console.log(`   ${isAllowed ? '✅' : '❌'} Webmaster role check: ${section.key} in [${allowedSections.join(', ')}] = ${isAllowed}`);
          if (isAllowed) return true;
        }

        // Use permission-based filtering as fallback
        const hasPerm = hasPermission(section.requiredPermission);
        console.log(`   ${hasPerm ? '✅' : '❌'} Permission check: ${section.requiredPermission} = ${hasPerm}`);
        return hasPerm;
      });

    console.log('\n🎯 FINAL FILTERED SECTIONS:');
    console.log('='.repeat(30));
    filteredNavSections.forEach(section => {
      console.log(`✅ ${section.title} (${section.key})`);
    });

    console.log('\n📈 SUMMARY:');
    console.log(`Total sections: ${navSections.length}`);
    console.log(`Filtered sections: ${filteredNavSections.length}`);
    console.log(`Hidden sections: ${navSections.length - filteredNavSections.length}`);

    await sequelize.close();
    console.log('\n✅ Debug completed successfully!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugWebmasterSidebar();