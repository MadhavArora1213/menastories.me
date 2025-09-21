const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SecurityLog = sequelize.define('SecurityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventType: {
    type: DataTypes.ENUM(
      'login_attempt',
      'login_success',
      'login_failure',
      'logout',
      'password_change',
      'password_reset',
      'account_lockout',
      'account_unlock',
      'suspicious_activity',
      'failed_login_attempt',
      'brute_force_attempt',
      'sql_injection_attempt',
      'xss_attempt',
      'csrf_attempt',
      'file_upload_attempt',
      'unauthorized_access',
      'permission_denied',
      'data_breach_attempt',
      'malware_detected',
      'ddos_attempt',
      'rate_limit_exceeded',
      'session_hijacking_attempt',
      'man_in_middle_attempt',
      'phishing_attempt',
      'credential_stuffing',
      'api_abuse',
      'api_request',
      'api_error',
      'content_violation',
      'copyright_infringement',
      'spam_attempt',
      'bot_detection',
      'honeypot_triggered',
      'anomaly_detected',
      'security_policy_violation'
    ),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'low'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  ipAddress: {
    type: DataTypes.STRING(45), // IPv6 support
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Geolocation data: country, city, coordinates'
  },
  deviceInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Device fingerprinting data'
  },
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  requestData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Request details: method, url, headers, body'
  },
  responseData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Response details: status code, headers'
  },
  threatScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'AI-calculated threat score (0-100)'
  },
  riskLevel: {
    type: DataTypes.ENUM('none', 'low', 'medium', 'high', 'critical'),
    defaultValue: 'none'
  },
  actionTaken: {
    type: DataTypes.ENUM(
      'none',
      'logged_only',
      'user_notified',
      'account_locked',
      'ip_blocked',
      'session_terminated',
      'rate_limited',
      'content_blocked',
      'request_blocked',
      'alert_generated',
      'incident_created'
    ),
    defaultValue: 'logged_only'
  },
  incidentId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Reference to security incident if escalated'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional context-specific data'
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'SecurityLogs',
  indexes: [
    {
      fields: ['eventType', 'createdAt'],
      name: 'security_logs_event_type_created_at'
    },
    {
      fields: ['userId', 'createdAt'],
      name: 'security_logs_user_created_at'
    },
    {
      fields: ['ipAddress', 'createdAt'],
      name: 'security_logs_ip_created_at'
    },
    {
      fields: ['severity', 'createdAt'],
      name: 'security_logs_severity_created_at'
    },
    {
      fields: ['threatScore'],
      name: 'security_logs_threat_score'
    },
    {
      fields: ['resolved'],
      name: 'security_logs_resolved'
    }
  ],
  hooks: {
    beforeCreate: (log) => {
      // Auto-calculate threat score based on event type and context
      if (!log.threatScore) {
        log.threatScore = calculateThreatScore(log);
      }

      // Auto-determine risk level
      if (!log.riskLevel || log.riskLevel === 'none') {
        log.riskLevel = determineRiskLevel(log);
      }
    }
  }
});

// Helper function to calculate threat score
function calculateThreatScore(log) {
  let score = 0;

  // Base score by event type
  const eventScores = {
    'login_success': 0,
    'login_failure': 20,
    'failed_login_attempt': 30,
    'brute_force_attempt': 80,
    'sql_injection_attempt': 95,
    'xss_attempt': 90,
    'csrf_attempt': 85,
    'unauthorized_access': 75,
    'data_breach_attempt': 100,
    'malware_detected': 95,
    'ddos_attempt': 90,
    'credential_stuffing': 85,
    'phishing_attempt': 80,
    'bot_detection': 60,
    'anomaly_detected': 70
  };

  score += eventScores[log.eventType] || 10;

  // Additional factors
  if (log.ipAddress) {
    // Check for suspicious IP patterns (simplified)
    if (log.ipAddress.includes('192.168.') || log.ipAddress.includes('10.')) {
      score += 10; // Internal network access
    }
  }

  // Time-based factors
  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5) {
    score += 15; // Unusual hours
  }

  // User agent analysis
  if (log.userAgent && (
    log.userAgent.includes('bot') ||
    log.userAgent.includes('crawler') ||
    log.userAgent.includes('spider')
  )) {
    score += 20;
  }

  return Math.min(score, 100);
}

// Helper function to determine risk level
function determineRiskLevel(log) {
  const score = log.threatScore || 0;

  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'none';
}

module.exports = SecurityLog;