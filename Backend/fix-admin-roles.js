const { Admin, Role } = require('./models');
const sequelize = require('./config/db');

async function fixAdminRoles() {
  try {
    console.log('🔧 Fixing admin role assignments...\n');

    // Get all roles
    const roles = await Role.findAll();
    console.log(`Found ${roles.length} roles in database`);

    // Create a map of role names to IDs
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role.id;
    });

    console.log('Role mapping:', roleMap);

    // Get all admins
    const admins = await Admin.findAll();
    console.log(`\nFound ${admins.length} admins to update`);

    // Define role assignments based on admin names/emails
    const roleAssignments = {
      'masteradmin1@gmail.com': 'Master Admin',
      'masteradmin@magazine.com': 'Master Admin',
      'masteradmin1@magazine.com': 'Master Admin',
      'webmaster@magazine.com': 'Webmaster',
      'contentadmin@magazine.com': 'Content Admin',
      'editorinchief@magazine.com': 'Editor-in-Chief',
      'sectioneditor@magazine.com': 'Section Editors',
      'seniorwriter@magazine.com': 'Senior Writers',
      'staffwriter@magazine.com': 'Staff Writers',
      'contributor@magazine.com': 'Contributors',
      'reviewer@magazine.com': 'Reviewers',
      'socialmanager@magazine.com': 'Social Media Manager'
    };

    // Update each admin with the correct role
    for (const admin of admins) {
      const roleName = roleAssignments[admin.email];
      if (roleName && roleMap[roleName]) {
        await admin.update({ roleId: roleMap[roleName] });
        console.log(`✅ Updated ${admin.name} (${admin.email}) -> ${roleName}`);
      } else {
        console.log(`⚠️  No role assignment found for ${admin.name} (${admin.email})`);
      }
    }

    console.log('\n🔍 Verifying role assignments...');

    // Verify the assignments
    const updatedAdmins = await Admin.findAll({
      include: [{ model: Role, attributes: ['name', 'accessLevel'] }]
    });

    console.log('\n📋 Final admin role assignments:');
    updatedAdmins.forEach(admin => {
      const roleName = admin.Role ? admin.Role.name : 'No role';
      console.log(`  - ${admin.name} (${admin.email}) -> ${roleName}`);
    });

    console.log('\n✅ Admin role assignments fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing admin roles:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixAdminRoles();