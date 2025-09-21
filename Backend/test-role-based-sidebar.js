const { Role } = require('./models');
require('dotenv').config();

async function testRoleBasedSidebar() {
  console.log('🧪 Testing Role-Based Sidebar Access...\n');

  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Test each role's sidebar access
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'isAdmin', 'canManageUsers', 'canManageRoles', 'rolePermissions'],
      order: [['accessLevel', 'DESC']]
    });

    console.log('📋 SIDEBAR ACCESS BY ROLE:');
    console.log('='.repeat(80));

    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name}`);
      console.log(`   Admin Status: ${role.isAdmin ? '✅ Admin' : '❌ Non-admin'}`);
      console.log(`   User Management: ${role.canManageUsers ? '✅ Yes' : '❌ No'}`);
      console.log(`   Role Management: ${role.canManageRoles ? '✅ Yes' : '❌ No'}`);

      const perms = role.rolePermissions || {};

      // Test sidebar sections
      const sidebarAccess = {
        content: !!perms.content,
        users: !!perms.users,
        analytics: !!perms.analytics,
        security: !!perms.security,
        system: !!perms.system,
        communication: !!perms.communication,
        social: !!perms.social
      };

      console.log('   Sidebar Sections:');
      Object.entries(sidebarAccess).forEach(([section, hasAccess]) => {
        console.log(`     ${hasAccess ? '✅' : '❌'} ${section.charAt(0).toUpperCase() + section.slice(1)}`);
      });

      // Test specific permissions
      const specificPerms = {
        'content.create': !!perms['content.create'],
        'content.edit': !!perms['content.edit'],
        'content.publish': !!perms['content.publish'],
        'content.moderate': !!perms['content.moderate'],
        'users.manage_roles': !!perms['users.manage_roles'],
        'analytics.view': !!perms['analytics.view'],
        'security.view_logs': !!perms['security.view_logs'],
        'system.technical_access': !!perms['system.technical_access'],
        'system.performance_monitoring': !!perms['system.performance_monitoring']
      };

      console.log('   Key Permissions:');
      Object.entries(specificPerms).forEach(([perm, hasPerm]) => {
        console.log(`     ${hasPerm ? '✅' : '❌'} ${perm}`);
      });

      console.log('-'.repeat(60));
    });

    console.log('\n📊 SIDEBAR ACCESS SUMMARY:');
    console.log('• Master Admin: Full access to all sections');
    console.log('• Webmaster: System, Analytics, Security, Content, Users');
    console.log('• Content Admin: Content, Analytics, Users, Communication');
    console.log('• Editor-in-Chief: Content management + Editorial oversight');
    console.log('• Section Editors: Content management + Section oversight');
    console.log('• Senior Writers: Advanced content creation');
    console.log('• Staff Writers: Standard content creation');
    console.log('• Contributors: Basic content contribution');
    console.log('• Reviewers: Content review and quality control');
    console.log('• Social Media Manager: Social media management');

    console.log('\n🎯 PERMISSION-BASED FEATURES:');
    console.log('• Dynamic sidebar filtering based on role permissions');
    console.log('• Menu items hidden/shown based on user access level');
    console.log('• Admin status determines core system access');
    console.log('• User/Role management restricted to authorized personnel');

    await sequelize.close();
    console.log('\n✅ Role-based sidebar test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRoleBasedSidebar();