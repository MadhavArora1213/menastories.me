const { Admin, Role, Article, VideoArticle, Event, List } = require('./models');
const sequelize = require('./config/db');

async function completeAdminCleanupComprehensive() {
  try {
    console.log('🧹 COMPREHENSIVE admin cleanup with ALL foreign key constraints...\n');

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

    // Get users to potentially delete
    const usersToDelete = allAdmins.filter(admin =>
      !usersToKeep.includes(admin.email)
    );

    console.log(`\n🗑️  Users to evaluate for deletion (${usersToDelete.length}):`);
    usersToDelete.forEach(admin => console.log(`  ❓ ${admin.email} (${admin.name})`));

    // Check if any users to delete have created content
    for (const admin of usersToDelete) {
      // Check articles created by this admin
      const articleCount = await Article.count({ where: { createdBy: admin.id } });
      const videoArticleCount = await VideoArticle.count({ where: { createdBy: admin.id } });
      const eventCount = await Event.count({ where: { createdBy: admin.id } });
      const listCount = await List.count({ where: { createdBy: admin.id } });

      console.log(`\n🔍 Checking ${admin.email}:`);
      console.log(`  📝 Articles created: ${articleCount}`);
      console.log(`  🎥 Video articles created: ${videoArticleCount}`);
      console.log(`  📅 Events created: ${eventCount}`);
      console.log(`  📋 Lists created: ${listCount}`);

      if (articleCount > 0 || videoArticleCount > 0 || eventCount > 0 || listCount > 0) {
        console.log(`  ⚠️  Cannot delete - has created content`);

        // Find a replacement admin (Master Admin)
        const replacementAdmin = allAdmins.find(a => a.email === 'masteradmin1@gmail.com');
        if (replacementAdmin) {
          console.log(`  🔄 Transferring content to: ${replacementAdmin.email}`);

          // Transfer articles (both createdBy and updatedBy)
          if (articleCount > 0) {
            await Article.update(
              { createdBy: replacementAdmin.id },
              { where: { createdBy: admin.id } }
            );
            await Article.update(
              { updatedBy: replacementAdmin.id },
              { where: { updatedBy: admin.id } }
            );
            console.log(`  ✅ Transferred ${articleCount} articles`);
          }

          // Transfer video articles (both createdBy and updatedBy)
          if (videoArticleCount > 0) {
            await VideoArticle.update(
              { createdBy: replacementAdmin.id },
              { where: { createdBy: admin.id } }
            );
            await VideoArticle.update(
              { updatedBy: replacementAdmin.id },
              { where: { updatedBy: admin.id } }
            );
            console.log(`  ✅ Transferred ${videoArticleCount} video articles`);
          }

          // Transfer events (both createdBy and updatedBy)
          if (eventCount > 0) {
            await Event.update(
              { createdBy: replacementAdmin.id },
              { where: { createdBy: admin.id } }
            );
            await Event.update(
              { updatedBy: replacementAdmin.id },
              { where: { updatedBy: admin.id } }
            );
            console.log(`  ✅ Transferred ${eventCount} events`);
          }

          // Transfer lists (both createdBy and updatedBy)
          if (listCount > 0) {
            await List.update(
              { createdBy: replacementAdmin.id },
              { where: { createdBy: admin.id } }
            );
            await List.update(
              { updatedBy: replacementAdmin.id },
              { where: { updatedBy: admin.id } }
            );
            console.log(`  ✅ Transferred ${listCount} lists`);
          }
        }
      } else {
        console.log(`  ✅ Safe to delete - no content created`);
      }
    }

    // Now try to delete the users
    console.log('\n🗑️  Attempting to delete extra admin users...');
    let deletedCount = 0;

    for (const admin of usersToDelete) {
      try {
        await Admin.destroy({ where: { id: admin.id } });
        console.log(`  ✅ Deleted: ${admin.email}`);
        deletedCount++;
      } catch (error) {
        console.log(`  ❌ Failed to delete ${admin.email}: ${error.message}`);
      }
    }

    // Verify the cleanup
    const remainingAdmins = await Admin.findAll({
      attributes: ['id', 'email', 'name']
    });

    console.log(`\n📊 Final result:`);
    console.log(`  ✅ Successfully deleted: ${deletedCount} admin users`);
    console.log(`  👥 Remaining admin users: ${remainingAdmins.length}`);

    console.log('\n🎯 Final admin users:');
    remainingAdmins.forEach(admin => console.log(`  👤 ${admin.name} (${admin.email})`));

    if (remainingAdmins.length === 10) {
      console.log('\n🎉 SUCCESS: Now you have exactly 10 roles with 10 users (1 user per role)!');
      console.log('The admin panel will now show "10 users" instead of "12 users".');
      console.log('\n📋 Login Credentials:');
      console.log('  Master Admin: masteradmin1@gmail.com / MasterAdmin@123');
      console.log('  Webmaster: webmaster@magazine.com / Webmaster@123');
      console.log('  Content Admin: contentadmin@magazine.com / ContentAdmin@123');
      console.log('  Editor-in-Chief: editorinchief@magazine.com / EditorChief@123');
      console.log('  Section Editor: sectioneditor@magazine.com / SectionEditor@123');
      console.log('  Senior Writer: seniorwriter@magazine.com / SeniorWriter@123');
      console.log('  Staff Writer: staffwriter@magazine.com / StaffWriter@123');
      console.log('  Contributor: contributor@magazine.com / Contributor@123');
      console.log('  Reviewer: reviewer@magazine.com / Reviewer@123');
      console.log('  Social Media Manager: socialmanager@magazine.com / SocialManager@123');
    } else {
      console.log(`\n⚠️  Note: You have ${remainingAdmins.length} users. Some users may have created content that couldn't be safely deleted.`);
      console.log('This is still better than having duplicate users.');
    }

  } catch (error) {
    console.error('❌ Error in comprehensive cleanup:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

completeAdminCleanupComprehensive();