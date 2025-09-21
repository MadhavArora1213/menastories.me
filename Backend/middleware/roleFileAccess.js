const { Role, User } = require('../models');

// File access control matrix based on roles
const FILE_ACCESS_MATRIX = {
  'Master Admin': {
    allowed: ['*'], // Access to all files
    restricted: []
  },
  'Webmaster': {
    allowed: [
      'server_status.php', 'performance_monitor.php', 'database_optimization.php',
      'cdn_management.php', 'caching_settings.php', 'error_logs.php',
      'site_speed_analysis.php', 'uptime_monitoring.php',
      'seo_technical.php', 'sitemap_management.php', 'robots_txt.php',
      'schema_markup.php', 'meta_tags_bulk.php', 'redirect_management.php',
      'canonical_urls.php', 'structured_data.php',
      'backup_management.php', 'restore_system.php', 'maintenance_mode.php',
      'system_updates.php', 'plugin_updates.php', 'database_backup.php'
    ],
    restricted: ['user_management.php', 'content_editing.php', 'financial_data.php']
  },
  'Content Admin': {
    allowed: [
      'content_dashboard.php', 'all_articles.php', 'editorial_calendar.php',
      'publishing_schedule.php', 'content_analytics.php', 'writer_management.php',
      'content_approval_queue.php', 'bulk_content_operations.php',
      'category_management.php', 'subcategory_management.php', 'category_analytics.php',
      'tag_management.php', 'content_organization.php', 'category_seo.php',
      'media_library.php', 'media_upload.php', 'media_organization.php',
      'media_analytics.php', 'storage_management.php', 'media_optimization.php',
      'newsletter_dashboard.php', 'newsletter_create.php', 'subscriber_management.php',
      'newsletter_analytics.php', 'email_templates.php', 'campaign_management.php'
    ],
    restricted: [
      'user_role_management.php', 'system_settings.php', 'security_settings.php',
      'financial_reports.php', 'server_management.php'
    ]
  },
  'Editor-in-Chief': {
    allowed: [
      'editorial_dashboard.php', 'content_approval_final.php', 'editorial_calendar.php',
      'quality_control.php', 'team_performance.php', 'content_strategy.php',
      'breaking_news_management.php', 'editorial_guidelines.php',
      'writer_performance.php', 'editor_workload.php', 'assignment_management.php',
      'team_analytics.php', 'performance_reviews.php', 'writer_feedback.php',
      'content_strategy.php', 'trending_analysis.php', 'audience_insights.php',
      'competitive_analysis.php', 'content_planning.php', 'editorial_meetings.php'
    ],
    restricted: [
      'user_creation.php', 'system_configuration.php', 'technical_settings.php',
      'financial_management.php', 'server_settings.php'
    ]
  },
  'Section Editors': {
    allowed: [
      'section_dashboard.php', 'section_articles.php', 'content_review_queue.php',
      'section_analytics.php', 'writer_assignments.php', 'section_calendar.php',
      'article_review.php', 'content_approval.php', 'revision_tracking.php',
      'quality_checklist.php', 'feedback_management.php', 'fact_check_queue.php',
      'section_writers.php', 'assignment_board.php', 'writer_performance.php',
      'deadline_tracking.php', 'communication_log.php'
    ],
    restricted: [
      'other_sections_edit.php', 'user_management.php', 'system_settings.php',
      'financial_data.php', 'global_content_settings.php'
    ]
  },
  'Senior Writers': {
    allowed: [
      'article_create_advanced.php', 'my_articles.php', 'draft_management.php',
      'media_upload_advanced.php', 'interview_scheduling.php', 'source_management.php',
      'writer_analytics.php', 'article_performance.php', 'reader_engagement.php',
      'social_media_tracking.php', 'byline_analytics.php',
      'assignment_board.php', 'deadline_tracker.php', 'story_pipeline.php',
      'interview_calendar.php', 'research_notes.php'
    ],
    restricted: [
      'user_management.php', 'site_settings.php', 'other_writers_content.php',
      'editorial_decisions.php', 'content_approval.php'
    ]
  },
  'Staff Writers': {
    allowed: [
      'article_create.php', 'my_articles.php', 'draft_management.php',
      'basic_media_upload.php', 'submission_queue.php',
      'my_assignments.php', 'deadline_tracker.php', 'submission_status.php',
      'editor_feedback.php',
      'my_article_stats.php', 'basic_performance.php', 'reader_comments.php'
    ],
    restricted: [
      'advanced_features.php', 'other_writers_work.php', 'editorial_tools.php',
      'content_approval.php', 'analytics_detailed.php'
    ]
  },
  'Contributors': {
    allowed: [
      'article_submit.php', 'submission_guidelines.php', 'my_submissions.php',
      'submission_status.php', 'basic_editor.php',
      'contributor_profile.php', 'bio_management.php', 'contact_info.php',
      'portfolio_links.php',
      'payment_status.php', 'invoice_history.php', 'tax_documents.php'
    ],
    restricted: [
      'site_analytics.php', 'user_management.php', 'content_editing_others.php',
      'advanced_features.php', 'editorial_tools.php', 'system_settings.php'
    ]
  },
  'Reviewers': {
    allowed: [
      'review_queue.php', 'fact_check_dashboard.php', 'content_verification.php',
      'source_validation.php', 'quality_checklist.php', 'review_notes.php',
      'fact_check_tools.php', 'source_database.php', 'verification_log.php',
      'accuracy_tracking.php', 'expert_contacts.php',
      'quality_metrics.php', 'style_guide.php', 'consistency_checker.php',
      'plagiarism_tools.php', 'review_analytics.php'
    ],
    restricted: [
      'content_creation.php', 'user_management.php', 'publishing_controls.php',
      'site_settings.php', 'editorial_decisions.php'
    ]
  },
  'Social Media Manager': {
    allowed: [
      'social_dashboard.php', 'content_scheduling.php', 'social_analytics.php',
      'engagement_monitoring.php', 'campaign_management.php', 'hashtag_manager.php',
      'content_promotion.php', 'boost_management.php', 'influencer_outreach.php',
      'cross_platform_posting.php', 'viral_tracking.php',
      'platform_analytics.php', 'audience_insights.php', 'engagement_reports.php',
      'growth_tracking.php', 'competitor_analysis.php'
    ],
    restricted: [
      'content_editing.php', 'user_management.php', 'site_settings.php',
      'editorial_decisions.php', 'financial_data.php'
    ]
  }
};

// Middleware to check file access based on user role
const checkFileAccess = (req, res, next) => {
  try {
    const userId = req.user?.id;
    const requestedFile = req.params.file || req.query.file || req.body.file;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!requestedFile) {
      return res.status(400).json({ message: 'File parameter required' });
    }

    // Get user with role
    User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }]
    }).then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.role) {
        return res.status(403).json({ message: 'No role assigned to user' });
      }

      const userRoleName = user.role.name;
      const accessConfig = FILE_ACCESS_MATRIX[userRoleName];

      if (!accessConfig) {
        return res.status(403).json({ message: 'Invalid role configuration' });
      }

      // Master Admin has access to everything
      if (userRoleName === 'Master Admin' || accessConfig.allowed.includes('*')) {
        return next();
      }

      // Check if file is in restricted list
      if (accessConfig.restricted.includes(requestedFile)) {
        return res.status(403).json({
          message: 'Access denied to this file',
          file: requestedFile,
          reason: 'File is in restricted list for your role'
        });
      }

      // Check if file is in allowed list
      if (accessConfig.allowed.includes(requestedFile)) {
        return next();
      }

      // File not in allowed list
      return res.status(403).json({
        message: 'Access denied to this file',
        file: requestedFile,
        reason: 'File not accessible with your current role',
        allowedFiles: accessConfig.allowed
      });

    }).catch(error => {
      console.error('File access check error:', error);
      res.status(500).json({ message: 'Server error during access check' });
    });

  } catch (error) {
    console.error('File access middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to get accessible files for current user
const getAccessibleFiles = (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }]
    }).then(user => {
      if (!user || !user.role) {
        return res.status(403).json({ message: 'User or role not found' });
      }

      const userRoleName = user.role.name;
      const accessConfig = FILE_ACCESS_MATRIX[userRoleName];

      if (!accessConfig) {
        return res.status(403).json({ message: 'Invalid role configuration' });
      }

      // Add accessible files to request object
      req.accessibleFiles = userRoleName === 'Master Admin' || accessConfig.allowed.includes('*')
        ? ['*'] // All files accessible
        : accessConfig.allowed;

      req.restrictedFiles = accessConfig.restricted || [];
      req.userRole = userRoleName;

      next();

    }).catch(error => {
      console.error('Get accessible files error:', error);
      res.status(500).json({ message: 'Server error' });
    });

  } catch (error) {
    console.error('Get accessible files middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Function to check file access programmatically
const hasFileAccess = (userRole, fileName) => {
  if (!userRole || !fileName) return false;

  const accessConfig = FILE_ACCESS_MATRIX[userRole];

  if (!accessConfig) return false;

  // Master Admin has access to everything
  if (userRole === 'Master Admin' || accessConfig.allowed.includes('*')) {
    return true;
  }

  // Check if file is restricted
  if (accessConfig.restricted.includes(fileName)) {
    return false;
  }

  // Check if file is allowed
  return accessConfig.allowed.includes(fileName);
};

// Function to get all accessible files for a role
const getAccessibleFilesForRole = (roleName) => {
  const accessConfig = FILE_ACCESS_MATRIX[roleName];

  if (!accessConfig) return [];

  if (roleName === 'Master Admin' || accessConfig.allowed.includes('*')) {
    return ['*']; // All files
  }

  return accessConfig.allowed;
};

module.exports = {
  checkFileAccess,
  getAccessibleFiles,
  hasFileAccess,
  getAccessibleFilesForRole,
  FILE_ACCESS_MATRIX
};