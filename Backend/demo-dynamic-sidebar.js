const { Role } = require('./models');
require('dotenv').config();

async function demoDynamicSidebar() {
  console.log('🎭 DEMO: Dynamic Sidebar Based on Role Permissions\n');

  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Get all roles
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'isAdmin', 'canManageUsers', 'canManageRoles', 'rolePermissions'],
      order: [['accessLevel', 'DESC']]
    });

    console.log('📋 DYNAMIC SIDEBAR DEMONSTRATION:');
    console.log('='.repeat(80));

    roles.forEach((role, index) => {
      console.log(`\n${index + 1}. 🎯 ${role.name} Sidebar:`);
      console.log('-'.repeat(50));

      const perms = role.rolePermissions || {};

      // Simulate sidebar filtering logic
      const sidebarSections = [
        {
          name: 'Content Management',
          key: 'content',
          requiredPermission: 'content',
          visible: !!perms.content,
          links: [
            { name: 'Articles', permission: 'content.read', visible: !!perms['content.read'] },
            { name: 'Create Article', permission: 'content.create', visible: !!perms['content.create'] },
            { name: 'Categories', permission: 'content.read', visible: !!perms['content.read'] },
            { name: 'Comments', permission: 'content.moderate', visible: !!perms['content.moderate'] }
          ]
        },
        {
          name: 'User Management',
          key: 'users',
          requiredPermission: 'users',
          visible: !!perms.users,
          links: [
            { name: 'All Users', permission: 'users.read', visible: !!perms['users.read'] },
            { name: 'Roles & Permissions', permission: 'users.manage_roles', visible: !!perms['users.manage_roles'] }
          ]
        },
        {
          name: 'Analytics & Performance',
          key: 'analytics',
          requiredPermission: 'analytics',
          visible: !!perms.analytics,
          links: [
            { name: 'Analytics Dashboard', permission: 'analytics.read', visible: !!perms['analytics.read'] },
            { name: 'Content Performance', permission: 'analytics.read', visible: !!perms['analytics.read'] }
          ]
        },
        {
          name: 'Security',
          key: 'security',
          requiredPermission: 'security',
          visible: !!perms.security,
          links: [
            { name: 'Security Dashboard', permission: 'security.read', visible: !!perms['security.read'] },
            { name: 'Security Logs', permission: 'security.view_logs', visible: !!perms['security.view_logs'] }
          ]
        },
        {
          name: 'System',
          key: 'system',
          requiredPermission: 'system',
          visible: !!perms.system,
          links: [
            { name: 'Technical Access', permission: 'system.technical_access', visible: !!perms['system.technical_access'] },
            { name: 'Performance Monitoring', permission: 'system.performance_monitoring', visible: !!perms['system.performance_monitoring'] }
          ]
        },
        {
          name: 'Communication',
          key: 'communication',
          requiredPermission: 'communication',
          visible: !!perms.communication,
          links: [
            { name: 'Newsletter', permission: 'communication.manage', visible: !!perms['communication.manage'] }
          ]
        }
      ];

      // Filter visible sections
      const visibleSections = sidebarSections.filter(section => section.visible);

      if (visibleSections.length === 0) {
        console.log('❌ No sidebar sections visible for this role');
      } else {
        visibleSections.forEach(section => {
          console.log(`📁 ${section.name}:`);
          const visibleLinks = section.links.filter(link => link.visible);
          if (visibleLinks.length === 0) {
            console.log('   └── (No links visible)');
          } else {
            visibleLinks.forEach(link => {
              console.log(`   ├── ✅ ${link.name}`);
            });
          }
        });
      }

      // Show admin status
      console.log(`👤 Admin Status: ${role.isAdmin ? '✅ Admin' : '❌ Non-admin'}`);
      console.log(`👥 Can Manage Users: ${role.canManageUsers ? '✅ Yes' : '❌ No'}`);
      console.log(`🔐 Can Manage Roles: ${role.canManageRoles ? '✅ Yes' : '❌ No'}`);
    });

    console.log('\n🎉 DYNAMIC SIDEBAR SUMMARY:');
    console.log('• Each role sees different sidebar sections based on permissions');
    console.log('• Menu items are filtered in real-time based on user access');
    console.log('• Admin status determines core system access');
    console.log('• Permissions are checked dynamically for each menu item');

    await sequelize.close();
    console.log('\n✅ Demo completed successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

demoDynamicSidebar();