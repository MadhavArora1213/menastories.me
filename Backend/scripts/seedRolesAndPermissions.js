const { Role, Permission, RolePermission, User } = require('../models');
const bcrypt = require('bcryptjs');

const seedRolesAndPermissions = async () => {
  try {
    console.log('🌱 Starting roles and permissions seeding...');

    // Define permissions
    const permissions = [
      // System permissions
      { name: 'full_access', description: 'Full system access' },
      { name: 'user_management', description: 'Manage users' },
      { name: 'role_management', description: 'Manage roles and permissions' },
      { name: 'site_config', description: 'Site configuration' },
      { name: 'technical_access', description: 'Technical system access' },
      { name: 'performance_monitoring', description: 'Monitor system performance' },
      { name: 'maintenance', description: 'System maintenance' },

      // Content permissions
      { name: 'create', description: 'Create content' },
      { name: 'edit', description: 'Edit content' },
      { name: 'delete', description: 'Delete content' },
      { name: 'publish', description: 'Publish content' },
      { name: 'moderate', description: 'Moderate content' },
      { name: 'schedule', description: 'Schedule content' },
      { name: 'approve', description: 'Approve content' },
      { name: 'quality_control', description: 'Quality control' },
      { name: 'section_oversight', description: 'Section oversight' },
      { name: 'writer_coordination', description: 'Coordinate writers' },
      { name: 'feature_articles', description: 'Create feature articles' },
      { name: 'investigative', description: 'Create investigative pieces' },
      { name: 'daily_articles', description: 'Create daily articles' },
      { name: 'event_coverage', description: 'Cover events' },
      { name: 'submit', description: 'Submit content' },
      { name: 'limited_edit', description: 'Limited editing' },
      { name: 'review', description: 'Review content' },
      { name: 'fact_check', description: 'Fact check content' },

      // Editorial permissions
      { name: 'strategy', description: 'Editorial strategy' },
      { name: 'standards', description: 'Set editorial standards' },
      { name: 'approvals', description: 'Approve content' },
      { name: 'section_strategy', description: 'Section strategy' },

      // Analytics permissions
      { name: 'view', description: 'View analytics' },
      { name: 'export', description: 'Export analytics' },

      // Security permissions
      { name: 'view_logs', description: 'View security logs' },
      { name: 'manage_security', description: 'Manage security settings' },

      // Social media permissions
      { name: 'manage_platforms', description: 'Manage social media platforms' },
      { name: 'content_promotion', description: 'Promote content' },
      { name: 'engagement', description: 'Manage engagement' },
      { name: 'social_analytics', description: 'Social media analytics' }
    ];

    // Create permissions
    console.log('📝 Creating permissions...');
    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });
    }
    console.log('✅ Permissions created');

    // Define roles with their permissions
    const roles = [
      {
        name: 'Master Admin',
        description: 'Full system control, user management, site configuration',
        accessLevel: 10,
        isAdmin: true,
        canManageUsers: true,
        canManageRoles: true,
        permissions: [
          'full_access', 'user_management', 'role_management', 'site_config',
          'technical_access', 'performance_monitoring', 'maintenance',
          'create', 'edit', 'delete', 'publish', 'moderate', 'schedule', 'approve', 'quality_control',
          'strategy', 'standards', 'approvals',
          'view', 'export',
          'view_logs', 'manage_security'
        ]
      },
      {
        name: 'Webmaster',
        description: 'Technical management, site maintenance, performance optimization',
        accessLevel: 9,
        isAdmin: true,
        canManageUsers: true,
        canManageRoles: true,
        permissions: [
          'technical_access', 'performance_monitoring', 'maintenance',
          'create', 'edit', 'delete', 'publish',
          'view', 'export',
          'view_logs'
        ]
      },
      {
        name: 'Content Admin',
        description: 'Content oversight, publishing schedule, category management',
        accessLevel: 8,
        isAdmin: true,
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
          'create', 'edit', 'delete', 'publish', 'moderate', 'schedule',
          'view'
        ]
      },
      {
        name: 'Editor-in-Chief',
        description: 'Editorial decisions, content strategy, quality standards',
        accessLevel: 7,
        isAdmin: false,
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
          'create', 'edit', 'delete', 'publish', 'approve', 'quality_control',
          'strategy', 'standards', 'approvals'
        ]
      },
      {
        name: 'Section Editors',
        description: 'Category specialists, content curation, writer coordination',
        accessLevel: 6,
        isAdmin: false,
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
          'create', 'edit', 'delete', 'publish', 'section_oversight',
          'writer_coordination', 'section_strategy'
        ]
      },
      {
        name: 'Senior Writers',
        description: 'Feature articles, investigative pieces, major interviews',
        accessLevel: 5,
        isAdmin: false,
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
          'create', 'edit', 'publish', 'feature_articles', 'investigative'
        ]
      },
      {
        name: 'Staff Writers',
        description: 'Regular content creation, daily articles, event coverage',
        accessLevel: 4,
        isAdmin: false,
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
          'create', 'edit', 'publish', 'daily_articles', 'event_coverage'
        ]
      },
      {
        name: 'Contributors',
        description: 'Guest articles, specialized content, expert opinions',
        accessLevel: 3,
        isAdmin: false,
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
          'create', 'submit', 'limited_edit'
        ]
      },
      {
        name: 'Reviewers',
        description: 'Fact checking, content verification, quality assurance',
        accessLevel: 2,
        isAdmin: false,
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
          'review', 'fact_check', 'quality_assurance', 'approve'
        ]
      },
      {
        name: 'Social Media Manager',
        description: 'Digital presence, social engagement, content promotion',
        accessLevel: 1,
        isAdmin: false,
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
          'manage_platforms', 'content_promotion', 'engagement', 'social_analytics'
        ]
      }
    ];

    // Create roles and assign permissions
    console.log('👥 Creating roles and assigning permissions...');
    for (const roleData of roles) {
      const { permissions: rolePermissions, ...roleInfo } = roleData;

      // Create or update role
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleInfo
      });

      if (!created) {
        // Update existing role
        await role.update(roleInfo);
      }

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

      console.log(`✅ Role '${roleData.name}' created/updated with ${rolePermissions.length} permissions`);
    }

    // Create default Master Admin user if none exists
    console.log('👤 Creating default Master Admin user...');
    const masterAdminRole = await Role.findOne({ where: { name: 'Master Admin' } });

    if (masterAdminRole) {
      const existingAdmin = await User.findOne({
        include: [{
          model: Role,
          as: 'role',
          where: { name: 'Master Admin' }
        }]
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin123!', 12);

        const adminUser = await User.create({
          name: 'Master Administrator',
          email: 'admin@magazinewebsite.com',
          password: hashedPassword,
          roleId: masterAdminRole.id,
          isEmailVerified: true,
          isActive: true,
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          termsVersion: '1.0'
        });

        console.log('✅ Default Master Admin user created:');
        console.log('   Email: admin@magazinewebsite.com');
        console.log('   Password: Admin123!');
        console.log('   Please change the password after first login!');
      } else {
        console.log('ℹ️  Master Admin user already exists');
      }
    }

    console.log('🎉 Roles and permissions seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
    throw error;
  }
};

// Run the seeding function
if (require.main === module) {
  const sequelize = require('../config/db');

  sequelize.sync({ alter: false, force: false })
    .then(() => {
      console.log('Database connection established');
      return seedRolesAndPermissions();
    })
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedRolesAndPermissions;