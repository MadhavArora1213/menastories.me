const { Admin, Role } = require('./models');
const sequelize = require('./config/db');

async function fixAdminRoleAssociations() {
  try {
    console.log('🔧 Fixing admin role associations...\n');

    // Get all roles
    const roles = await Role.findAll({
      attributes: ['id', 'name']
    });

    console.log(`Found ${roles.length} roles:`);
    roles.forEach(role => console.log(`  - ${role.name} (ID: ${role.id})`));

    // Get all admin users
    const admins = await Admin.findAll({
      attributes: ['id', 'email', 'name', 'roleId']
    });

    console.log(`\nFound ${admins.length} admin users:`);
    admins.forEach(admin => console.log(`  - ${admin.name} (${admin.email}) - Current roleId: ${admin.roleId || 'NULL'}`));

    // Define the correct role assignments based on email patterns
    const roleAssignments = {
      'masteradmin1@gmail.com': 'Master Admin',
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

    console.log('\n🔄 Updating role associations...');

    // Update each admin user with the correct role
    for (const [email, roleName] of Object.entries(roleAssignments)) {
      const role = roles.find(r => r.name === roleName);
      if (!role) {
        console.log(`❌ Role "${roleName}" not found for ${email}`);
        continue;
      }

      const admin = admins.find(a => a.email === email);
      if (!admin) {
        console.log(`❌ Admin user "${email}" not found`);
        continue;
      }

      if (admin.roleId === role.id) {
        console.log(`✅ ${email} already has correct role: ${roleName}`);
        continue;
      }

      await admin.update({ roleId: role.id });
      console.log(`✅ Updated ${email} to role: ${roleName}`);
    }

    // Handle the duplicate Master Admin (masteradmin1@magazine.com)
    const duplicateMasterAdmins = admins.filter(admin =>
      admin.email === 'masteradmin1@magazine.com' && admin.roleId !== roles.find(r => r.name === 'Master Admin')?.id
    );

    if (duplicateMasterAdmins.length > 0) {
      console.log(`\n🗑️ Found ${duplicateMasterAdmins.length} duplicate Master Admin(s) to fix:`);
      const masterAdminRole = roles.find(r => r.name === 'Master Admin');

      for (const duplicate of duplicateMasterAdmins) {
        if (duplicate.roleId !== masterAdminRole.id) {
          await duplicate.update({ roleId: masterAdminRole.id });
          console.log(`✅ Fixed duplicate Master Admin: ${duplicate.email}`);
        }
      }
    }

    // Verify the fixes
    console.log('\n🔍 Verifying role associations...');
    const updatedAdmins = await Admin.findAll({
      include: [{ model: Role, attributes: ['name'] }],
      attributes: ['id', 'email', 'name']
    });

    console.log('\n📊 Final admin role associations:');
    updatedAdmins.forEach(admin => {
      console.log(`  👤 ${admin.name} (${admin.email}) - Role: ${admin.Role?.name || 'No role'}`);
    });

    const adminsWithRoles = updatedAdmins.filter(admin => admin.Role);
    const adminsWithoutRoles = updatedAdmins.filter(admin => !admin.Role);

    console.log(`\n📈 Summary:`);
    console.log(`  ✅ Admins with roles: ${adminsWithRoles.length}`);
    console.log(`  ❌ Admins without roles: ${adminsWithoutRoles.length}`);

    if (adminsWithoutRoles.length === 0) {
      console.log('\n🎉 SUCCESS: All admin users now have proper role associations!');
      console.log('The admin panel will now show correct roles for each user.');
    } else {
      console.log('\n⚠️  Warning: Some admin users still have no role assigned.');
    }

  } catch (error) {
    console.error('❌ Error fixing admin role associations:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixAdminRoleAssociations();