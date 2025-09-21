const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ThreatIntelligence = sequelize.define('ThreatIntelligence', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  intelligenceType: {
    type: DataTypes.ENUM(
      'ip_address',
      'domain',
      'url',
      'email',
      'file_hash',
      'malware_signature',
      'vulnerability',
      'exploit',
      'attack_pattern',
      'threat_actor',
      'campaign',
      'indicator_of_compromise',
      'security_advisory'
    ),
    allowNull: false
  },
  source: {
    type: DataTypes.ENUM(
      'internal_detection',
      'external_feed',
      'manual_research',
      'honeypot',
      'threat_exchange',
      'security_vendor',
      'government_agency',
      'open_source_intelligence',
      'dark_web_monitoring',
      'crowdsourced'
    ),
    allowNull: false
  },
  confidence: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
    defaultValue: 'medium'
  },
  severity: {
    type: DataTypes.ENUM('info', 'low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  indicator: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'The actual threat indicator (IP, domain, hash, etc.)'
  },
  indicatorType: {
    type: DataTypes.ENUM(
      'ipv4',
      'ipv6',
      'domain',
      'url',
      'email_address',
      'md5',
      'sha1',
      'sha256',
      'sha512',
      'file_path',
      'registry_key',
      'mutex',
      'user_agent',
      'asn',
      'cve_id',
      'attack_pattern_id'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  context: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional context about the threat indicator'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Tags for categorization and search'
  },
  threatActor: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Associated threat actor group'
  },
  campaign: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Associated campaign name'
  },
  malwareFamily: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Associated malware family'
  },
  cve: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Associated CVE identifier'
  },
  mitreTactic: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'MITRE ATT&CK tactics'
  },
  mitreTechnique: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'MITRE ATT&CK techniques'
  },
  firstSeen: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'First time this indicator was observed'
  },
  lastSeen: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time this indicator was observed'
  },
  observationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Number of times this indicator has been observed'
  },
  geographicData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Geographic distribution of observations'
  },
  targetIndustries: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Industries targeted by this threat'
  },
  affectedSystems: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Systems affected by this threat'
  },
  mitigationSteps: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Recommended mitigation steps'
  },
  references: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'External references and sources'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When this intelligence expires/becomes stale'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this intelligence is still active'
  },
  falsePositiveRate: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    comment: 'Calculated false positive rate'
  },
  impactScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Calculated impact score (0-100)'
  },
  riskScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Calculated risk score (0-100)'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional metadata from the source'
  }
}, {
  tableName: 'ThreatIntelligence',
  indexes: [
    {
      fields: ['intelligenceType', 'indicatorType'],
      name: 'threat_intelligence_type_indicator'
    },
    {
      fields: ['indicator'],
      name: 'threat_intelligence_indicator'
    },
    {
      fields: ['source', 'createdAt'],
      name: 'threat_intelligence_source_created_at'
    },
    {
      fields: ['severity', 'confidence'],
      name: 'threat_intelligence_severity_confidence'
    },
    {
      fields: ['isActive', 'expiresAt'],
      name: 'threat_intelligence_active_expires'
    },
    {
      fields: ['threatActor'],
      name: 'threat_intelligence_actor'
    },
    {
      fields: ['cve'],
      name: 'threat_intelligence_cve'
    }
  ],
  hooks: {
    beforeCreate: (intelligence) => {
      // Auto-calculate risk score
      if (!intelligence.riskScore) {
        intelligence.riskScore = calculateRiskScore(intelligence);
      }

      // Auto-calculate impact score
      if (!intelligence.impactScore) {
        intelligence.impactScore = calculateImpactScore(intelligence);
      }

      // Set expiration date if not provided
      if (!intelligence.expiresAt) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days
        intelligence.expiresAt = expiresAt;
      }
    },
    beforeUpdate: (intelligence) => {
      // Update observation count
      if (intelligence.changed('lastSeen')) {
        intelligence.observationCount = (intelligence.observationCount || 0) + 1;
      }
    }
  }
});

// Helper function to calculate risk score
function calculateRiskScore(intelligence) {
  let score = 50; // Base score

  // Severity multiplier
  const severityMultiplier = {
    'info': 0.5,
    'low': 0.7,
    'medium': 1.0,
    'high': 1.3,
    'critical': 1.5
  };

  score *= severityMultiplier[intelligence.severity] || 1.0;

  // Confidence multiplier
  const confidenceMultiplier = {
    'low': 0.7,
    'medium': 1.0,
    'high': 1.2,
    'very_high': 1.4
  };

  score *= confidenceMultiplier[intelligence.confidence] || 1.0;

  // Intelligence type weight
  const typeWeights = {
    'ip_address': 1.0,
    'domain': 1.1,
    'url': 1.2,
    'email': 0.9,
    'file_hash': 1.3,
    'malware_signature': 1.4,
    'vulnerability': 1.2,
    'exploit': 1.5,
    'attack_pattern': 1.1,
    'threat_actor': 1.3,
    'campaign': 1.2,
    'indicator_of_compromise': 1.4,
    'security_advisory': 0.8
  };

  score *= typeWeights[intelligence.intelligenceType] || 1.0;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

// Helper function to calculate impact score
function calculateImpactScore(intelligence) {
  let score = 30; // Base score

  // Intelligence type impact
  const typeImpacts = {
    'ip_address': 40,
    'domain': 50,
    'url': 60,
    'email': 30,
    'file_hash': 70,
    'malware_signature': 80,
    'vulnerability': 60,
    'exploit': 90,
    'attack_pattern': 50,
    'threat_actor': 70,
    'campaign': 60,
    'indicator_of_compromise': 80,
    'security_advisory': 40
  };

  score = typeImpacts[intelligence.intelligenceType] || score;

  // Adjust based on severity
  const severityAdjustments = {
    'info': -20,
    'low': -10,
    'medium': 0,
    'high': 10,
    'critical': 20
  };

  score += severityAdjustments[intelligence.severity] || 0;

  return Math.min(Math.max(score, 0), 100);
}

module.exports = ThreatIntelligence;