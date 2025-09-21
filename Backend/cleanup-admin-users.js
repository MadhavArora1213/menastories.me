const { Admin } = require('./models');
const sequelize = require('./config/db');

async function cleanupAdminUsers() {
  try {
    console.log('🧹 Cleaning up admin users to have exactly 1 user per role...\n');

    // Get all admin users
    const allAdmins = await Admin.findAll({
      attributes: ['id', 'email', 'name']
    });

    console.log(`Found ${allAdmins.length} total admin users`);

    // Define which users to keep (one per role)
    const usersToKeep = [
      'masteradmin1@gmail.com',        // Master Admin
      'webmaster@magazine.com',        // Webmaster
      'contentadmin@magazine.com',     // Content Admin
      'editorinchief@magazine.com',    // Editor-in-Chief
      'sectioneditor@magazine.com',    // Section Editors
      'seniorwriter@magazine.com',     // Senior Writers
      'staffwriter@magazine.com',      // Staff Writers
      'contributor@magazine.com',      // Contributors
      'reviewer@magazine.com',         // Reviewers
      'socialmanager@magazine.com'     // Social Media Manager
    ];

    console.log('\n📋 Users to keep (1 per role):');
    usersToKeep.forEach(email => console.log(`  ✅ ${email}`));

    // Get users to delete
    const usersToDelete = allAdmins.filter(admin =>
      !usersToKeep.includes(admin.email)
    );

    console.log(`\n🗑️  Users to delete (${usersToDelete.length}):`);
    usersToDelete.forEach(admin => console.log(`  ❌ ${admin.email} (${admin.name})`));

    // Delete the extra users
    if (usersToDelete.length > 0) {
      const deletePromises = usersToDelete.map(admin =>
        Admin.destroy({ where: { id: admin.id } })
      );

      await Promise.all(deletePromises);
      console.log(`\n✅ Successfully deleted ${usersToDelete.length} extra admin users`);
    }

    // Verify the cleanup
    const remainingAdmins = await Admin.findAll({
      attributes: ['id', 'email', 'name']
    });

    console.log(`\n📊 Final result: ${remainingAdmins.length} admin users remaining`);
    console.log('\n🎯 Remaining admin users:');
    remainingAdmins.forEach(admin => console.log(`  👤 ${admin.name} (${admin.email})`));

    console.log('\n✅ Admin user cleanup completed successfully!');
    console.log('Now you have exactly 10 roles with 10 users (1 user per role).');

  } catch (error) {
    console.error('❌ Error cleaning up admin users:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

cleanupAdminUsers();