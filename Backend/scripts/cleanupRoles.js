const sequelize = require('../config/db');
const Role = require('../models/Role');
const Admin = require('../models/Admin');

const cleanupRoles = async () => {
  try {
    console.log('Starting role cleanup...');

    // Get all existing roles
    const allRoles = await Role.findAll();
    console.log(`Found ${allRoles.length} existing roles:`);
    allRoles.forEach(role => {
      console.log(`- ${role.name}: ${role.description}`);
    });

    // Define the 10 roles we want to keep (from initializeDb.js)
    const requiredRoles = [
      {
        name: 'Master Admin',
        description: 'Full system control, user management, site configuration',
        permissions: {
          admin: ['create', 'read', 'update', 'delete'],
          content: ['create', 'read', 'update', 'delete', 'publish', 'unpublish'],
          settings: ['read', 'update'],
          users: ['create', 'read', 'update', 'delete']
        }
      },
      {
        name: 'Webmaster',
        description: 'Technical management, site maintenance, performance optimization',
        permissions: {
          content: ['read', 'update'],
          settings: ['read', 'update'],
          users: ['read']
        }
      },
      {
        name: 'Content Admin',
        description: 'Content oversight, publishing schedule, category management',
        permissions: {
          content: ['create', 'read', 'update', 'delete', 'publish', 'unpublish'],
          users: ['read']
        }
      },
      {
        name: 'Editor-in-Chief',
        description: 'Editorial decisions, content strategy, quality standards',
        permissions: {
          content: ['create', 'read', 'update', 'publish', 'unpublish'],
          users: ['read']
        }
      },
      {
        name: 'Section Editors',
        description: 'Category specialists, content curation, writer coordination',
        permissions: {
          content: ['create', 'read', 'update', 'publish'],
          users: ['read']
        }
      },
      {
        name: 'Senior Writers',
        description: 'Feature articles, investigative pieces, major interviews',
        permissions: {
          content: ['create', 'read', 'update']
        }
      },
      {
        name: 'Staff Writers',
        description: 'Regular content creation, daily articles, event coverage',
        permissions: {
          content: ['create', 'read', 'update']
        }
      },
      {
        name: 'Contributors',
        description: 'Guest articles, specialized content, expert opinions',
        permissions: {
          content: ['create', 'read']
        }
      },
      {
        name: 'Reviewers',
        description: 'Fact checking, content verification, quality assurance',
        permissions: {
          content: ['read', 'update']
        }
      },
      {
        name: 'Social Media Manager',
        description: 'Digital presence, social engagement, content promotion',
        permissions: {
          content: ['read'],
          social: ['create', 'read', 'update', 'delete']
        }
      }
    ];

    // Check if we have the correct roles
    const currentRoleNames = allRoles.map(role => role.name);
    const requiredRoleNames = requiredRoles.map(role => role.name);
    
    const missingRoles = requiredRoleNames.filter(name => !currentRoleNames.includes(name));
    const extraRoles = currentRoleNames.filter(name => !requiredRoleNames.includes(name));

    if (missingRoles.length === 0 && extraRoles.length === 0) {
      console.log('✅ All 10 required roles are present and correct!');
      console.log('No cleanup needed.');
      return;
    }

    if (missingRoles.length > 0) {
      console.log(`\nMissing roles: ${missingRoles.join(', ')}`);
    }

    if (extraRoles.length > 0) {
      console.log(`\nExtra roles found: ${extraRoles.join(', ')}`);
    }

    // Ask for confirmation before proceeding
    console.log('\n⚠️  WARNING: This will delete all existing roles and recreate them.');
    console.log('This action cannot be undone and will affect all admin users.');
    
    // In a real scenario, you might want to add a confirmation prompt here
    // For now, we'll proceed with the cleanup
    
    // Delete all existing roles
    console.log('\nDeleting all existing roles...');
    await Role.destroy({ where: {} });

    // Create the 10 required roles
    console.log('Creating 10 required roles...');
    const createdRoles = [];
    
    for (const roleData of requiredRoles) {
      const role = await Role.create(roleData);
      createdRoles.push(role);
      console.log(`Created role: ${role.name}`);
    }

    console.log('\n=== Role Cleanup Summary ===');
    console.log(`Deleted ${allRoles.length} old roles`);
    console.log(`Created ${createdRoles.length} new roles:`);
    createdRoles.forEach(role => {
      console.log(`- ${role.name}: ${role.description}`);
    });

    console.log('\nCleanup completed successfully!');
    console.log('Next steps:');
    console.log('1. Run "npm run seed-permissions" to assign permissions');
    console.log('2. Run "npm run seed-admins" to create admin users');

  } catch (error) {
    console.error('Error during role cleanup:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  cleanupRoles();
}

module.exports = cleanupRoles;
