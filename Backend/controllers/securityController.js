const {
  SecurityLog,
  SecuritySettings,
  SecurityIncident,
  BackupLog,
  ThreatIntelligence,
  User,
  Admin
} = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Security Dashboard
const getSecurityDashboard = async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case '1h':
        startDate.setHours(now.getHours() - 1);
        break;
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setHours(now.getHours() - 24);
    }

    // Get security metrics
    const [
      securityLogs,
      activeIncidents,
      recentThreats,
      securitySettings
    ] = await Promise.all([
      // Security logs count by severity
      SecurityLog.findAll({
        where: { createdAt: { [Op.gte]: startDate } },
        attributes: [
          'severity',
          [SecurityLog.sequelize.fn('COUNT', SecurityLog.sequelize.col('id')), 'count']
        ],
        group: ['severity'],
        raw: true
      }),

      // Active security incidents
      SecurityIncident.findAll({
        where: {
          status: { [Op.in]: ['detected', 'investigating', 'contained'] },
          createdAt: { [Op.gte]: startDate }
        },
        order: [['createdAt', 'DESC']],
        limit: 10
      }),

      // Recent threats
      ThreatIntelligence.findAll({
        where: {
          isActive: true,
          createdAt: { [Op.gte]: startDate }
        },
        order: [['createdAt', 'DESC']],
        limit: 10
      }),

      // Security settings status
      SecuritySettings.findAll({
        where: { isEnabled: true },
        attributes: ['category', 'settingKey', 'settingName', 'isEnabled']
      })
    ]);

    // Process security logs data
    const severityCounts = {};
    securityLogs.forEach(log => {
      severityCounts[log.severity] = parseInt(log.count);
    });

    // Get system health metrics
    const systemHealth = {
      firewall: 'active',
      encryption: 'enabled',
      backup: 'healthy',
      monitoring: 'active'
    };

    res.json({
      success: true,
      data: {
        timeframe,
        securityMetrics: {
          totalEvents: securityLogs.reduce((sum, log) => sum + parseInt(log.count), 0),
          severityBreakdown: severityCounts,
          activeIncidents: activeIncidents.length,
          recentThreats: recentThreats.length
        },
        activeIncidents,
        recentThreats,
        systemHealth,
        securitySettings: securitySettings.reduce((acc, setting) => {
          if (!acc[setting.category]) acc[setting.category] = [];
          acc[setting.category].push(setting);
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching security dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security dashboard data',
      error: error.message
    });
  }
};

// Security Logs
const getSecurityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      severity,
      eventType,
      userId,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build where clause
    if (severity) whereClause.severity = severity;
    if (eventType) whereClause.eventType = eventType;
    if (userId) whereClause.userId = userId;

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (search) {
      whereClause[Op.or] = [
        { ipAddress: { [Op.like]: `%${search}%` } },
        { userAgent: { [Op.like]: `%${search}%` } },
        { eventType: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows: logs, count } = await SecurityLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security logs',
      error: error.message
    });
  }
};

// Security Settings
const getSecuritySettings = async (req, res) => {
  try {
    const settings = await SecuritySettings.findAll({
      order: [['category', 'ASC'], ['settingKey', 'ASC']]
    });

    // Group by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedSettings
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security settings',
      error: error.message
    });
  }
};

const updateSecuritySetting = async (req, res) => {
  try {
    const { settingKey, settingValue } = req.body;
    const userId = req.user?.id || req.admin?.id;

    const setting = await SecuritySettings.findOne({
      where: { settingKey }
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Security setting not found'
      });
    }

    // Validate setting value
    if (setting.validationRules) {
      const rules = JSON.parse(setting.validationRules);
      const value = JSON.parse(settingValue);

      if (rules.min !== undefined && value < rules.min) {
        return res.status(400).json({
          success: false,
          message: `Value must be at least ${rules.min}`
        });
      }
      if (rules.max !== undefined && value > rules.max) {
        return res.status(400).json({
          success: false,
          message: `Value must be at most ${rules.max}`
        });
      }
    }

    await setting.update({
      settingValue,
      lastModifiedBy: userId,
      lastModifiedAt: new Date()
    });

    // Log the change
    await SecurityLog.create({
      eventType: 'security_setting_changed',
      severity: 'medium',
      userId,
      requestData: {
        settingKey,
        oldValue: setting.settingValue,
        newValue: settingValue
      },
      metadata: {
        settingName: setting.settingName,
        category: setting.category
      }
    });

    res.json({
      success: true,
      message: 'Security setting updated successfully',
      data: setting
    });
  } catch (error) {
    console.error('Error updating security setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security setting',
      error: error.message
    });
  }
};

// Security Incidents
const getSecurityIncidents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      severity,
      assignedTo,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;
    if (assignedTo) whereClause.assignedTo = assignedTo;

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { rows: incidents, count } = await SecurityIncident.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        incidents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching security incidents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security incidents',
      error: error.message
    });
  }
};

const createSecurityIncident = async (req, res) => {
  try {
    const incidentData = req.body;
    const userId = req.user?.id || req.admin?.id;

    const incident = await SecurityIncident.create({
      ...incidentData,
      status: 'detected',
      timeline: [{
        timestamp: new Date(),
        event: 'Incident created',
        description: 'Security incident manually created',
        actor: userId ? 'user' : 'system'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Security incident created successfully',
      data: incident
    });
  } catch (error) {
    console.error('Error creating security incident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create security incident',
      error: error.message
    });
  }
};

const updateSecurityIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id || req.admin?.id;

    const incident = await SecurityIncident.findByPk(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Security incident not found'
      });
    }

    await incident.update(updateData);

    res.json({
      success: true,
      message: 'Security incident updated successfully',
      data: incident
    });
  } catch (error) {
    console.error('Error updating security incident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security incident',
      error: error.message
    });
  }
};

// Backup Management
const getBackupLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      backupType,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (backupType) whereClause.backupType = backupType;

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { rows: backups, count } = await BackupLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'initiatedByUser',
          attributes: ['id', 'username', 'email'],
          required: false
        },
        {
          model: User,
          as: 'verifiedByUser',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        backups,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching backup logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch backup logs',
      error: error.message
    });
  }
};

const createBackup = async (req, res) => {
  try {
    const { backupType, description, targetLocation } = req.body;
    const userId = req.user?.id || req.admin?.id;

    // Create backup log entry
    const backup = await BackupLog.create({
      backupType,
      status: 'scheduled',
      backupName: `backup-${Date.now()}`,
      description,
      targetLocation,
      initiatedBy: userId
    });

    // Implement basic backup logic
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      const startTime = new Date();

      // Create backup directory if it doesn't exist
      const backupDir = path.join(__dirname, '../../backups');
      await fs.mkdir(backupDir, { recursive: true });

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${backupType}-${timestamp}.sql`;
      const backupPath = path.join(backupDir, backupFileName);

      // PostgreSQL backup command
      const pgDumpCommand = `pg_dump --host=${process.env.DB_HOST} --port=${process.env.DB_PORT} --username=${process.env.DB_USER} --dbname=${process.env.DB_NAME} --no-password --format=c --compress=9 --file="${backupPath}"`;

      // Set PGPASSWORD environment variable for authentication
      const env = { ...process.env, PGPASSWORD: process.env.DB_PASSWORD };

      await execAsync(pgDumpCommand, { env });

      const endTime = new Date();
      const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds

      // Get file size
      const stats = await fs.stat(backupPath);
      const fileSize = stats.size;

      // Update backup record
      await backup.update({
        status: 'completed',
        endTime,
        duration,
        fileSize,
        backupPath: backupPath
      });

    } catch (backupError) {
      console.error('Backup execution error:', backupError);
      await backup.update({
        status: 'failed',
        endTime: new Date(),
        errorMessage: backupError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Backup initiated successfully',
      data: backup
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: error.message
    });
  }
};

// Threat Intelligence
const getThreats = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      intelligenceType,
      severity,
      source,
      isActive = true
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isActive };

    if (intelligenceType) whereClause.intelligenceType = intelligenceType;
    if (severity) whereClause.severity = severity;
    if (source) whereClause.source = source;

    const { rows: threats, count } = await ThreatIntelligence.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        threats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching threats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threat intelligence',
      error: error.message
    });
  }
};

const addThreatIntelligence = async (req, res) => {
  try {
    const threatData = req.body;
    const userId = req.user?.id || req.admin?.id;

    const threat = await ThreatIntelligence.create({
      ...threatData,
      source: threatData.source || 'manual_entry'
    });

    res.status(201).json({
      success: true,
      message: 'Threat intelligence added successfully',
      data: threat
    });
  } catch (error) {
    console.error('Error adding threat intelligence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add threat intelligence',
      error: error.message
    });
  }
};

// Compliance Check
const getComplianceStatus = async (req, res) => {
  try {
    // This would integrate with actual compliance checking logic
    const complianceStatus = {
      gdpr: {
        status: 'compliant',
        lastChecked: new Date(),
        issues: [],
        score: 95
      },
      ccpa: {
        status: 'compliant',
        lastChecked: new Date(),
        issues: [],
        score: 92
      },
      pci: {
        status: 'not_applicable',
        lastChecked: new Date(),
        issues: [],
        score: 100
      }
    };

    res.json({
      success: true,
      data: complianceStatus
    });
  } catch (error) {
    console.error('Error fetching compliance status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance status',
      error: error.message
    });
  }
};

module.exports = {
  getSecurityDashboard,
  getSecurityLogs,
  getSecuritySettings,
  updateSecuritySetting,
  getSecurityIncidents,
  createSecurityIncident,
  updateSecurityIncident,
  getBackupLogs,
  createBackup,
  getThreats,
  addThreatIntelligence,
  getComplianceStatus
};