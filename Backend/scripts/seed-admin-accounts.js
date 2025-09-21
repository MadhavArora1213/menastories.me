const { Admin, Role } = require('../models');

const adminAccounts = [
  {
    email: 'masteradmin1@magazine.com',
    password: 'MasterAdmin@123',
    name: 'Master Administrator',
    roleName: 'Master Admin'
  },
  {
    email: 'webmaster1@magazine.com',
    password: 'Webmaster@123',
    name: 'Web Master',
    roleName: 'Webmaster'
  },
  {
    email: 'contentadmin1@magazine.com',
    password: 'ContentAdmin@123',
    name: 'Content Administrator',
    roleName: 'Content Admin'
  },
  {
    email: 'editor-in-chief1@magazine.com',
    password: 'Editor-in-Chief@123',
    name: 'Editor in Chief',
    roleName: 'Editor-in-Chief'
  },
  {
    email: 'sectioneditors1@magazine.com',
    password: 'SectionEditors@123',
    name: 'Section Editor',
    roleName: 'Section Editors'
  },
  {
    email: 'seniorwriters1@magazine.com',
    password: 'SeniorWriters@123',
    name: 'Senior Writer',
    roleName: 'Senior Writers'
  },
  {
    email: 'staffwriters1@magazine.com',
    password: 'StaffWriters@123',
    name: 'Staff Writer',
    roleName: 'Staff Writers'
  },
  {
    email: 'contributors1@magazine.com',
    password: 'Contributors@123',
    name: 'Content Contributor',
    roleName: 'Contributors'
  },
  {
    email: 'reviewers1@magazine.com',
    password: 'Reviewers@123',
    name: 'Content Reviewer',
    roleName: 'Reviewers'
  },
  {
    email: 'socialmediamanager1@magazine.com',
    password: 'SocialMediaManager@123',
    name: 'Social Media Manager',
    roleName: 'Social Media Manager'
  }
];

const seedAdminAccounts = async () => {
  try {
    console.log('🚀 Starting admin accounts seeding...');

    let accountsCreated = 0;
    let accountsUpdated = 0;

    for (const adminData of adminAccounts) {
      try {
        // Find the role by name
        const role = await Role.findOne({
          where: { name: adminData.roleName }
        });

        if (!role) {
          console.log(`⚠️  Role "${adminData.roleName}" not found, skipping ${adminData.email}...`);
          continue;
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
          where: { email: adminData.email }
        });

        if (existingAdmin) {
          // Update existing admin with new data
          await existingAdmin.update({
            name: adminData.name,
            roleId: role.id,
            isActive: true
          });
          console.log(`   🔄 Updated admin: ${adminData.email} (${adminData.roleName})`);
          accountsUpdated++;
        } else {
          // Create new admin
          const newAdmin = await Admin.create({
            email: adminData.email,
            password: adminData.password, // Will be hashed by the model hook
            name: adminData.name,
            roleId: role.id,
            isActive: true,
            phoneNumber: null,
            department: adminData.roleName,
            profileImage: null
          });
          console.log(`   ✅ Created admin: ${adminData.email} (${adminData.roleName})`);
          accountsCreated++;
        }

      } catch (adminError) {
        console.log(`   ❌ Error with admin "${adminData.email}": ${adminError.message}`);
      }
    }

    console.log(`\n🎉 Admin accounts seeding completed!`);
    console.log(`📊 Accounts created: ${accountsCreated}`);
    console.log(`📊 Accounts updated: ${accountsUpdated}`);

    // Verify final count
    const allAdmins = await Admin.findAll({
      include: [{ model: Role, as: 'role' }],
      attributes: ['id', 'email', 'name', 'isActive']
    });

    console.log(`📈 Total admin accounts: ${allAdmins.length}`);

    console.log(`\n📋 All admin accounts:`);
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} - ${admin.name}`);
      console.log(`      Role: ${admin.role ? admin.role.name : 'No role'}`);
      console.log(`      Active: ${admin.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error seeding admin accounts:', error);
    throw error;
  }
};

// Run the seeding
seedAdminAccounts()
  .then(() => {
    console.log('\n✅ Admin accounts seeding process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Admin accounts seeding failed:', error);
    process.exit(1);
  });