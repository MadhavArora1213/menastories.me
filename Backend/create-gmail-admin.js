const { Admin, Role } = require('./models');
const bcrypt = require('bcrypt');

async function createGmailAdmin() {
  try {
    console.log('Creating Gmail admin user...');

    // Check if admin role exists
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

    // Check if Gmail admin exists
    let admin = await Admin.findOne({ where: { email: 'masteradmin1@gmail.com' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('MasterAdmin@123', 10);
      admin = await Admin.create({
        email: 'masteradmin1@gmail.com',
        password: hashedPassword,
        name: 'Master Admin',
        roleId: adminRole.id,
        isActive: true
      });
      console.log('Created Gmail admin user: masteradmin1@gmail.com / MasterAdmin@123');
    } else {
      console.log('Gmail admin user already exists');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

createGmailAdmin();