const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdminLoginLog = sequelize.define('AdminLoginLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM(
      'login',
      'logout',
      'failed_login',
      'password_change',
      'profile_update',
      'page_access',
      'data_modification',
      'security_event',
      'mfa_enabled',
      'mfa_disabled'
    ),
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      country: null,
      region: null,
      city: null,
      latitude: null,
      longitude: null
    }
  },
  deviceInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      browser: null,
      browserVersion: null,
      os: null,
      osVersion: null,
      device: null,
      deviceType: null
    }
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: true
  },
  method: {
    type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
    allowNull: true
  },
  requestData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  responseStatus: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  isSuspicious: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  riskScore: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 1
    }
  }
}, {
  tableName: 'AdminLoginLogs',
  indexes: [
    {
      fields: ['adminId']
    },
    {
      fields: ['action']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['ipAddress']
    },
    {
      fields: ['isSuspicious']
    },
    {
      fields: ['riskScore']
    }
  ]
});

// Instance methods
AdminLoginLog.prototype.detectSuspiciousActivity = function() {
  let riskScore = 0;
  const reasons = [];

  // Check for unusual login times (e.g., very late night)
  const hour = this.timestamp.getHours();
  if (hour >= 2 && hour <= 5) {
    riskScore += 0.3;
    reasons.push('Unusual login time');
  }

  // Check for rapid successive failed logins
  // This would require checking recent logs for the same admin

  // Check for login from unusual location
  // This would require comparing with admin's usual locations

  // Check for unusual user agent
  if (this.userAgent && this.userAgent.includes('bot')) {
    riskScore += 0.5;
    reasons.push('Bot-like user agent');
  }

  // Check for suspicious IP patterns
  if (this.ipAddress && this.ipAddress.startsWith('10.') || this.ipAddress.startsWith('192.168.')) {
    riskScore += 0.2;
    reasons.push('Private IP address');
  }

  this.riskScore = Math.min(1, riskScore);
  this.isSuspicious = this.riskScore >= 0.7;

  return {
    isSuspicious: this.isSuspicious,
    riskScore: this.riskScore,
    reasons
  };
};

AdminLoginLog.prototype.parseUserAgent = function() {
  if (!this.userAgent) return;

  // Simple user agent parsing
  const ua = this.userAgent.toLowerCase();

  let browser = 'Unknown';
  let browserVersion = 'Unknown';
  let os = 'Unknown';
  let device = 'Unknown';

  // Browser detection
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
    const match = ua.match(/edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }

  // OS detection
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }

  // Device type detection
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  } else {
    device = 'Desktop';
  }

  this.deviceInfo = {
    browser,
    browserVersion,
    os,
    device,
    deviceType: device
  };

  return this.save();
};

module.exports = AdminLoginLog;