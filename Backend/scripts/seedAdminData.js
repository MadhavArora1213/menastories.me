const sequelize = require('../config/db');
const Admin = require('../models/Admin');
const Role = require('../models/Role');

const seedAdminData = async () => {
  try {
    console.log('Starting admin data seeding...');

    // Check if roles already exist from initializeDb.js
    const existingRoles = await Role.findAll();
    if (existingRoles.length === 0) {
      console.log('No roles found. Please run "npm run init-db" first to create the role structure.');
      return;
    }

    console.log(`Found ${existingRoles.length} existing roles from initializeDb.js`);
    existingRoles.forEach(role => {
      console.log(`- ${role.name}: ${role.description}`);
    });

    // Check if admin users already exist
    const existingAdmins = await Admin.findAll();
    if (existingAdmins.length > 0) {
      console.log(`Found ${existingAdmins.length} existing admin users. Clearing them to create fresh accounts...`);

      // Delete all existing admin users
      await Admin.destroy({ where: {} });
      console.log('Existing admin users cleared.');
    }

    // Define all admin accounts to create
    const adminAccounts = [
      {
        username: 'masteradmin1',
        email: 'masteradmin1@magazine.com',
        password: 'MasterAdmin@123',
        name: 'Master Admin',
        firstName: 'Master',
        lastName: 'Admin',
        roleName: 'Master Admin'
      },
      {
        username: 'webmaster1',
        email: 'webmaster1@magazine.com',
        password: 'Webmaster@123',
        name: 'Webmaster',
        firstName: 'Web',
        lastName: 'Master',
        roleName: 'Webmaster'
      },
      {
        username: 'contentadmin1',
        email: 'contentadmin1@magazine.com',
        password: 'ContentAdmin@123',
        name: 'Content Admin',
        firstName: 'Content',
        lastName: 'Admin',
        roleName: 'Content Admin'
      },
      {
        username: 'editor-in-chief1',
        email: 'editor-in-chief1@magazine.com',
        password: 'Editor-in-Chief@123',
        name: 'Editor-in-Chief',
        firstName: 'Editor-in-Chief',
        lastName: 'User',
        roleName: 'Editor-in-Chief'
      },
      {
        username: 'sectioneditors1',
        email: 'sectioneditors1@magazine.com',
        password: 'SectionEditors@123',
        name: 'Section Editors',
        firstName: 'Section',
        lastName: 'Editors',
        roleName: 'Section Editors'
      },
      {
        username: 'seniorwriters1',
        email: 'seniorwriters1@magazine.com',
        password: 'SeniorWriters@123',
        name: 'Senior Writers',
        firstName: 'Senior',
        lastName: 'Writers',
        roleName: 'Senior Writers'
      },
      {
        username: 'staffwriters1',
        email: 'staffwriters1@magazine.com',
        password: 'StaffWriters@123',
        name: 'Staff Writers',
        firstName: 'Staff',
        lastName: 'Writers',
        roleName: 'Staff Writers'
      },
      {
        username: 'contributors1',
        email: 'contributors1@magazine.com',
        password: 'Contributors@123',
        name: 'Contributors',
        firstName: 'Contributing',
        lastName: 'Writer',
        roleName: 'Contributors'
      },
      {
        username: 'reviewers1',
        email: 'reviewers1@magazine.com',
        password: 'Reviewers@123',
        name: 'Reviewers',
        firstName: 'Content',
        lastName: 'Reviewer',
        roleName: 'Reviewers'
      },
      {
        username: 'socialmediamanager1',
        email: 'socialmediamanager1@magazine.com',
        password: 'SocialMediaManager@123',
        name: 'Social Media Manager',
        firstName: 'Social',
        lastName: 'Manager',
        roleName: 'Social Media Manager'
      }
    ];

    // Create all admin accounts
    console.log('Creating admin accounts...');
    for (const adminData of adminAccounts) {
      const role = await Role.findOne({ where: { name: adminData.roleName } });
      if (!role) {
        console.log(`Role '${adminData.roleName}' not found, skipping ${adminData.name}`);
        continue;
      }

      const admin = await Admin.create({
        username: adminData.username,
        email: adminData.email,
        password: adminData.password,
        name: adminData.name,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        roleId: role.id,
        isActive: true
      });

      await admin.hashPassword();
      await admin.save();

      console.log(`✅ Created: ${adminData.name} (${adminData.email})`);
    }

    console.log('\n🎉 Admin users created successfully!');
    console.log('\n=== Admin Credentials (1 Account Per Role) ===');
    adminAccounts.forEach(admin => {
      console.log(`${admin.name}: ${admin.email} / ${admin.password}`);
    });
    console.log('\n✅ Total: 10 admin accounts created (1 per role)');
    console.log('\nRole-Based Access System');
    console.log('10 Roles: Master Admin, Content Admin, Editor-in-Chief, Section Editors, Senior Writers, Staff Writers, Contributors, Reviewers, Social Media Manager, Webmaster');
    console.log('\nEach role has specific permissions for content management, user access, and system functions.');
    console.log('\nSeeding completed successfully!');

  } catch (error) {
    console.error('Error seeding admin data:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  seedAdminData();
}

module.exports = seedAdminData;
