const { Admin, Role, Permission, RolePermission } = require('./models');
const sequelize = require('./config/db');

async function checkAdminsAndRoles() {
  try {
    console.log('🔍 Checking current admin users and roles...\n');

    // Check existing roles
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    console.log(`📋 Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`  - ${role.name} (Level: ${role.accessLevel}, Admin: ${role.isAdmin})`);
      if (role.permissions && role.permissions.length > 0) {
        console.log(`    Permissions: ${role.permissions.map(p => p.name).join(', ')}`);
      }
    });

    console.log('\n👥 Checking admin users...');

    // Check existing admins
    const admins = await Admin.findAll({
      include: [{ model: Role, as: 'role', attributes: ['name', 'accessLevel'] }]
    });

    console.log(`\nFound ${admins.length} admin users:`);
    if (admins.length === 0) {
      console.log('❌ No admin users found!');
    } else {
      admins.forEach(admin => {
        console.log(`  - ${admin.name} (${admin.email}) - Role: ${admin.Role?.name || 'No role'}`);
      });
    }

    // Check permissions
    const permissions = await Permission.findAll();
    console.log(`\n🔐 Found ${permissions.length} permissions:`);
    permissions.forEach(perm => {
      console.log(`  - ${perm.name}: ${perm.description || 'No description'}`);
    });

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error checking admins and roles:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkAdminsAndRoles();