const { Admin, Role, Permission, RolePermission, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

const adminRoles = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Master Admin',
    description: 'Full system control, user management, site configuration (Complete administrative access)',
    level: 10,
    permissions: [
      'system.full_access',
      'users.manage',
      'users.create',
      'users.edit',
      'users.delete',
      'users.view',
      'roles.manage',
      'roles.create',
      'roles.edit',
      'roles.delete',
      'roles.assign',
      'content.manage',
      'content.create',
      'content.edit',
      'content.delete',
      'content.publish',
      'content.unpublish',
      'categories.manage',
      'categories.create',
      'categories.edit',
      'categories.delete',
      'tags.manage',
      'tags.create',
      'tags.edit',
      'tags.delete',
      'newsletter.manage',
      'newsletter.send',
      'newsletter.create',
      'newsletter.edit',
      'newsletter.delete',
      'analytics.view',
      'analytics.export',
      'security.view',
      'security.manage',
      'settings.manage',
      'backup.create',
      'backup.restore',
      'logs.view'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Webmaster',
    description: 'Technical management, site maintenance, performance optimization (Technical system access)',
    level: 9,
    permissions: [
      'system.technical_access',
      'content.manage',
      'content.create',
      'content.edit',
      'content.publish',
      'categories.manage',
      'categories.create',
      'categories.edit',
      'tags.manage',
      'tags.create',
      'tags.edit',
      'analytics.view',
      'security.view',
      'settings.manage',
      'backup.create',
      'logs.view'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Content Admin',
    description: 'Content oversight, publishing schedule, category management (Content management system control)',
    level: 8,
    permissions: [
      'content.manage',
      'content.create',
      'content.edit',
      'content.publish',
      'content.unpublish',
      'categories.manage',
      'categories.create',
      'categories.edit',
      'tags.manage',
      'tags.create',
      'tags.edit',
      'newsletter.manage',
      'newsletter.send',
      'analytics.view'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Editor-in-Chief',
    description: 'Editorial decisions, content strategy, quality standards (Editorial authority and approval rights)',
    level: 7,
    permissions: [
      'content.manage',
      'content.edit',
      'content.publish',
      'content.unpublish',
      'content.approve',
      'categories.view',
      'tags.view',
      'newsletter.manage',
      'newsletter.send',
      'analytics.view'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Section Editors',
    description: 'Category specialists, content curation, writer coordination (Section-specific editorial control)',
    level: 6,
    permissions: [
      'content.edit',
      'content.publish',
      'content.approve',
      'categories.view',
      'tags.view',
      'newsletter.view'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Senior Writers',
    description: 'Feature articles, investigative pieces, major interviews (Advanced content creation privileges)',
    level: 5,
    permissions: [
      'content.create',
      'content.edit',
      'content.submit',
      'categories.view',
      'tags.view'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Staff Writers',
    description: 'Regular content creation, daily articles, event coverage (Standard content creation access)',
    level: 4,
    permissions: [
      'content.create',
      'content.edit',
      'content.submit',
      'categories.view',
      'tags.view'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Contributors',
    description: 'Guest articles, specialized content, expert opinions (Limited contributor access)',
    level: 3,
    permissions: [
      'content.create',
      'content.submit',
      'categories.view',
      'tags.view'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Reviewers',
    description: 'Fact checking, content verification, quality assurance (Review and approval capabilities)',
    level: 2,
    permissions: [
      'content.view',
      'content.review',
      'content.approve',
      'categories.view',
      'tags.view'
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Social Media Manager',
    description: 'Digital presence, social engagement, content promotion (Social media platform management)',
    level: 1,
    permissions: [
      'content.view',
      'social.manage',
      'social.post',
      'analytics.view'
    ]
  }
];

const permissions = [
  // System permissions
  { id: '550e8400-e29b-41d4-a716-446655440100', name: 'system.full_access', description: 'Full system access' },
  { id: '550e8400-e29b-41d4-a716-446655440101', name: 'system.technical_access', description: 'Technical system access' },

  // User management permissions
  { id: '550e8400-e29b-41d4-a716-446655440102', name: 'users.manage', description: 'Manage users' },
  { id: '550e8400-e29b-41d4-a716-446655440103', name: 'users.create', description: 'Create users' },
  { id: '550e8400-e29b-41d4-a716-446655440104', name: 'users.edit', description: 'Edit users' },
  { id: '550e8400-e29b-41d4-a716-446655440105', name: 'users.delete', description: 'Delete users' },
  { id: '550e8400-e29b-41d4-a716-446655440106', name: 'users.view', description: 'View users' },

  // Role management permissions
  { id: '550e8400-e29b-41d4-a716-446655440107', name: 'roles.manage', description: 'Manage roles' },
  { id: '550e8400-e29b-41d4-a716-446655440108', name: 'roles.create', description: 'Create roles' },
  { id: '550e8400-e29b-41d4-a716-446655440109', name: 'roles.edit', description: 'Edit roles' },
  { id: '550e8400-e29b-41d4-a716-446655440110', name: 'roles.delete', description: 'Delete roles' },
  { id: '550e8400-e29b-41d4-a716-446655440111', name: 'roles.assign', description: 'Assign roles' },

  // Content management permissions
  { id: '550e8400-e29b-41d4-a716-446655440112', name: 'content.manage', description: 'Manage content' },
  { id: '550e8400-e29b-41d4-a716-446655440113', name: 'content.create', description: 'Create content' },
  { id: '550e8400-e29b-41d4-a716-446655440114', name: 'content.edit', description: 'Edit content' },
  { id: '550e8400-e29b-41d4-a716-446655440115', name: 'content.delete', description: 'Delete content' },
  { id: '550e8400-e29b-41d4-a716-446655440116', name: 'content.publish', description: 'Publish content' },
  { id: '550e8400-e29b-41d4-a716-446655440117', name: 'content.unpublish', description: 'Unpublish content' },
  { id: '550e8400-e29b-41d4-a716-446655440118', name: 'content.view', description: 'View content' },
  { id: '550e8400-e29b-41d4-a716-446655440119', name: 'content.submit', description: 'Submit content' },
  { id: '550e8400-e29b-41d4-a716-446655440120', name: 'content.approve', description: 'Approve content' },
  { id: '550e8400-e29b-41d4-a716-446655440121', name: 'content.review', description: 'Review content' },

  // Category management permissions
  { id: '550e8400-e29b-41d4-a716-446655440122', name: 'categories.manage', description: 'Manage categories' },
  { id: '550e8400-e29b-41d4-a716-446655440123', name: 'categories.create', description: 'Create categories' },
  { id: '550e8400-e29b-41d4-a716-446655440124', name: 'categories.edit', description: 'Edit categories' },
  { id: '550e8400-e29b-41d4-a716-446655440125', name: 'categories.delete', description: 'Delete categories' },
  { id: '550e8400-e29b-41d4-a716-446655440126', name: 'categories.view', description: 'View categories' },

  // Tag management permissions
  { id: '550e8400-e29b-41d4-a716-446655440127', name: 'tags.manage', description: 'Manage tags' },
  { id: '550e8400-e29b-41d4-a716-446655440128', name: 'tags.create', description: 'Create tags' },
  { id: '550e8400-e29b-41d4-a716-446655440129', name: 'tags.edit', description: 'Edit tags' },
  { id: '550e8400-e29b-41d4-a716-446655440130', name: 'tags.delete', description: 'Delete tags' },
  { id: '550e8400-e29b-41d4-a716-446655440131', name: 'tags.view', description: 'View tags' },

  // Newsletter permissions
  { id: '550e8400-e29b-41d4-a716-446655440132', name: 'newsletter.manage', description: 'Manage newsletter' },
  { id: '550e8400-e29b-41d4-a716-446655440133', name: 'newsletter.send', description: 'Send newsletter' },
  { id: '550e8400-e29b-41d4-a716-446655440134', name: 'newsletter.create', description: 'Create newsletter' },
  { id: '550e8400-e29b-41d4-a716-446655440135', name: 'newsletter.edit', description: 'Edit newsletter' },
  { id: '550e8400-e29b-41d4-a716-446655440136', name: 'newsletter.delete', description: 'Delete newsletter' },
  { id: '550e8400-e29b-41d4-a716-446655440137', name: 'newsletter.view', description: 'View newsletter' },

  // Analytics permissions
  { id: '550e8400-e29b-41d4-a716-446655440138', name: 'analytics.view', description: 'View analytics' },
  { id: '550e8400-e29b-41d4-a716-446655440139', name: 'analytics.export', description: 'Export analytics' },

  // Security permissions
  { id: '550e8400-e29b-41d4-a716-446655440140', name: 'security.view', description: 'View security logs' },
  { id: '550e8400-e29b-41d4-a716-446655440141', name: 'security.manage', description: 'Manage security settings' },

  // Settings permissions
  { id: '550e8400-e29b-41d4-a716-446655440142', name: 'settings.manage', description: 'Manage system settings' },

  // Backup permissions
  { id: '550e8400-e29b-41d4-a716-446655440143', name: 'backup.create', description: 'Create backups' },
  { id: '550e8400-e29b-41d4-a716-446655440144', name: 'backup.restore', description: 'Restore backups' },

  // Logs permissions
  { id: '550e8400-e29b-41d4-a716-446655440145', name: 'logs.view', description: 'View system logs' },

  // Social media permissions
  { id: '550e8400-e29b-41d4-a716-446655440146', name: 'social.manage', description: 'Manage social media' },
  { id: '550e8400-e29b-41d4-a716-446655440147', name: 'social.post', description: 'Post to social media' }
];

async function seedAdminRoles() {
  try {
    console.log('🌱 Starting admin roles and permissions seeding...');

    // Create permissions first
    console.log('📝 Creating permissions...');
    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { id: permission.id },
        defaults: permission
      });
    }
    console.log(`✅ Created ${permissions.length} permissions`);

    // Create roles
    console.log('👥 Creating admin roles...');
    for (const roleData of adminRoles) {
      const { permissions: rolePermissions, ...roleInfo } = roleData;

      const [role, created] = await Role.findOrCreate({
        where: { id: roleInfo.id },
        defaults: roleInfo
      });

      if (created) {
        console.log(`✅ Created role: ${role.name}`);

        // Assign permissions to role
        for (const permissionName of rolePermissions) {
          const permission = await Permission.findOne({ where: { name: permissionName } });
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
        console.log(`🔗 Assigned ${rolePermissions.length} permissions to ${role.name}`);
      }
    }

    // Create default Master Admin user
    console.log('👤 Creating default Master Admin user...');
    const masterAdminRole = await Role.findOne({ where: { name: 'Master Admin' } });

    if (masterAdminRole) {
      const defaultAdmin = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@magazinewebsite.com',
        password: 'Admin123!',
        name: 'Master Administrator',
        roleId: masterAdminRole.id,
        isActive: true,
        department: 'System Administration'
      };

      const [admin, adminCreated] = await Admin.findOrCreate({
        where: { email: defaultAdmin.email },
        defaults: defaultAdmin
      });

      if (adminCreated) {
        // Hash the password
        admin.password = await bcrypt.hash(defaultAdmin.password, 12);
        await admin.save();
        console.log('✅ Created default Master Admin user');
        console.log('📧 Email: admin@magazinewebsite.com');
        console.log('🔑 Password: Admin123!');
        console.log('⚠️  IMPORTANT: Change the default password after first login!');
      } else {
        console.log('ℹ️  Default admin user already exists');
      }
    }

    console.log('🎉 Admin roles and permissions seeding completed successfully!');
    console.log('\n📋 Available Admin Roles:');
    adminRoles.forEach(role => {
      console.log(`   ${role.level}. ${role.name} - ${role.description}`);
    });

  } catch (error) {
    console.error('❌ Error seeding admin roles:', error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  sequelize.sync({ alter: true, force: false }).then(() => {
    console.log('✅ Database tables synchronized');
    return seedAdminRoles();
  }).then(() => {
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { seedAdminRoles };