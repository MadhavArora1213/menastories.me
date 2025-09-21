const { sequelize, Role, Permission, RolePermission } = require('./models');

async function setupPermissions() {
  try {
    console.log('Setting up permissions system...');

    // Define all permissions
    const permissions = [
      // System permissions
      { name: 'system.full_access', description: 'Full system access', resource: 'system', action: 'full_access' },
      { name: 'system.user_management', description: 'User management access', resource: 'system', action: 'user_management' },
      { name: 'system.role_management', description: 'Role management access', resource: 'system', action: 'role_management' },
      { name: 'system.site_config', description: 'Site configuration access', resource: 'system', action: 'site_config' },
      { name: 'system.technical_access', description: 'Technical access', resource: 'system', action: 'technical_access' },
      { name: 'system.performance_monitoring', description: 'Performance monitoring access', resource: 'system', action: 'performance_monitoring' },
      { name: 'system.maintenance', description: 'System maintenance access', resource: 'system', action: 'maintenance' },
      { name: 'system.settings', description: 'System settings access', resource: 'system', action: 'settings' },
      { name: 'system.logs', description: 'System logs access', resource: 'system', action: 'logs' },

      // Content permissions
      { name: 'content.view', description: 'View content', resource: 'content', action: 'view' },
      { name: 'content.create', description: 'Create content', resource: 'content', action: 'create' },
      { name: 'content.edit', description: 'Edit content', resource: 'content', action: 'edit' },
      { name: 'content.delete', description: 'Delete content', resource: 'content', action: 'delete' },
      { name: 'content.publish', description: 'Publish content', resource: 'content', action: 'publish' },
      { name: 'content.moderate', description: 'Moderate content', resource: 'content', action: 'moderate' },

      // Analytics permissions
      { name: 'analytics.view', description: 'View analytics', resource: 'analytics', action: 'view' },
      { name: 'analytics.export', description: 'Export analytics', resource: 'analytics', action: 'export' },

      // Security permissions
      { name: 'security.view_logs', description: 'View security logs', resource: 'security', action: 'view_logs' },
      { name: 'security.manage_security', description: 'Manage security settings', resource: 'security', action: 'manage_security' },

      // User permissions
      { name: 'users.view', description: 'View users', resource: 'users', action: 'view' },
      { name: 'users.manage', description: 'Manage users', resource: 'users', action: 'manage' },
      { name: 'users.view_content_users', description: 'View content users', resource: 'users', action: 'view_content_users' },

      // Communication permissions
      { name: 'communication.manage', description: 'Manage communications', resource: 'communication', action: 'manage' },

      // Dashboard permissions
      { name: 'system.dashboard.view', description: 'View dashboard', resource: 'system.dashboard', action: 'view' }
    ];

    // Create permissions
    console.log('Creating permissions...');
    for (const perm of permissions) {
      await Permission.findOrCreate({
        where: { name: perm.name },
        defaults: perm
      });
    }

    // Get all roles
    const roles = await Role.findAll();
    console.log(`Found ${roles.length} roles`);

    // Define role-permission mappings
    const rolePermissionMappings = {
      'Master Admin': [
        'system.full_access', 'system.user_management', 'system.role_management', 'system.site_config',
        'system.technical_access', 'system.performance_monitoring', 'system.maintenance', 'system.settings', 'system.logs',
        'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish', 'content.moderate',
        'analytics.view', 'analytics.export',
        'security.view_logs', 'security.manage_security',
        'users.view', 'users.manage', 'users.view_content_users',
        'communication.manage',
        'system.dashboard.view'
      ],
      'Webmaster': [
        'system.technical_access', 'system.performance_monitoring', 'system.maintenance',
        'content.create', 'content.edit', 'content.delete', 'content.publish',
        'analytics.view', 'analytics.export',
        'security.view_logs', 'security.manage_security',
        'system', 'analytics', 'security' // Broad permissions for sidebar
      ],
      'Content Admin': [
        'system.dashboard.view',
        'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish', 'content.moderate',
        'analytics.view',
        'users.view', 'users.view_content_users'
      ],
      'Editor-in-Chief': [
        'content.create', 'content.edit', 'content.delete', 'content.publish',
        'content.approve', 'content.quality_control'
      ],
      'Section Editors': [
        'content.create', 'content.edit', 'content.delete', 'content.publish',
        'content.section_oversight'
      ],
      'Senior Writers': [
        'content.create', 'content.edit', 'content.publish',
        'content.feature_articles', 'content.investigative'
      ],
      'Staff Writers': [
        'content.create', 'content.edit', 'content.publish',
        'content.daily_articles', 'content.event_coverage'
      ],
      'Contributors': [
        'content.create', 'content.submit', 'content.limited_edit'
      ],
      'Reviewers': [
        'content.review', 'content.fact_check', 'content.quality_assurance', 'content.approve'
      ],
      'Social Media Manager': [
        'social.manage_platforms', 'social.content_promotion', 'social.engagement', 'social.analytics'
      ]
    };

    // Assign permissions to roles
    for (const role of roles) {
      const roleName = role.name;
      const permissionNames = rolePermissionMappings[roleName];

      if (permissionNames) {
        console.log(`Assigning permissions to ${roleName}...`);

        for (const permName of permissionNames) {
          const permission = await Permission.findOne({ where: { name: permName } });
          if (permission) {
            await RolePermission.findOrCreate({
              where: {
                roleId: role.id,
                permissionId: permission.id
              },
              defaults: {
                roleId: role.id,
                permissionId: permission.id
              }
            });
          }
        }
      }
    }

    console.log('Permissions setup completed successfully!');
    console.log('Created permissions and assigned them to roles.');

  } catch (error) {
    console.error('Error setting up permissions:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the setup
setupPermissions();