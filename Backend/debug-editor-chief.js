const { Role } = require('./models');
require('dotenv').config();

async function debugEditorChief() {
  console.log('🔍 Debugging Editor-in-Chief Permissions...\n');

  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Get Editor-in-Chief role
    const editorChiefRole = await Role.findOne({ where: { name: 'Editor-in-Chief' } });
    if (!editorChiefRole) {
      console.log('❌ Editor-in-Chief role not found');
      return;
    }

    console.log('🎯 EDITOR-IN-CHIEF ROLE DETAILS:');
    console.log('='.repeat(60));
    console.log(`Name: ${editorChiefRole.name}`);
    console.log(`Permissions: ${JSON.stringify(editorChiefRole.rolePermissions, null, 2)}`);

    // Check specific permissions
    const perms = editorChiefRole.rolePermissions || {};
    console.log('\n🔍 SPECIFIC PERMISSION CHECKS:');
    console.log(`content: ${!!perms.content}`);
    console.log(`content.read: ${!!perms['content.read']}`);
    console.log(`content.create: ${!!perms['content.create']}`);
    console.log(`system: ${!!perms.system}`);
    console.log(`system.technical_access: ${!!perms['system.technical_access']}`);
    console.log(`analytics: ${!!perms.analytics}`);
    console.log(`analytics.read: ${!!perms['analytics.read']}`);

    // Simulate sidebar filtering
    console.log('\n📊 SIDEBAR SIMULATION:');
    const sections = [
      { name: "Content Management", requires: "content", hasPermission: !!perms.content },
      { name: "Downloads", requires: "content", hasPermission: !!perms.content },
      { name: "Media Kit", requires: "content", hasPermission: !!perms.content },
      { name: "Analytics", requires: "analytics", hasPermission: !!perms.analytics },
      { name: "System", requires: "system", hasPermission: !!perms.system }
    ];

    sections.forEach(section => {
      console.log(`${section.hasPermission ? '✅' : '❌'} ${section.name} (${section.requires})`);
    });

    console.log('\n🎯 CONCLUSION:');
    if (perms.content && perms.analytics) {
      console.log('✅ Editor-in-Chief SHOULD see: Content Management, Downloads, Media Kit, Analytics');
    } else {
      console.log('❌ Missing required permissions');
    }

    await sequelize.close();
    console.log('\n✅ Debug completed successfully!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugEditorChief();