const { sequelize, Role } = require('./models');

async function fixWebmasterPermissions() {
  try {
    console.log('Fixing Webmaster permissions...');

    // Find the Webmaster role
    const webmasterRole = await Role.findOne({
      where: { name: 'Webmaster' }
    });

    if (!webmasterRole) {
      console.log('Webmaster role not found');
      return;
    }

    // Update the permissions to match the corrected setup
    const correctedPermissions = {
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
      'content.create': true,
      'content.edit': true,
      'content.delete': true,
      'content.publish': true,
      'users': true,
      'users.view': true,
      'users.read': true,
      'users.manage_roles': true,
      'users.manage': true
    };

    await webmasterRole.update({
      rolePermissions: correctedPermissions
    });

    console.log('Webmaster permissions updated successfully!');
    console.log('Removed broad content permissions, kept specific content actions');

  } catch (error) {
    console.error('Error fixing Webmaster permissions:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixWebmasterPermissions();