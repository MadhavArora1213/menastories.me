const { Role, Permission, RolePermission } = require('./models');

async function checkSocialMediaPermissions() {
  try {
    // Find Social Media Manager role
    const role = await Role.findOne({
      where: { name: 'Social Media Manager' },
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });

    if (!role) {
      console.log('Social Media Manager role not found!');
      return;
    }

    console.log(`Role: ${role.name}`);
    console.log(`Access Level: ${role.accessLevel}`);
    console.log(`Is Admin: ${role.isAdmin}`);
    console.log(`Permissions (${role.permissions ? role.permissions.length : 0}):`);

    if (role.permissions && role.permissions.length > 0) {
      role.permissions.forEach(perm => {
        console.log(`  - ${perm.name}: ${perm.description}`);
      });
    } else {
      console.log('  No permissions assigned');
    }

    console.log(`\nRole Permissions JSON:`);
    console.log(JSON.stringify(role.rolePermissions, null, 2));

  } catch (error) {
    console.error('Error checking Social Media Manager permissions:', error);
  } finally {
    process.exit(0);
  }
}

checkSocialMediaPermissions();