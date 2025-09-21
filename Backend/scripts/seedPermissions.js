const { Permission, Role } = require('../models');
const sequelize = require('../config/db');

const seedPermissions = async () => {
  try {
    // Only use this if you're okay with losing data!
    await sequelize.sync({ force: true });
    
    // Define categories and permissions
    const permissions = [
      // Article permissions
      { name: 'article:create', description: 'Create articles' },
      { name: 'article:read', description: 'View articles' },
      { name: 'article:update', description: 'Edit articles' },
      { name: 'article:delete', description: 'Delete articles' },
      { name: 'article:publish', description: 'Publish articles' },
      { name: 'article:unpublish', description: 'Unpublish articles' },
      { name: 'article:review', description: 'Review articles' },
      
      // Media permissions
      { name: 'media:upload', description: 'Upload media files' },
      { name: 'media:read', description: 'View media' },
      { name: 'media:update', description: 'Edit media' },
      { name: 'media:delete', description: 'Delete media' },
      
      // Category permissions
      { name: 'category:create', description: 'Create categories' },
      { name: 'category:read', description: 'View categories' },
      { name: 'category:update', description: 'Edit categories' },
      { name: 'category:delete', description: 'Delete categories' },
      
      // User management
      { name: 'user:create', description: 'Create users' },
      { name: 'user:read', description: 'View users' },
      { name: 'user:update', description: 'Edit users' },
      { name: 'user:delete', description: 'Delete users' },
      
      // Role management
      { name: 'role:create', description: 'Create roles' },
      { name: 'role:read', description: 'View roles' },
      { name: 'role:update', description: 'Edit roles' },
      { name: 'role:delete', description: 'Delete roles' },
      
      // Team management
      { name: 'team:create', description: 'Create teams' },
      { name: 'team:read', description: 'View teams' },
      { name: 'team:update', description: 'Edit teams' },
      { name: 'team:delete', description: 'Delete teams' },
      { name: 'team:manage-members', description: 'Manage team members' },
      
      // Settings
      { name: 'settings:read', description: 'View settings' },
      { name: 'settings:update', description: 'Edit settings' },
      
      // Analytics
      { name: 'analytics:read', description: 'View analytics' },
      
      // Social media
      { name: 'social:create', description: 'Create social media content' },
      { name: 'social:read', description: 'View social media content' },
      { name: 'social:update', description: 'Edit social media content' },
      { name: 'social:delete', description: 'Delete social media content' }
    ];
    
    // Create permissions
    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });
    }
    
    console.log('Permissions seeded successfully!');
    
    // Check if roles already exist from initializeDb.js
    const existingRoles = await Role.findAll();
    if (existingRoles.length === 0) {
      console.log('No roles found. Please run "npm run init-db" first to create the role structure.');
      return;
    }
    
    console.log(`Found ${existingRoles.length} existing roles from initializeDb.js`);
    existingRoles.forEach(role => {
      console.log(`- ${role.name}: ${role.description}`);
    });
    
    // Get all permissions
    const allPermissions = await Permission.findAll();
    
    // Assign permissions based on role definitions from initializeDb.js
    for (const role of existingRoles) {
      console.log(`\nAssigning permissions to ${role.name}...`);
      
      let permissionsToAssign = [];
      
      // Define permissions for each role based on initializeDb.js structure
      switch (role.name) {
        case 'Master Admin':
          permissionsToAssign = allPermissions.map(p => p.name);
          break;
          
        case 'Webmaster':
          permissionsToAssign = [
            'article:read', 'article:update',
            'media:read', 'media:update',
            'category:read', 'category:update',
            'settings:read', 'settings:update',
            'user:read', 'analytics:read'
          ];
          break;
          
        case 'Content Admin':
          permissionsToAssign = [
            'article:create', 'article:read', 'article:update', 'article:delete', 'article:publish', 'article:unpublish',
            'media:create', 'media:read', 'media:update', 'media:delete',
            'category:create', 'category:read', 'category:update', 'category:delete',
            'user:read', 'analytics:read'
          ];
          break;
          
        case 'Editor-in-Chief':
          permissionsToAssign = [
            'article:create', 'article:read', 'article:update', 'article:publish', 'article:unpublish',
            'media:create', 'media:read', 'media:update',
            'category:read', 'category:update',
            'user:read', 'analytics:read'
          ];
          break;
          
        case 'Section Editors':
          permissionsToAssign = [
            'article:create', 'article:read', 'article:update', 'article:publish',
            'media:create', 'media:read', 'media:update',
            'category:read', 'category:update',
            'user:read', 'analytics:read'
          ];
          break;
          
        case 'Senior Writers':
          permissionsToAssign = [
            'article:create', 'article:read', 'article:update',
            'media:create', 'media:read', 'media:update',
            'category:read', 'analytics:read'
          ];
          break;
          
        case 'Staff Writers':
          permissionsToAssign = [
            'article:create', 'article:read', 'article:update',
            'media:create', 'media:read', 'media:update',
            'category:read', 'analytics:read'
          ];
          break;
          
        case 'Contributors':
          permissionsToAssign = [
            'article:create', 'article:read',
            'media:create', 'media:read',
            'category:read'
          ];
          break;
          
        case 'Reviewers':
          permissionsToAssign = [
            'article:read', 'article:update',
            'media:read',
            'category:read'
          ];
          break;
          
        case 'Social Media Manager':
          permissionsToAssign = [
            'article:read',
            'media:read',
            'social:create', 'social:read', 'social:update', 'social:delete',
            'analytics:read'
          ];
          break;
          
        default:
          permissionsToAssign = ['article:read', 'media:read'];
      }
      
      // Find the permissions to assign
      const rolePermissions = await Permission.findAll({
        where: { name: permissionsToAssign }
      });
      
      // Assign permissions to role
      for (const permission of rolePermissions) {
        try {
          await sequelize.query(`
            INSERT INTO "RolePermissions" ("roleId", "permissionId", "createdAt", "updatedAt")
            VALUES (
              '${role.id}', 
              '${permission.id}', 
              NOW(), 
              NOW()
            )
            ON CONFLICT ("roleId", "permissionId") DO NOTHING;
          `);
        } catch (error) {
          console.log(`Failed to assign ${permission.name} to ${role.name}: ${error.message}`);
        }
      }
      
      console.log(`Assigned ${rolePermissions.length} permissions to ${role.name}`);
    }
    
    console.log('\nPermission assignment completed successfully!');
    
  } catch (error) {
    console.error('Error seeding permissions:', error);
  }
};

seedPermissions();