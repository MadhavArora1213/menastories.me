const { Role } = require('./models');
require('dotenv').config();

async function checkDatabaseRoles() {
  console.log('🔍 Checking all roles in database...\n');

  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Get all roles
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'description', 'accessLevel', 'isAdmin', 'canManageUsers', 'canManageRoles', 'rolePermissions'],
      order: [['accessLevel', 'DESC']]
    });

    console.log('📋 ROLES IN DATABASE:');
    console.log('='.repeat(60));

    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Description: ${role.description || 'No description'}`);
      console.log(`   Access Level: ${role.accessLevel}`);
      console.log(`   Is Admin: ${role.isAdmin}`);
      console.log(`   Can Manage Users: ${role.canManageUsers}`);
      console.log(`   Can Manage Roles: ${role.canManageRoles}`);

      // Show permissions count
      const perms = role.rolePermissions || {};
      const permCount = Object.keys(perms).length;
      console.log(`   Total Permissions: ${permCount}`);

      // Show key permissions
      const keyPerms = [];
      if (perms.system) keyPerms.push('system');
      if (perms.content) keyPerms.push('content');
      if (perms.users) keyPerms.push('users');
      if (perms.analytics) keyPerms.push('analytics');
      if (perms.security) keyPerms.push('security');
      if (perms.communication) keyPerms.push('communication');

      console.log(`   Key Permissions: [${keyPerms.join(', ')}]`);

      // Show detailed permissions for first few roles
      if (index < 3) {
        console.log('   Detailed Permissions:');
        Object.keys(perms).forEach(perm => {
          if (perms[perm] === true) {
            console.log(`     ✓ ${perm}`);
          }
        });
      }

      console.log('-'.repeat(40));
    });

    console.log(`\n📊 SUMMARY:`);
    console.log(`Total Roles: ${roles.length}`);
    console.log(`Admin Roles: ${roles.filter(r => r.isAdmin).length}`);
    console.log(`User Management Roles: ${roles.filter(r => r.canManageUsers).length}`);
    console.log(`Role Management Roles: ${roles.filter(r => r.canManageRoles).length}`);

    await sequelize.close();
    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkDatabaseRoles();