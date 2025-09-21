const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SecuritySettings = sequelize.define('SecuritySettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  category: {
    type: DataTypes.ENUM(
      'authentication',
      'authorization',
      'data_protection',
      'network_security',
      'application_security',
      'monitoring',
      'compliance',
      'backup_recovery'
    ),
    allowNull: false
  },
  settingKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  settingName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  settingType: {
    type: DataTypes.ENUM('boolean', 'string', 'number', 'json', 'array'),
    defaultValue: 'boolean'
  },
  settingValue: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'JSON string containing the actual value'
  },
  defaultValue: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  validationRules: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Validation rules for the setting value'
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  requiresRestart: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastModifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  lastModifiedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  auditTrail: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'History of changes with timestamps and user info'
  }
}, {
  tableName: 'SecuritySettings',
  indexes: [
    {
      fields: ['category', 'isEnabled'],
      name: 'security_settings_category_enabled'
    },
    {
      fields: ['settingKey'],
      name: 'security_settings_key'
    },
    {
      fields: ['requiresRestart'],
      name: 'security_settings_restart_required'
    }
  ],
  hooks: {
    beforeUpdate: (settings) => {
      // Track changes in audit trail
      const changes = settings.changed();
      if (changes && changes.length > 0) {
        const currentAudit = settings.auditTrail || [];
        const newEntry = {
          timestamp: new Date(),
          changedFields: changes,
          previousValues: {},
          newValues: {}
        };

        changes.forEach(field => {
          newEntry.previousValues[field] = settings.previous(field);
          newEntry.newValues[field] = settings.get(field);
        });

        settings.auditTrail = [...currentAudit, newEntry];
      }
    }
  }
});

// Default security settings
const defaultSettings = [
  // Authentication Settings
  {
    category: 'authentication',
    settingKey: 'mfa_required',
    settingName: 'Multi-Factor Authentication Required',
    description: 'Require MFA for all user accounts',
    settingType: 'boolean',
    settingValue: 'false',
    defaultValue: 'false',
    requiresRestart: false
  },
  {
    category: 'authentication',
    settingKey: 'password_min_length',
    settingName: 'Minimum Password Length',
    description: 'Minimum number of characters required for passwords',
    settingType: 'number',
    settingValue: '8',
    defaultValue: '8',
    validationRules: { min: 6, max: 128 },
    requiresRestart: false
  },
  {
    category: 'authentication',
    settingKey: 'password_complexity',
    settingName: 'Password Complexity Requirements',
    description: 'Require uppercase, lowercase, numbers, and special characters',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },
  {
    category: 'authentication',
    settingKey: 'account_lockout_threshold',
    settingName: 'Account Lockout Threshold',
    description: 'Number of failed login attempts before account lockout',
    settingType: 'number',
    settingValue: '5',
    defaultValue: '5',
    validationRules: { min: 3, max: 20 },
    requiresRestart: false
  },
  {
    category: 'authentication',
    settingKey: 'session_timeout',
    settingName: 'Session Timeout (minutes)',
    description: 'Automatic logout after period of inactivity',
    settingType: 'number',
    settingValue: '30',
    defaultValue: '30',
    validationRules: { min: 5, max: 480 },
    requiresRestart: false
  },

  // Authorization Settings
  {
    category: 'authorization',
    settingKey: 'role_based_access',
    settingName: 'Role-Based Access Control',
    description: 'Enable role-based permissions system',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: true
  },
  {
    category: 'authorization',
    settingKey: 'permission_caching',
    settingName: 'Permission Caching',
    description: 'Cache user permissions to improve performance',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },

  // Data Protection Settings
  {
    category: 'data_protection',
    settingKey: 'encrypt_sensitive_data',
    settingName: 'Encrypt Sensitive Data',
    description: 'Encrypt sensitive user data at rest',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: true
  },
  {
    category: 'data_protection',
    settingKey: 'data_retention_days',
    settingName: 'Data Retention Period (days)',
    description: 'Number of days to retain user data',
    settingType: 'number',
    settingValue: '2555', // 7 years
    defaultValue: '2555',
    validationRules: { min: 30, max: 2555 },
    requiresRestart: false
  },

  // Network Security Settings
  {
    category: 'network_security',
    settingKey: 'rate_limiting_enabled',
    settingName: 'Rate Limiting',
    description: 'Enable rate limiting to prevent abuse',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },
  {
    category: 'network_security',
    settingKey: 'rate_limit_requests',
    settingName: 'Rate Limit (requests/minute)',
    description: 'Maximum requests per minute per IP',
    settingType: 'number',
    settingValue: '100',
    defaultValue: '100',
    validationRules: { min: 10, max: 1000 },
    requiresRestart: false
  },
  {
    category: 'network_security',
    settingKey: 'ip_whitelist_enabled',
    settingName: 'IP Whitelist',
    description: 'Restrict access to specific IP addresses',
    settingType: 'boolean',
    settingValue: 'false',
    defaultValue: 'false',
    requiresRestart: false
  },

  // Application Security Settings
  {
    category: 'application_security',
    settingKey: 'csrf_protection',
    settingName: 'CSRF Protection',
    description: 'Enable Cross-Site Request Forgery protection',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: true
  },
  {
    category: 'application_security',
    settingKey: 'xss_protection',
    settingName: 'XSS Protection',
    description: 'Enable Cross-Site Scripting protection',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },
  {
    category: 'application_security',
    settingKey: 'input_validation',
    settingName: 'Input Validation',
    description: 'Validate all user inputs',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },

  // Monitoring Settings
  {
    category: 'monitoring',
    settingKey: 'security_logging',
    settingName: 'Security Event Logging',
    description: 'Log all security-related events',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },
  {
    category: 'monitoring',
    settingKey: 'threat_detection',
    settingName: 'Real-time Threat Detection',
    description: 'Enable real-time threat detection',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },
  {
    category: 'monitoring',
    settingKey: 'alert_notifications',
    settingName: 'Security Alert Notifications',
    description: 'Send notifications for security events',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },

  // Compliance Settings
  {
    category: 'compliance',
    settingKey: 'gdpr_compliance',
    settingName: 'GDPR Compliance',
    description: 'Enable GDPR compliance features',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },
  {
    category: 'compliance',
    settingKey: 'cookie_consent',
    settingName: 'Cookie Consent Management',
    description: 'Require user consent for cookies',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },

  // Backup & Recovery Settings
  {
    category: 'backup_recovery',
    settingKey: 'automatic_backups',
    settingName: 'Automatic Backups',
    description: 'Enable automatic database backups',
    settingType: 'boolean',
    settingValue: 'true',
    defaultValue: 'true',
    requiresRestart: false
  },
  {
    category: 'backup_recovery',
    settingKey: 'backup_frequency',
    settingName: 'Backup Frequency (hours)',
    description: 'How often to create backups',
    settingType: 'number',
    settingValue: '24',
    defaultValue: '24',
    validationRules: { min: 1, max: 168 },
    requiresRestart: false
  },
  {
    category: 'backup_recovery',
    settingKey: 'backup_retention_days',
    settingName: 'Backup Retention (days)',
    description: 'How long to keep backup files',
    settingType: 'number',
    settingValue: '30',
    defaultValue: '30',
    validationRules: { min: 1, max: 365 },
    requiresRestart: false
  }
];

module.exports = { SecuritySettings, defaultSettings };