const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SecurityIncident = sequelize.define('SecurityIncident', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  incidentType: {
    type: DataTypes.ENUM(
      'brute_force_attack',
      'sql_injection',
      'xss_attack',
      'csrf_attack',
      'ddos_attack',
      'credential_stuffing',
      'phishing_attempt',
      'malware_infection',
      'data_breach',
      'unauthorized_access',
      'privilege_escalation',
      'session_hijacking',
      'man_in_middle',
      'zero_day_exploit',
      'insider_threat',
      'supply_chain_attack',
      'ransomware_attack',
      'data_exfiltration',
      'account_takeover',
      'api_abuse',
      'botnet_activity',
      'anomaly_detection'
    ),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM(
      'detected',
      'investigating',
      'contained',
      'mitigated',
      'resolved',
      'false_positive',
      'escalated'
    ),
    defaultValue: 'detected'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  affectedUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of users affected by this incident'
  },
  affectedSystems: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Systems/components affected'
  },
  attackVector: {
    type: DataTypes.ENUM(
      'web_application',
      'api_endpoint',
      'database',
      'network',
      'authentication_system',
      'file_system',
      'email_system',
      'third_party_service',
      'physical_access',
      'social_engineering',
      'supply_chain',
      'unknown'
    ),
    allowNull: true
  },
  attackerInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Attacker IP, location, user agent, etc.'
  },
  indicatorsOfCompromise: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'IOCs: file hashes, URLs, domains, etc.'
  },
  timeline: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Chronological events of the incident'
  },
  impactAssessment: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Business impact, data loss, financial impact'
  },
  responseActions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Actions taken to respond to the incident'
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent', 'critical'),
    defaultValue: 'medium'
  },
  slaBreach: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether incident response SLA was breached'
  },
  containmentTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time taken to contain the incident (minutes)'
  },
  resolutionTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time taken to resolve the incident (minutes)'
  },
  lessonsLearned: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preventionMeasures: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Recommended prevention measures'
  },
  relatedIncidents: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'IDs of related security incidents'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Tags for categorization and search'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this incident should be publicly disclosed'
  },
  publicDisclosure: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Public statement about the incident'
  },
  regulatoryReporting: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Regulatory bodies notified and their requirements'
  }
}, {
  tableName: 'SecurityIncidents',
  indexes: [
    {
      fields: ['incidentType', 'createdAt'],
      name: 'security_incidents_type_created_at'
    },
    {
      fields: ['severity', 'status'],
      name: 'security_incidents_severity_status'
    },
    {
      fields: ['status', 'createdAt'],
      name: 'security_incidents_status_created_at'
    },
    {
      fields: ['assignedTo'],
      name: 'security_incidents_assigned_to'
    },
    {
      fields: ['priority', 'status'],
      name: 'security_incidents_priority_status'
    }
  ],
  hooks: {
    beforeCreate: (incident) => {
      // Auto-generate title if not provided
      if (!incident.title) {
        incident.title = generateIncidentTitle(incident);
      }

      // Set initial timeline entry
      if (!incident.timeline) {
        incident.timeline = [{
          timestamp: new Date(),
          event: 'Incident detected',
          description: 'Security incident automatically detected by monitoring system',
          actor: 'system'
        }];
      }
    },
    beforeUpdate: (incident) => {
      // Update timeline when status changes
      const statusChanged = incident.changed('status');
      if (statusChanged) {
        const currentTimeline = incident.timeline || [];
        const newEntry = {
          timestamp: new Date(),
          event: `Status changed to ${incident.status}`,
          description: `Incident status updated from ${incident.previous('status')} to ${incident.status}`,
          actor: 'system' // In real implementation, this would be the current user
        };
        incident.timeline = [...currentTimeline, newEntry];
      }
    }
  }
});

// Helper function to generate incident title
function generateIncidentTitle(incident) {
  const typeTitles = {
    'brute_force_attack': 'Brute Force Attack Detected',
    'sql_injection': 'SQL Injection Attempt',
    'xss_attack': 'Cross-Site Scripting Attack',
    'csrf_attack': 'CSRF Attack Attempt',
    'ddos_attack': 'DDoS Attack Detected',
    'credential_stuffing': 'Credential Stuffing Attack',
    'phishing_attempt': 'Phishing Attempt Detected',
    'malware_infection': 'Malware Infection Detected',
    'data_breach': 'Potential Data Breach',
    'unauthorized_access': 'Unauthorized Access Attempt',
    'privilege_escalation': 'Privilege Escalation Attempt',
    'session_hijacking': 'Session Hijacking Attempt',
    'man_in_middle': 'Man-in-the-Middle Attack',
    'zero_day_exploit': 'Zero-Day Exploit Detected',
    'insider_threat': 'Potential Insider Threat',
    'supply_chain_attack': 'Supply Chain Attack Detected',
    'ransomware_attack': 'Ransomware Attack Detected',
    'data_exfiltration': 'Data Exfiltration Attempt',
    'account_takeover': 'Account Takeover Attempt',
    'api_abuse': 'API Abuse Detected',
    'botnet_activity': 'Botnet Activity Detected',
    'anomaly_detection': 'Security Anomaly Detected'
  };

  return typeTitles[incident.incidentType] || 'Security Incident Detected';
}

module.exports = SecurityIncident;