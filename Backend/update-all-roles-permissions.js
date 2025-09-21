const { Role } = require('./models');
require('dotenv').config();

async function updateAllRolesPermissions() {
  console.log('🔄 Updating all roles with comprehensive permissions...\n');

  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Define comprehensive permissions for each role
    const rolePermissions = {
      'Master Admin': {
        // Full system access
        'system': true,
        'system.full_access': true,
        'system.user_management': true,
        'system.role_management': true,
        'system.site_config': true,
        'system.technical_access': true,
        'system.performance_monitoring': true,
        'system.maintenance': true,
        'system.settings': true,
        'system.logs': true,
        // Full content access
        'content': true,
        'content.create': true,
        'content.edit': true,
        'content.delete': true,
        'content.publish': true,
        'content.moderate': true,
        'content.read': true,
        'content.view': true,
        'content.schedule': true,
        'content.approve': true,
        'content.quality_control': true,
        'content.feature_articles': true,
        'content.investigative': true,
        // Full user management
        'users': true,
        'users.view': true,
        'users.read': true,
        'users.manage_roles': true,
        'users.manage': true,
        'users.view_content_users': true,
        // Full analytics
        'analytics': true,
        'analytics.view': true,
        'analytics.read': true,
        'analytics.export': true,
        // Full security
        'security': true,
        'security.view_logs': true,
        'security.read': true,
        'security.manage': true,
        'security.manage_security': true,
        // Communication
        'communication': true,
        'communication.manage': true,
        // Social media
        'social': true,
        'social.manage_platforms': true,
        'social.content_promotion': true,
        'social.engagement': true,
        'social.analytics': true
      },

      'Webmaster': {
        // Technical system access
        'system': true,
        'system.technical_access': true,
        'system.performance_monitoring': true,
        'system.maintenance': true,
        'system.settings': true,
        'system.logs': true,
        // Limited content access
        'content': true,
        'content.read': true,
        'content.view': true,
        'content.edit': true,
        'content.publish': true,
        // User management
        'users': true,
        'users.view': true,
        'users.read': true,
        'users.manage_roles': true,
        'users.manage': true,
        // Full analytics
        'analytics': true,
        'analytics.view': true,
        'analytics.read': true,
        'analytics.export': true,
        // Full security
        'security': true,
        'security.view_logs': true,
        'security.read': true,
        'security.manage': true,
        'security.manage_security': true
      },

      'Content Admin': {
        // Dashboard and settings
        'system': true,
        'system.dashboard.view': true,
        'system.settings': true,
        // Full content management
        'content': true,
        'content.view': true,
        'content.read': true,
        'content.create': true,
        'content.edit': true,
        'content.delete': true,
        'content.publish': true,
        'content.moderate': true,
        'content.schedule': true,
        'content.approve': true,
        'content.quality_control': true,
        'content.feature_articles': true,
        // User viewing
        'users': true,
        'users.view': true,
        'users.read': true,
        'users.view_content_users': true,
        // Analytics viewing
        'analytics': true,
        'analytics.view': true,
        'analytics.read': true,
        // Communication management
        'communication': true,
        'communication.manage': true
      },

      'Editor-in-Chief': {
        // Editorial leadership permissions
        'content': true,
        'content.create': true,
        'content.edit': true,
        'content.delete': true,
        'content.publish': true,
        'content.approve': true,
        'content.quality_control': true,
        'content.feature_articles': true,
        'content.investigative': true,
        'content.schedule': true,
        'content.moderate': true,
        'editorial': true,
        'editorial.strategy': true,
        'editorial.standards': true,
        'editorial.approvals': true,
        // Limited user viewing
        'users': true,
        'users.view': true,
        'users.view_content_users': true,
        // Analytics viewing
        'analytics': true,
        'analytics.view': true
      },

      'Section Editors': {
        // Section management permissions
        'content': true,
        'content.create': true,
        'content.edit': true,
        'content.delete': true,
        'content.publish': true,
        'content.approve': true,
        'content.quality_control': true,
        'content.section_oversight': true,
        'editorial': true,
        'editorial.section_strategy': true,
        'editorial.writer_coordination': true,
        'editorial.standards': true,
        // Limited user viewing
        'users': true,
        'users.view': true,
        'users.view_content_users': true
      },

      'Senior Writers': {
        // Senior writing permissions
        'content': true,
        'content.create': true,
        'content.edit': true,
        'content.publish': true,
        'content.feature_articles': true,
        'content.investigative': true,
        'content.quality_control': true,
        // Limited user viewing
        'users': true,
        'users.view_content_users': true
      },

      'Staff Writers': {
        // Standard writing permissions
        'content': true,
        'content.create': true,
        'content.edit': true,
        'content.publish': true,
        'content.daily_articles': true,
        'content.event_coverage': true,
        // Limited user viewing
        'users': true,
        'users.view_content_users': true
      },

      'Contributors': {
        // Contributor permissions
        'content': true,
        'content.create': true,
        'content.submit': true,
        'content.limited_edit': true,
        // Limited user viewing
        'users': true,
        'users.view_content_users': true
      },

      'Reviewers': {
        // Review and quality control permissions
        'content': true,
        'content.review': true,
        'content.fact_check': true,
        'content.quality_assurance': true,
        'content.approve': true,
        'content.read': true,
        'content.view': true,
        // Limited user viewing
        'users': true,
        'users.view_content_users': true
      },

      'Social Media Manager': {
        // Social media management permissions
        'social': true,
        'social.manage_platforms': true,
        'social.content_promotion': true,
        'social.engagement': true,
        'social.analytics': true,
        'content': true,
        'content.read': true,
        'content.view': true,
        // Limited user viewing
        'users': true,
        'users.view_content_users': true
      }
    };

    // Update each role
    for (const [roleName, permissions] of Object.entries(rolePermissions)) {
      console.log(`📝 Updating ${roleName}...`);

      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        // Determine admin status based on role
        const isAdmin = ['Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors'].includes(roleName);
        const canManageUsers = ['Master Admin', 'Webmaster'].includes(roleName);
        const canManageRoles = ['Master Admin', 'Webmaster'].includes(roleName);

        await role.update({
          rolePermissions: permissions,
          isAdmin: isAdmin,
          canManageUsers: canManageUsers,
          canManageRoles: canManageRoles
        });
        console.log(`✅ ${roleName} updated successfully`);
      } else {
        console.log(`⚠️  ${roleName} not found`);
      }
    }

    console.log('\n🎉 All roles updated successfully!');
    console.log('\n📋 ROLE ACCESS SUMMARY:');
    console.log('• Master Admin: Full system access');
    console.log('• Webmaster: Technical + Analytics + Security');
    console.log('• Content Admin: Content management + Analytics');
    console.log('• Editor-in-Chief: Editorial leadership');
    console.log('• Section Editors: Section management');
    console.log('• Senior Writers: Advanced writing');
    console.log('• Staff Writers: Standard writing');
    console.log('• Contributors: Basic contribution');
    console.log('• Reviewers: Quality control');
    console.log('• Social Media Manager: Social media management');

    await sequelize.close();

  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateAllRolesPermissions();