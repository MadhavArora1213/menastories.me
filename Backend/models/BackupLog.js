const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BackupLog = sequelize.define('BackupLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  backupType: {
    type: DataTypes.ENUM(
      'full_database',
      'incremental_database',
      'differential_database',
      'file_system',
      'configuration',
      'user_data',
      'media_files',
      'logs',
      'security_data',
      'manual_backup',
      'automated_backup',
      'emergency_backup'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'scheduled',
      'running',
      'completed',
      'failed',
      'cancelled',
      'partially_completed',
      'verification_pending',
      'verification_passed',
      'verification_failed'
    ),
    defaultValue: 'scheduled'
  },
  triggerType: {
    type: DataTypes.ENUM(
      'manual',
      'scheduled',
      'emergency',
      'pre_maintenance',
      'post_update',
      'security_incident',
      'data_corruption_detected'
    ),
    defaultValue: 'manual'
  },
  backupName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetLocation: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Local path or cloud storage URL'
  },
  storageType: {
    type: DataTypes.ENUM(
      'local',
      'aws_s3',
      'google_cloud',
      'azure_blob',
      'ftp',
      'sftp',
      'nfs',
      'external_drive'
    ),
    defaultValue: 'local'
  },
  compressionEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  encryptionEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  encryptionMethod: {
    type: DataTypes.ENUM(
      'aes_256',
      'aes_128',
      'blowfish',
      'twofish',
      'rsa',
      'pgp'
    ),
    defaultValue: 'aes_256'
  },
  backupSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Size in bytes'
  },
  compressedSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Compressed size in bytes'
  },
  compressionRatio: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Compression ratio (original/compressed)'
  },
  tablesIncluded: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of database tables included in backup'
  },
  filesIncluded: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'List of files/directories included in backup'
  },
  excludedItems: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Items explicitly excluded from backup'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds'
  },
  initiatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  verificationTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checksum: {
    type: DataTypes.STRING(128),
    allowNull: true,
    comment: 'SHA-256 checksum of backup file'
  },
  retentionPeriod: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Retention period in days'
  },
  retentionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when backup should be deleted'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  warningMessages: {
    type: DataTypes.JSON,
    allowNull: true
  },
  performanceMetrics: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Backup performance data: speed, throughput, etc.'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional backup metadata'
  },
  isTestRestore: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this backup has been tested for restoration'
  },
  testRestoreResult: {
    type: DataTypes.ENUM(
      'not_tested',
      'successful',
      'failed',
      'partial_success'
    ),
    defaultValue: 'not_tested'
  },
  testRestoreTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastAccessed: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time this backup was accessed'
  },
  accessCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times this backup has been accessed'
  }
}, {
  tableName: 'BackupLogs',
  indexes: [
    {
      fields: ['backupType', 'createdAt'],
      name: 'backup_logs_type_created_at'
    },
    {
      fields: ['status', 'createdAt'],
      name: 'backup_logs_status_created_at'
    },
    {
      fields: ['triggerType'],
      name: 'backup_logs_trigger_type'
    },
    {
      fields: ['retentionDate'],
      name: 'backup_logs_retention_date'
    },
    {
      fields: ['isTestRestore'],
      name: 'backup_logs_test_restore'
    }
  ],
  hooks: {
    beforeCreate: (backup) => {
      // Auto-generate backup name if not provided
      if (!backup.backupName) {
        backup.backupName = generateBackupName(backup);
      }

      // Set retention date if retention period is specified
      if (backup.retentionPeriod && !backup.retentionDate) {
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() + backup.retentionPeriod);
        backup.retentionDate = retentionDate;
      }
    },
    beforeUpdate: (backup) => {
      // Calculate duration when backup completes
      if (backup.changed('status') && backup.status === 'completed' && backup.startTime && !backup.duration) {
        const endTime = backup.endTime || new Date();
        backup.duration = Math.floor((endTime - backup.startTime) / 1000);
      }

      // Calculate compression ratio
      if (backup.backupSize && backup.compressedSize && !backup.compressionRatio) {
        backup.compressionRatio = (backup.backupSize / backup.compressedSize).toFixed(2);
      }
    }
  }
});

// Helper function to generate backup name
function generateBackupName(backup) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const typeMap = {
    'full_database': 'FULL-DB',
    'incremental_database': 'INC-DB',
    'differential_database': 'DIFF-DB',
    'file_system': 'FS',
    'configuration': 'CONFIG',
    'user_data': 'USER-DATA',
    'media_files': 'MEDIA',
    'logs': 'LOGS',
    'security_data': 'SECURITY',
    'manual_backup': 'MANUAL',
    'automated_backup': 'AUTO',
    'emergency_backup': 'EMERGENCY'
  };

  const typeCode = typeMap[backup.backupType] || 'BACKUP';
  return `${typeCode}-${timestamp}`;
}

module.exports = BackupLog;