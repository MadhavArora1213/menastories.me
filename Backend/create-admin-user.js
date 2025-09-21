const { Admin, Role } = require('./models');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Check if admin role exists, if not create it
    let adminRole = await Role.findOne({ where: { name: 'Master Admin' } });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Master Admin',
        description: 'Full system access',
        accessLevel: 100,
        isAdmin: true,
        canManageUsers: true,
        canManageRoles: true,
        rolePermissions: ['*']
      });
      console.log('Created Master Admin role');
    }

    // Check if admin user exists
    let admin = await Admin.findOne({ where: { email: 'masteradmin1@magazine.com' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('MasterAdmin@123', 10);
      admin = await Admin.create({
        email: 'masteradmin1@magazine.com',
        password: hashedPassword,
        name: 'Master Admin',
        roleId: adminRole.id,
        isActive: true
      });
      console.log('Created admin user: masteradmin1@magazine.com / MasterAdmin@123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Admin user setup complete!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();