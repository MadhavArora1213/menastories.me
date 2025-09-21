const { Role, Permission, RolePermission } = require('./models');

async function checkRolePermissionsInDB() {
  try {
    console.log('🔍 Checking Role-Permission associations in database...\n');

    // Get all roles with their permissions
    const roles = await Role.findAll({
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    console.log(`Found ${roles.length} roles in database:\n`);

    for (const role of roles) {
      console.log(`📋 Role: ${role.name} (Level: ${role.accessLevel})`);
      console.log(`   Permissions: ${role.permissions ? role.permissions.length : 0}`);

      if (role.permissions && role.permissions.length > 0) {
        role.permissions.forEach(perm => {
          console.log(`     - ${perm.name}: ${perm.description}`);
        });
      } else {
        console.log('     ❌ No permissions assigned');
      }
      console.log('');
    }

    // Check RolePermission table directly
    console.log('🔗 Checking RolePermission junction table:');
    const rolePermissions = await RolePermission.findAll();

    console.log(`Found ${rolePermissions.length} role-permission associations in junction table\n`);

    // Get role and permission names for display
    for (const rp of rolePermissions.slice(0, 10)) { // Show first 10
      const role = await Role.findByPk(rp.roleId, { attributes: ['name'] });
      const permission = await Permission.findByPk(rp.permissionId, { attributes: ['name'] });
      if (role && permission) {
        console.log(`   ${role.name} → ${permission.name}`);
      }
    }

    if (rolePermissions.length > 10) {
      console.log(`   ... and ${rolePermissions.length - 10} more associations`);
    }

    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error checking role permissions in database:', error);
  } finally {
    process.exit(0);
  }
}

checkRolePermissionsInDB();