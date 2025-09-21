const sequelize = require('../config/db');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    console.log('Creating admin user for event imports...');

    // Find the Content Admin role
    const adminRole = await Role.findOne({
      where: { name: 'Content Admin' }
    });

    if (!adminRole) {
      console.log('Content Admin role not found. Please run database initialization first.');
      return null;
    }

    // Check if admin user already exists
    const existingUser = await User.findOne({
      where: { email: 'admin@magazine.com' }
    });

    if (existingUser) {
      console.log('Admin user already exists:', existingUser.email);
      return existingUser;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@magazine.com',
      password: hashedPassword,
      roleId: adminRole.id,
      isEmailVerified: true,
      isActive: true,
      phoneNumber: '+971501234567'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@magazine.com');
    console.log('Password: Admin@123');

    return adminUser;

  } catch (error) {
    console.error('Error creating admin user:', error);
    return null;
  }
};

// Run if called directly
if (require.main === module) {
  createAdminUser()
    .then(user => {
      if (user) {
        console.log('Admin user created with ID:', user.id);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to create admin user:', error);
      process.exit(1);
    });
}

module.exports = createAdminUser;