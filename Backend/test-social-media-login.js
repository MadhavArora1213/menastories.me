const { Admin, Role } = require('./models');

async function testSocialMediaLogin() {
  try {
    // Find the Social Media Manager admin user
    const admin = await Admin.findOne({
      where: { email: 'socialmanager@magazine.com' },
      include: [{ model: Role, as: 'role' }]
    });

    if (!admin) {
      console.log('❌ Social Media Manager admin user not found!');
      return;
    }

    console.log('✅ Social Media Manager admin user found:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role ? admin.role.name : 'No role assigned'}`);
    console.log(`   Is Active: ${admin.isActive}`);
    console.log(`   Access Level: ${admin.role ? admin.role.accessLevel : 'N/A'}`);

    // Test login simulation
    const isPasswordValid = await admin.checkPassword('SocialMedia@123');
    console.log(`   Password validation: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);

    // Get permissions
    const permissions = admin.getFullPermissions();
    console.log(`   Total permissions: ${permissions ? permissions.length : 0}`);

    if (permissions && permissions.length > 0) {
      console.log('   Sample permissions:');
      permissions.slice(0, 5).forEach(perm => {
        console.log(`     - ${perm}`);
      });
      if (permissions.length > 5) {
        console.log(`     ... and ${permissions.length - 5} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error testing Social Media Manager login:', error);
  } finally {
    process.exit(0);
  }
}

testSocialMediaLogin();