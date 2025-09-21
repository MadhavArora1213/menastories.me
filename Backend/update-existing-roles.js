const { Role } = require('./models');
require('dotenv').config();

async function updateExistingRoles() {
  console.log('🔄 Updating existing roles with new permission structure...');

  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Define updated permissions for each role
    const updatedPermissions = {
      'Master Admin': {
        'system': true,
        'system.full_access': true,
        'system.user_management': true,
        'system.role_management': true,
        'system.site_config': true,
        'system.technical_access': true,
        'system.performance_monitoring': true,
        'system.maintenance': true,
        'content': true,
        'content.create': true,
        'content.edit': true,
        'content.delete': true,
        'content.publish': true,
        'content.moderate': true,
        'content.read': true,
        'content.view': true,
        'users': true,
        'users.view': true,
        'users.read': true,
        'users.manage_roles': true,
        'users.manage': true,
        'communication': true,
        'communication.manage': true,
        'analytics': true,
        'analytics.view': true,
        'analytics.read': true,
        'analytics.export': true,
        'security': true,
        'security.view_logs': true,
        'security.read': true,
        'security.manage': true,
        'security.manage_security': true
      },
      'Webmaster': {
        'system': true,
        'system.technical_access': true,
        'system.performance_monitoring': true,
        'system.maintenance': true,
        'system.settings': true,
        'system.logs': true,
        'analytics': true,
        'analytics.view': true,
        'analytics.read': true,
        'analytics.export': true,
        'security': true,
        'security.view_logs': true,
        'security.read': true,
        'security.manage': true,
        'security.manage_security': true,
        'content': true,
        'content.read': true,
        'content.view': true,
        'users': true,
        'users.view': true,
        'users.read': true,
        'users.manage_roles': true,
        'users.manage': true
      },
      'Content Admin': {
        'system': true,
        'system.dashboard.view': true,
        'system.settings': true,
        'content': true,
        'content.view': true,
        'content.read': true,
        'content.create': true,
        'content.edit': true,
        'content.delete': true,
        'content.publish': true,
        'content.moderate': true,
        'content.schedule': true,
        'content.approve': true,
        'content.quality_control': true,
        'analytics': true,
        'analytics.view': true,
        'analytics.read': true,
        'users': true,
        'users.view': true,
        'users.read': true,
        'users.view_content_users': true,
        'communication': true,
        'communication.manage': true
      }
    };

    // Update each role
    for (const [roleName, permissions] of Object.entries(updatedPermissions)) {
      console.log(`\n📝 Updating ${roleName}...`);

      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        await role.update({
          rolePermissions: permissions,
          isAdmin: roleName === 'Master Admin' || roleName === 'Webmaster' || roleName === 'Content Admin',
          canManageUsers: roleName === 'Master Admin' || roleName === 'Webmaster',
          canManageRoles: roleName === 'Master Admin' || roleName === 'Webmaster'
        });
        console.log(`✅ ${roleName} updated successfully`);
      } else {
        console.log(`⚠️  ${roleName} not found`);
      }
    }

    console.log('\n🎉 All existing roles updated successfully!');
    await sequelize.close();

  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateExistingRoles();