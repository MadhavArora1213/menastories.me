const { Role, Permission, RolePermission } = require('../models');
const sequelize = require('../config/db');

// Define the 10 user roles as specified in requirements
const roles = [
  {
    name: 'Master Admin',
    description: 'Full system access with all administrative privileges'
  },
  {
    name: 'Webmaster',
    description: 'Technical administration and website management'
  },
  {
    name: 'Content Admin',
    description: 'Content management and editorial oversight'
  },
  {
    name: 'Editor-in-Chief',
    description: 'Editorial leadership and content strategy'
  },
  {
    name: 'Section Editor',
    description: 'Management of specific content sections'
  },
  {
    name: 'Senior Writer',
    description: 'Experienced content creator with publishing privileges'
  },
  {
    name: 'Staff Writer',
    description: 'Regular content contributor with submission privileges'
  },
  {
    name: 'Contributor',
    description: 'Guest contributor with limited submission privileges'
  },
  {
    name: 'Reviewer',
    description: 'Content review and approval specialist'
  },
  {
    name: 'Social Media Manager',
    description: 'Social media content and engagement management'
  }
];

// Define comprehensive permissions
const permissions = [
  // User Management
  { name: 'user.create', description: 'Create new users' },
  { name: 'user.read', description: 'View user information' },
  { name: 'user.update', description: 'Update user information' },
  { name: 'user.delete', description: 'Delete users' },
  { name: 'user.manage_roles', description: 'Assign and modify user roles' },
  { name: 'user.view_analytics', description: 'View user analytics and reports' },

  // Content Management
  { name: 'content.create', description: 'Create new content' },
  { name: 'content.read', description: 'View content' },
  { name: 'content.update', description: 'Edit existing content' },
  { name: 'content.delete', description: 'Delete content' },
  { name: 'content.publish', description: 'Publish content' },
  { name: 'content.unpublish', description: 'Unpublish content' },
  { name: 'content.schedule', description: 'Schedule content publication' },
  { name: 'content.approve', description: 'Approve content for publication' },
  { name: 'content.reject', description: 'Reject content submissions' },
  { name: 'content.bulk_operations', description: 'Perform bulk content operations' },

  // Category Management
  { name: 'category.create', description: 'Create new categories' },
  { name: 'category.read', description: 'View categories' },
  { name: 'category.update', description: 'Update categories' },
  { name: 'category.delete', description: 'Delete categories' },
  { name: 'category.manage', description: 'Full category management' },

  // Tag Management
  { name: 'tag.create', description: 'Create new tags' },
  { name: 'tag.read', description: 'View tags' },
  { name: 'tag.update', description: 'Update tags' },
  { name: 'tag.delete', description: 'Delete tags' },
  { name: 'tag.manage', description: 'Full tag management' },

  // Media Management
  { name: 'media.upload', description: 'Upload media files' },
  { name: 'media.read', description: 'View media library' },
  { name: 'media.update', description: 'Update media information' },
  { name: 'media.delete', description: 'Delete media files' },
  { name: 'media.organize', description: 'Organize media into folders' },

  // Comments Management
  { name: 'comment.moderate', description: 'Moderate user comments' },
  { name: 'comment.delete', description: 'Delete comments' },
  { name: 'comment.approve', description: 'Approve comments' },

  // Analytics & Reports
  { name: 'analytics.view', description: 'View analytics and reports' },
  { name: 'analytics.export', description: 'Export analytics data' },

  // System Administration
  { name: 'system.configure', description: 'Configure system settings' },
  { name: 'system.backup', description: 'Create system backups' },
  { name: 'system.maintenance', description: 'Perform system maintenance' },
  { name: 'system.security', description: 'Manage security settings' },

  // Newsletter Management
  { name: 'newsletter.create', description: 'Create newsletters' },
  { name: 'newsletter.send', description: 'Send newsletters' },
  { name: 'newsletter.manage_subscribers', description: 'Manage newsletter subscribers' },

  // Social Media Management
  { name: 'social.post', description: 'Post to social media' },
  { name: 'social.schedule', description: 'Schedule social media posts' },
  { name: 'social.analytics', description: 'View social media analytics' },
  { name: 'social.manage_accounts', description: 'Manage social media accounts' }
];

// Define role-permission mappings
const rolePermissions = {
  'Master Admin': [
    // Full access to everything
    'user.create', 'user.read', 'user.update', 'user.delete', 'user.manage_roles', 'user.view_analytics',
    'content.create', 'content.read', 'content.update', 'content.delete', 'content.publish', 'content.unpublish', 
    'content.schedule', 'content.approve', 'content.reject', 'content.bulk_operations',
    'category.create', 'category.read', 'category.update', 'category.delete', 'category.manage',
    'tag.create', 'tag.read', 'tag.update', 'tag.delete', 'tag.manage',
    'media.upload', 'media.read', 'media.update', 'media.delete', 'media.organize',
    'comment.moderate', 'comment.delete', 'comment.approve',
    'analytics.view', 'analytics.export',
    'system.configure', 'system.backup', 'system.maintenance', 'system.security',
    'newsletter.create', 'newsletter.send', 'newsletter.manage_subscribers',
    'social.post', 'social.schedule', 'social.analytics', 'social.manage_accounts'
  ],

  'Webmaster': [
    'user.read', 'user.view_analytics',
    'content.read', 'content.update', 'content.publish', 'content.unpublish', 'content.bulk_operations',
    'category.create', 'category.read', 'category.update', 'category.delete', 'category.manage',
    'tag.create', 'tag.read', 'tag.update', 'tag.delete', 'tag.manage',
    'media.upload', 'media.read', 'media.update', 'media.delete', 'media.organize',
    'analytics.view', 'analytics.export',
    'system.configure', 'system.backup', 'system.maintenance', 'system.security'
  ],

  'Content Admin': [
    'user.read',
    'content.create', 'content.read', 'content.update', 'content.delete', 'content.publish', 
    'content.unpublish', 'content.schedule', 'content.approve', 'content.reject', 'content.bulk_operations',
    'category.create', 'category.read', 'category.update', 'category.manage',
    'tag.create', 'tag.read', 'tag.update', 'tag.manage',
    'media.upload', 'media.read', 'media.update', 'media.organize',
    'comment.moderate', 'comment.delete', 'comment.approve',
    'analytics.view'
  ],

  'Editor-in-Chief': [
    'content.create', 'content.read', 'content.update', 'content.publish', 'content.unpublish',
    'content.schedule', 'content.approve', 'content.reject', 'content.bulk_operations',
    'category.read', 'category.update',
    'tag.create', 'tag.read', 'tag.update',
    'media.upload', 'media.read', 'media.organize',
    'comment.moderate', 'comment.approve',
    'analytics.view',
    'newsletter.create', 'newsletter.send'
  ],

  'Section Editor': [
    'content.create', 'content.read', 'content.update', 'content.publish', 'content.schedule',
    'content.approve', 'content.reject',
    'category.read', 'category.update',
    'tag.create', 'tag.read', 'tag.update',
    'media.upload', 'media.read', 'media.organize',
    'comment.moderate', 'comment.approve',
    'analytics.view'
  ],

  'Senior Writer': [
    'content.create', 'content.read', 'content.update', 'content.publish', 'content.schedule',
    'tag.create', 'tag.read',
    'media.upload', 'media.read',
    'comment.moderate'
  ],

  'Staff Writer': [
    'content.create', 'content.read', 'content.update',
    'tag.read',
    'media.upload', 'media.read'
  ],

  'Contributor': [
    'content.create', 'content.read',
    'media.upload', 'media.read'
  ],

  'Reviewer': [
    'content.read', 'content.approve', 'content.reject',
    'comment.moderate', 'comment.approve'
  ],

  'Social Media Manager': [
    'content.read',
    'social.post', 'social.schedule', 'social.analytics', 'social.manage_accounts',
    'media.read', 'media.upload'
  ]
};

async function initializeRolesAndPermissions() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🚀 Starting roles and permissions initialization...');

    // Create permissions first
    console.log('Creating permissions...');
    const createdPermissions = {};
    for (const permission of permissions) {
      const [perm, created] = await Permission.findOrCreate({
        where: { name: permission.name },
        defaults: permission,
        transaction
      });
      createdPermissions[permission.name] = perm;
      if (created) {
        console.log(`✅ Created permission: ${permission.name}`);
      } else {
        console.log(`⏭️  Permission already exists: ${permission.name}`);
      }
    }

    // Create roles
    console.log('Creating roles...');
    const createdRoles = {};
    for (const role of roles) {
      const [roleInstance, created] = await Role.findOrCreate({
        where: { name: role.name },
        defaults: role,
        transaction
      });
      createdRoles[role.name] = roleInstance;
      if (created) {
        console.log(`✅ Created role: ${role.name}`);
      } else {
        console.log(`⏭️  Role already exists: ${role.name}`);
      }
    }

    // Assign permissions to roles
    console.log('Assigning permissions to roles...');
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = createdRoles[roleName];
      if (!role) {
        console.log(`❌ Role not found: ${roleName}`);
        continue;
      }

      // Clear existing permissions for this role
      await RolePermission.destroy({
        where: { roleId: role.id },
        transaction
      });

      // Add new permissions
      for (const permissionName of permissionNames) {
        const permission = createdPermissions[permissionName];
        if (permission) {
          await RolePermission.create({
            roleId: role.id,
            permissionId: permission.id
          }, { transaction });
        }
      }
      
      console.log(`✅ Assigned ${permissionNames.length} permissions to ${roleName}`);
    }

    await transaction.commit();
    console.log('🎉 Roles and permissions initialization completed successfully!');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`• Created/Updated ${roles.length} roles`);
    console.log(`• Created/Updated ${permissions.length} permissions`);
    console.log('• Assigned permissions to roles based on access levels');

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error during roles and permissions initialization:', error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { initializeRolesAndPermissions, roles, permissions, rolePermissions };

// Run if called directly
if (require.main === module) {
  initializeRolesAndPermissions()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}