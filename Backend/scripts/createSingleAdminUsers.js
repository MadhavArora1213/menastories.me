const sequelize = require('../config/db');
const Admin = require('../models/Admin');
const Role = require('../models/Role');

const createSingleAdminUsers = async () => {
  try {
    console.log('Starting single admin user creation (1 per role)...');

    // Check if roles exist
    const existingRoles = await Role.findAll();
    if (existingRoles.length === 0) {
      console.log('No roles found. Please run "npm run init-db" first to create the role structure.');
      return;
    }

    console.log(`Found ${existingRoles.length} roles`);

    // Define roles and their user data
    const roles = [
      'Master Admin',
      'Webmaster',
      'Content Admin',
      'Editor-in-Chief',
      'Section Editors',
      'Senior Writers',
      'Staff Writers',
      'Contributors',
      'Reviewers',
      'Social Media Manager'
    ];

    const adminCredentials = [];

    for (const roleName of roles) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        console.log(`Role ${roleName} not found, skipping...`);
        continue;
      }

      console.log(`Creating 1 user for role: ${roleName}`);

      const username = `${roleName.toLowerCase().replace(/\s+/g, '')}1`;
      const email = `${roleName.toLowerCase().replace(/\s+/g, '')}1@magazine.com`;
      const password = `${roleName.replace(/\s+/g, '')}@123`;
      const firstName = roleName.split(' ')[0];
      const lastName = roleName.split(' ').slice(1).join(' ') || 'User';

      try {
        // Check if user already exists
        const existingUser = await Admin.findOne({ where: { email } });
        if (existingUser) {
          console.log(`User ${email} already exists, skipping...`);
          continue;
        }

        const admin = await Admin.create({
          username,
          email,
          password,
          name: `${firstName} 1 ${lastName}`,
          roleId: role.id,
          isActive: true,
          department: roleName,
          phoneNumber: `+1-555-010001`
        });

        adminCredentials.push({
          role: roleName,
          email,
          password,
          username
        });

        console.log(`Created: ${email} / ${password}`);

      } catch (error) {
        console.error(`Error creating user ${email}:`, error.message);
      }
    }

    console.log('\n=== ALL ADMIN CREDENTIALS ===');
    console.log('Format: Role | Email | Password | Username');
    console.log('='.repeat(80));

    adminCredentials.forEach(cred => {
      console.log(`${cred.role.padEnd(20)} | ${cred.email.padEnd(30)} | ${cred.password.padEnd(15)} | ${cred.username}`);
    });

    console.log('\n=== SUMMARY BY ROLE ===');
    roles.forEach(roleName => {
      const roleUsers = adminCredentials.filter(cred => cred.role === roleName);
      console.log(`${roleName}: ${roleUsers.length} users created`);
    });

    console.log(`\nTotal admin users created: ${adminCredentials.length}`);
    console.log('\nSingle admin user creation completed successfully!');

  } catch (error) {
    console.error('Error in single admin user creation:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  createSingleAdminUsers();
}

module.exports = createSingleAdminUsers;