const { Role } = require('../models');

const roles = [
  {
    name: 'Master Admin',
    description: 'Full system control, user management, site configuration',
    accessLevel: 10,
    isAdmin: true,
    canManageUsers: true,
    canManageRoles: true,
    rolePermissions: {
      system: ['full_access', 'user_management', 'role_management', 'site_configuration'],
      content: ['create', 'read', 'update', 'delete', 'publish', 'unpublish'],
      security: ['view_logs', 'manage_security', 'backup_restore'],
      analytics: ['view_all', 'export_data']
    }
  },
  {
    name: 'Webmaster',
    description: 'Technical management, site maintenance, performance optimization',
    accessLevel: 9,
    isAdmin: true,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {
      system: ['site_maintenance', 'performance_monitoring', 'technical_support'],
      content: ['create', 'read', 'update', 'delete', 'publish'],
      security: ['view_logs', 'manage_security'],
      analytics: ['view_all', 'export_data']
    }
  },
  {
    name: 'Content Admin',
    description: 'Content oversight, publishing schedule, category management',
    accessLevel: 8,
    isAdmin: true,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {
      content: ['create', 'read', 'update', 'delete', 'publish', 'unpublish', 'manage_categories'],
      analytics: ['view_content', 'export_data']
    }
  },
  {
    name: 'Editor-in-Chief',
    description: 'Editorial decisions, content strategy, quality standards',
    accessLevel: 7,
    isAdmin: false,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {
      content: ['create', 'read', 'update', 'delete', 'publish', 'unpublish', 'editorial_approval'],
      analytics: ['view_content', 'export_data']
    }
  },
  {
    name: 'Section Editors',
    description: 'Category specialists, content curation, writer coordination',
    accessLevel: 6,
    isAdmin: false,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {
      content: ['create', 'read', 'update', 'delete', 'publish', 'section_management'],
      analytics: ['view_section', 'export_data']
    }
  },
  {
    name: 'Senior Writers',
    description: 'Feature articles, investigative pieces, major interviews',
    accessLevel: 5,
    isAdmin: false,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {
      content: ['create', 'read', 'update', 'delete', 'publish'],
      analytics: ['view_own', 'export_data']
    }
  },
  {
    name: 'Staff Writers',
    description: 'Regular content creation, daily articles, event coverage',
    accessLevel: 4,
    isAdmin: false,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {
      content: ['create', 'read', 'update', 'delete'],
      analytics: ['view_own']
    }
  },
  {
    name: 'Contributors',
    description: 'Guest articles, specialized content, expert opinions',
    accessLevel: 3,
    isAdmin: false,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {
      content: ['create', 'read', 'update'],
      analytics: ['view_own']
    }
  },
  {
    name: 'Reviewers',
    description: 'Fact checking, content verification, quality assurance',
    accessLevel: 2,
    isAdmin: false,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {
      content: ['read', 'review', 'comment'],
      analytics: ['view_assigned']
    }
  },
  {
    name: 'Social Media Manager',
    description: 'Digital presence, social engagement, content promotion',
    accessLevel: 3,
    isAdmin: false,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {
      content: ['read', 'social_publish', 'social_analytics'],
      social: ['manage_accounts', 'create_posts', 'engage_audience'],
      analytics: ['view_social', 'export_data']
    }
  }
];

const seedAdminRoles = async () => {
  try {
    console.log('🚀 Starting admin roles seeding...');

    let rolesCreated = 0;
    let rolesUpdated = 0;

    for (const roleData of roles) {
      try {
        const [role, created] = await Role.findOrCreate({
          where: { name: roleData.name },
          defaults: roleData
        });

        if (created) {
          console.log(`   ✅ Created role: ${roleData.name}`);
          rolesCreated++;
        } else {
          // Update existing role with new permissions
          await role.update(roleData);
          console.log(`   🔄 Updated role: ${roleData.name}`);
          rolesUpdated++;
        }
      } catch (roleError) {
        console.log(`   ❌ Error with role "${roleData.name}": ${roleError.message}`);
      }
    }

    console.log(`\n🎉 Role seeding completed!`);
    console.log(`📊 Roles created: ${rolesCreated}`);
    console.log(`📊 Roles updated: ${rolesUpdated}`);

    // Verify final count
    const allRoles = await Role.findAll({
      attributes: ['id', 'name', 'description', 'accessLevel', 'isAdmin']
    });

    console.log(`📈 Total roles in database: ${allRoles.length}`);

    console.log(`\n📋 All roles:`);
    allRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.name} (Level: ${role.accessLevel}, Admin: ${role.isAdmin})`);
      console.log(`      ${role.description}`);
    });

  } catch (error) {
    console.error('❌ Error seeding admin roles:', error);
    throw error;
  }
};

// Run the seeding
seedAdminRoles()
  .then(() => {
    console.log('\n✅ Admin roles seeding process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Admin roles seeding failed:', error);
    process.exit(1);
  });