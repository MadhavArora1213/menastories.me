const { Role, Permission, RolePermission } = require('./models');

async function testRolesAPI() {
  try {
    console.log('🧪 Testing Roles API transformation...\n');

    // Simulate the getAllRoles API call
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    console.log(`Found ${roles.length} roles\n`);

    // Transform like the API does
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await require('./models').Admin.count({ where: { roleId: role.id } });

        // Transform permissions array to rolePermissions object format expected by frontend
        const rolePermissions = {};
        if (role.permissions && role.permissions.length > 0) {
          role.permissions.forEach(permission => {
            const [resource, action] = permission.name.split('.');
            if (resource && action) {
              if (!rolePermissions[resource]) {
                rolePermissions[resource] = [];
              }
              rolePermissions[resource].push(action);
            }
          });
        }

        return {
          id: role.id,
          name: role.name,
          description: role.description,
          accessLevel: role.accessLevel,
          isAdmin: role.isAdmin,
          userCount: userCount || 0,
          rolePermissions: rolePermissions
        };
      })
    );

    // Show Social Media Manager specifically
    const socialRole = rolesWithCounts.find(r => r.name === 'Social Media Manager');
    if (socialRole) {
      console.log('✅ Social Media Manager role data:');
      console.log(`   Name: ${socialRole.name}`);
      console.log(`   Access Level: ${socialRole.accessLevel}`);
      console.log(`   User Count: ${socialRole.userCount}`);
      console.log(`   Permissions Count: ${Object.keys(socialRole.rolePermissions).length}`);
      console.log('   Permissions:', socialRole.rolePermissions);
    }

    console.log('\n✅ Roles API test completed!');

  } catch (error) {
    console.error('❌ Error testing roles API:', error);
  } finally {
    process.exit(0);
  }
}

testRolesAPI();