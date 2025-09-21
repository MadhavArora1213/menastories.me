const { Role, Permission, RolePermission, Admin } = require('./models');
const sequelize = require('./config/db');

async function ensurePermissionsPersist() {
  try {
    console.log('🔄 Ensuring permissions persist and are up to date...\n');

    // Define comprehensive permissions (same as setup-complete-rbac.js)
    const permissionsData = [
      // System permissions
      { name: 'system.full_access', resource: 'system', action: 'full_access', description: 'Complete system access' },
      { name: 'system.user_management', resource: 'system', action: 'user_management', description: 'Manage all users' },
      { name: 'system.role_management', resource: 'system', action: 'role_management', description: 'Manage roles and permissions' },
      { name: 'system.site_config', resource: 'system', action: 'site_config', description: 'Configure site settings' },

      // Content permissions
      { name: 'content.create', resource: 'content', action: 'create', description: 'Create content' },
      { name: 'content.edit', resource: 'content', action: 'edit', description: 'Edit any content' },
      { name: 'content.delete', resource: 'content', action: 'delete', description: 'Delete any content' },
      { name: 'content.publish', resource: 'content', action: 'publish', description: 'Publish content' },
      { name: 'content.moderate', resource: 'content', action: 'moderate', description: 'Moderate content' },
      { name: 'content.schedule', resource: 'content', action: 'schedule', description: 'Schedule content publication' },
      { name: 'content.approve', resource: 'content', action: 'approve', description: 'Approve content' },
      { name: 'content.quality_control', resource: 'content', action: 'quality_control', description: 'Quality control' },
      { name: 'content.feature_articles', resource: 'content', action: 'feature_articles', description: 'Feature articles' },
      { name: 'content.investigative', resource: 'content', action: 'investigative', description: 'Investigative reporting' },

      // Editorial permissions
      { name: 'editorial.strategy', resource: 'editorial', action: 'strategy', description: 'Editorial strategy' },
      { name: 'editorial.standards', resource: 'editorial', action: 'standards', description: 'Editorial standards' },
      { name: 'editorial.approvals', resource: 'editorial', action: 'approvals', description: 'Content approvals' },
      { name: 'editorial.section_strategy', resource: 'editorial', action: 'section_strategy', description: 'Section strategy' },
      { name: 'editorial.writer_coordination', resource: 'editorial', action: 'writer_coordination', description: 'Writer coordination' },

      // User permissions
      { name: 'users.view_content_users', resource: 'users', action: 'view_content_users', description: 'View content users' },

      // Analytics permissions
      { name: 'analytics.view', resource: 'analytics', action: 'view', description: 'View analytics' },
      { name: 'analytics.export', resource: 'analytics', action: 'export', description: 'Export analytics data' },

      // Security permissions
      { name: 'security.view_logs', resource: 'security', action: 'view_logs', description: 'View security logs' },
      { name: 'security.manage_security', resource: 'security', action: 'manage_security', description: 'Manage security settings' },

      // Technical permissions
      { name: 'technical.performance_monitoring', resource: 'technical', action: 'performance_monitoring', description: 'Monitor performance' },
      { name: 'technical.maintenance', resource: 'technical', action: 'maintenance', description: 'System maintenance' },
      { name: 'technical.backup_restore', resource: 'technical', action: 'backup_restore', description: 'Backup and restore' },

      // Social media permissions
      { name: 'social.manage_platforms', resource: 'social', action: 'manage_platforms', description: 'Manage social platforms' },
      { name: 'social.content_promotion', resource: 'social', action: 'content_promotion', description: 'Content promotion' },
      { name: 'social.engagement', resource: 'social', action: 'engagement', description: 'Social engagement' },
      { name: 'social.analytics', resource: 'social', action: 'analytics', description: 'Social analytics' },

      // File access permissions
      { name: 'files.dashboard.view', resource: 'files', action: 'dashboard.view', description: 'View dashboard' },
      { name: 'files.articles.view', resource: 'files', action: 'articles.view', description: 'View articles' },
      { name: 'files.articles.edit', resource: 'files', action: 'articles.edit', description: 'Edit articles' },
      { name: 'files.video_articles.view', resource: 'files', action: 'video_articles.view', description: 'View video articles' },
      { name: 'files.video_articles.edit', resource: 'files', action: 'video_articles.edit', description: 'Edit video articles' },
      { name: 'files.categories.view', resource: 'files', action: 'categories.view', description: 'View categories' },
      { name: 'files.categories.edit', resource: 'files', action: 'categories.edit', description: 'Edit categories' },
      { name: 'files.authors.view', resource: 'files', action: 'authors.view', description: 'View authors' },
      { name: 'files.authors.edit', resource: 'files', action: 'authors.edit', description: 'Edit authors' },
      { name: 'files.media.view', resource: 'files', action: 'media.view', description: 'View media' },
      { name: 'files.media.edit', resource: 'files', action: 'media.edit', description: 'Edit media' },
      { name: 'files.newsletter.view', resource: 'files', action: 'newsletter.view', description: 'View newsletter' },
      { name: 'files.newsletter.edit', resource: 'files', action: 'newsletter.edit', description: 'Edit newsletter' },
      { name: 'files.analytics.view', resource: 'files', action: 'analytics.view', description: 'View analytics' },
      { name: 'files.users.view', resource: 'files', action: 'users.view', description: 'View users' },
      { name: 'files.users.edit', resource: 'files', action: 'users.edit', description: 'Edit users' },
      { name: 'files.roles.view', resource: 'files', action: 'roles.view', description: 'View roles' },
      { name: 'files.roles.edit', resource: 'files', action: 'roles.edit', description: 'Edit roles' },
      { name: 'files.settings.view', resource: 'files', action: 'settings.view', description: 'View settings' },
      { name: 'files.settings.edit', resource: 'files', action: 'settings.edit', description: 'Edit settings' },
      { name: 'files.security.view', resource: 'files', action: 'security.view', description: 'View security' },
      { name: 'files.security.edit', resource: 'files', action: 'security.edit', description: 'Edit security' },
      { name: 'files.events.view', resource: 'files', action: 'events.view', description: 'View events' },
      { name: 'files.events.edit', resource: 'files', action: 'events.edit', description: 'Edit events' },
      { name: 'files.flipbooks.view', resource: 'files', action: 'flipbooks.view', description: 'View flipbooks' },
      { name: 'files.flipbooks.edit', resource: 'files', action: 'flipbooks.edit', description: 'Edit flipbooks' },
      { name: 'files.downloads.view', resource: 'files', action: 'downloads.view', description: 'View downloads' },
      { name: 'files.downloads.edit', resource: 'files', action: 'downloads.edit', description: 'Edit downloads' },
      { name: 'files.lists.view', resource: 'files', action: 'lists.view', description: 'View lists' },
      { name: 'files.lists.edit', resource: 'files', action: 'lists.edit', description: 'Edit lists' }
    ];

    console.log('📝 Ensuring all permissions exist...');
    const permissions = [];
    for (const permData of permissionsData) {
      const [permission, created] = await Permission.findOrCreate({
        where: { name: permData.name },
        defaults: permData
      });
      permissions.push(permission);
      if (created) console.log(`  ✅ Created: ${permData.name}`);
    }

    // Define role-permission mappings (same as setup-complete-rbac.js)
    const rolePermissionsMap = {
      'Master Admin': [
        'system.full_access', 'system.user_management', 'system.role_management', 'system.site_config',
        'content.create', 'content.edit', 'content.delete', 'content.publish', 'content.moderate', 'content.schedule', 'content.approve', 'content.quality_control', 'content.feature_articles', 'content.investigative',
        'editorial.strategy', 'editorial.standards', 'editorial.approvals', 'editorial.section_strategy', 'editorial.writer_coordination',
        'users.view_content_users',
        'analytics.view', 'analytics.export',
        'security.view_logs', 'security.manage_security',
        'technical.performance_monitoring', 'technical.maintenance', 'technical.backup_restore',
        'social.manage_platforms', 'social.content_promotion', 'social.engagement', 'social.analytics',
        'files.dashboard.view', 'files.articles.view', 'files.articles.edit', 'files.video_articles.view', 'files.video_articles.edit',
        'files.categories.view', 'files.categories.edit', 'files.authors.view', 'files.authors.edit', 'files.media.view', 'files.media.edit',
        'files.newsletter.view', 'files.newsletter.edit', 'files.analytics.view', 'files.users.view', 'files.users.edit',
        'files.roles.view', 'files.roles.edit', 'files.settings.view', 'files.settings.edit', 'files.security.view', 'files.security.edit',
        'files.events.view', 'files.events.edit', 'files.flipbooks.view', 'files.flipbooks.edit', 'files.downloads.view', 'files.downloads.edit',
        'files.lists.view', 'files.lists.edit'
      ],
      'Webmaster': [
        'system.site_config', 'technical.performance_monitoring', 'technical.maintenance', 'technical.backup_restore',
        'content.create', 'content.edit', 'content.delete', 'content.publish',
        'analytics.view', 'analytics.export', 'security.view_logs',
        'files.dashboard.view', 'files.articles.view', 'files.articles.edit', 'files.video_articles.view', 'files.video_articles.edit',
        'files.categories.view', 'files.categories.edit', 'files.authors.view', 'files.authors.edit', 'files.media.view', 'files.media.edit',
        'files.newsletter.view', 'files.newsletter.edit', 'files.analytics.view', 'files.settings.view', 'files.settings.edit',
        'files.security.view', 'files.events.view', 'files.events.edit', 'files.flipbooks.view', 'files.flipbooks.edit',
        'files.downloads.view', 'files.downloads.edit', 'files.lists.view', 'files.lists.edit'
      ],
      'Content Admin': [
        'content.create', 'content.edit', 'content.delete', 'content.publish', 'content.moderate', 'content.schedule',
        'analytics.view', 'users.view_content_users',
        'files.dashboard.view', 'files.articles.view', 'files.articles.edit', 'files.video_articles.view', 'files.video_articles.edit',
        'files.categories.view', 'files.categories.edit', 'files.authors.view', 'files.authors.edit', 'files.media.view', 'files.media.edit',
        'files.newsletter.view', 'files.newsletter.edit', 'files.analytics.view'
      ],
      'Editor-in-Chief': [
        'content.create', 'content.edit', 'content.delete', 'content.publish', 'content.approve', 'content.quality_control',
        'editorial.strategy', 'editorial.standards', 'editorial.approvals',
        'files.dashboard.view', 'files.articles.view', 'files.articles.edit', 'files.video_articles.view', 'files.video_articles.edit',
        'files.categories.view', 'files.authors.view', 'files.media.view', 'files.analytics.view'
      ],
      'Section Editors': [
        'content.create', 'content.edit', 'content.delete', 'content.publish', 'editorial.section_strategy', 'editorial.writer_coordination',
        'files.dashboard.view', 'files.articles.view', 'files.articles.edit', 'files.video_articles.view', 'files.video_articles.edit',
        'files.categories.view', 'files.authors.view', 'files.media.view', 'files.analytics.view'
      ],
      'Senior Writers': [
        'content.create', 'content.edit', 'content.publish', 'content.feature_articles', 'content.investigative',
        'files.articles.view', 'files.articles.edit', 'files.video_articles.view', 'files.video_articles.edit',
        'files.categories.view', 'files.authors.view', 'files.media.view'
      ],
      'Staff Writers': [
        'content.create', 'content.edit', 'content.publish',
        'files.articles.view', 'files.articles.edit', 'files.video_articles.view', 'files.video_articles.edit',
        'files.categories.view', 'files.authors.view', 'files.media.view'
      ],
      'Contributors': [
        'content.create',
        'files.articles.view', 'files.articles.edit', 'files.categories.view', 'files.authors.view', 'files.media.view'
      ],
      'Reviewers': [
        'content.approve',
        'files.articles.view', 'files.categories.view', 'files.authors.view'
      ],
      'Social Media Manager': [
        'social.manage_platforms', 'social.content_promotion', 'social.engagement', 'social.analytics',
        'files.analytics.view'
      ]
    };

    console.log('\n👥 Ensuring role-permission assignments...');

    // Ensure all roles exist and have correct permissions
    for (const [roleName, permissionNames] of Object.entries(rolePermissionsMap)) {
      console.log(`\n📋 Processing role: ${roleName}`);

      // Find or create role
      let role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        role = await Role.create({ name: roleName });
        console.log(`  ✅ Created role: ${roleName}`);
      } else {
        console.log(`  📝 Role exists: ${roleName}`);
      }

      // Get permission IDs for this role
      const rolePermissions = [];
      for (const permName of permissionNames) {
        const permission = permissions.find(p => p.name === permName);
        if (permission) {
          rolePermissions.push({
            roleId: role.id,
            permissionId: permission.id
          });
        }
      }

      // Remove existing permissions and add new ones (ensures clean state)
      await RolePermission.destroy({ where: { roleId: role.id } });
      if (rolePermissions.length > 0) {
        await RolePermission.bulkCreate(rolePermissions);
        console.log(`  ✅ Assigned ${rolePermissions.length} permissions to ${roleName}`);
      }
    }

    // Verify Social Media Manager specifically
    console.log('\n🔍 Verifying Social Media Manager permissions...');
    const socialRole = await Role.findOne({
      where: { name: 'Social Media Manager' },
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    if (socialRole) {
      console.log(`✅ Social Media Manager has ${socialRole.permissions.length} permissions:`);
      socialRole.permissions.forEach(perm => {
        console.log(`   - ${perm.name}: ${perm.description}`);
      });
    }

    console.log('\n🎉 Permission persistence check completed!');
    console.log('✅ All permissions are properly saved and assigned to roles.');
    console.log('💡 You can run this script anytime to ensure permissions persist.');

  } catch (error) {
    console.error('❌ Error ensuring permissions persist:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Run the script
ensurePermissionsPersist();