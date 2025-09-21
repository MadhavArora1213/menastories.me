const { Permission } = require('./models');
const sequelize = require('./config/db');

async function checkAndCreatePermissions() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Check existing permissions
    const existingPermissions = await Permission.findAll({
      attributes: ['name', 'resource', 'action']
    });

    console.log('Existing permissions:');
    existingPermissions.forEach(p => {
      console.log(`- ${p.name} (resource: ${p.resource}, action: ${p.action})`);
    });

    // Required permissions for the frontend
    const requiredPermissions = [
      { name: 'content:create', resource: 'content', action: 'create' },
      { name: 'content:edit', resource: 'content', action: 'edit' },
      { name: 'content:delete', resource: 'content', action: 'delete' },
      { name: 'content:moderate', resource: 'content', action: 'moderate' },
      { name: 'system:full_access', resource: 'system', action: 'full_access' },
      { name: 'system:user_management', resource: 'system', action: 'user_management' },
      { name: 'system:role_management', resource: 'system', action: 'role_management' },
      { name: 'system:site_config', resource: 'system', action: 'site_config' },
      { name: 'analytics:view', resource: 'analytics', action: 'view' },
      { name: 'analytics:export', resource: 'analytics', action: 'export' },
      { name: 'security:view_logs', resource: 'security', action: 'view_logs' },
      { name: 'security:manage_security', resource: 'security', action: 'manage_security' },
      { name: 'social:manage_platforms', resource: 'social', action: 'manage_platforms' },
      { name: 'social:content_promotion', resource: 'social', action: 'content_promotion' },
      { name: 'social:engagement', resource: 'social', action: 'engagement' }
    ];

    const existingNames = existingPermissions.map(p => p.name);
    const missingPermissions = requiredPermissions.filter(p => !existingNames.includes(p.name));

    if (missingPermissions.length > 0) {
      console.log('\nCreating missing permissions:');
      for (const perm of missingPermissions) {
        await Permission.create(perm);
        console.log(`✓ Created: ${perm.name}`);
      }
      console.log(`\nCreated ${missingPermissions.length} missing permissions`);
    } else {
      console.log('\nAll required permissions already exist');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkAndCreatePermissions();