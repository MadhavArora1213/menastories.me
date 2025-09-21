const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EventRegistration = sequelize.define('EventRegistration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Temporarily allow null to avoid FK constraint issues
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  ticketType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'general'
  },
  ticketId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  qrCode: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  registrationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'confirmed',
      'cancelled',
      'refunded',
      'attended',
      'no_show'
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM(
      'pending',
      'paid',
      'failed',
      'refunded',
      'cancelled'
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  attendeeInfo: {
    type: DataTypes.JSON, // { name, email, phone, company, title, dietaryRestrictions, accessibilityNeeds }
    allowNull: true,
    defaultValue: {}
  },
  customFields: {
    type: DataTypes.JSON, // Additional custom fields from registration form
    allowNull: true,
    defaultValue: {}
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkInMethod: {
    type: DataTypes.ENUM(
      'qr_code',
      'manual',
      'rfid',
      'facial_recognition'
    ),
    allowNull: true
  },
  checkedInBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  feedback: {
    type: DataTypes.JSON, // { rating, comments, suggestions }
    allowNull: true,
    defaultValue: {}
  },
  networkingOptIn: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  emailUpdates: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  dietaryRestrictions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  accessibilityNeeds: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.JSON, // { name, phone, relationship }
    allowNull: true,
    defaultValue: {}
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referralSource: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  marketingConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  waitlistPosition: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isWaitlisted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  cancellationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  refundDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'event_registrations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['ticketId']
    },
    {
      fields: ['eventId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['paymentStatus']
    },
    {
      fields: ['registrationDate']
    },
    {
      fields: ['checkInTime']
    },
    {
      fields: ['isWaitlisted']
    },
    {
      fields: ['waitlistPosition']
    }
  ]
});

// Instance methods
EventRegistration.prototype.generateTicketId = function() {
  const eventPrefix = this.eventId.substring(0, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  this.ticketId = `${eventPrefix}-${timestamp}-${random}`;
};

EventRegistration.prototype.generateQRCode = async function() {
  // Generate QR code data URL
  const qrData = JSON.stringify({
    ticketId: this.ticketId,
    eventId: this.eventId,
    userId: this.userId,
    registrationId: this.id
  });

  // In a real implementation, you'd use a QR code library
  // For now, we'll store the data that would be encoded
  this.qrCode = `data:application/json;base64,${Buffer.from(qrData).toString('base64')}`;
  return this.save();
};

EventRegistration.prototype.checkIn = async function(checkInMethod = 'manual', checkedInBy = null) {
  this.checkInTime = new Date();
  this.checkInMethod = checkInMethod;
  this.checkedInBy = checkedInBy;
  this.status = 'attended';
  return this.save();
};

EventRegistration.prototype.cancel = async function(reason = null) {
  this.cancellationDate = new Date();
  this.cancellationReason = reason;
  this.status = 'cancelled';
  this.paymentStatus = 'cancelled';
  return this.save();
};

EventRegistration.prototype.refund = async function(amount = null) {
  this.refundDate = new Date();
  this.refundAmount = amount || this.paymentAmount;
  this.paymentStatus = 'refunded';
  return this.save();
};

EventRegistration.prototype.submitFeedback = async function(feedback) {
  this.feedback = {
    ...this.feedback,
    ...feedback,
    submittedAt: new Date()
  };
  return this.save();
};

EventRegistration.prototype.moveToWaitlist = async function(position) {
  this.isWaitlisted = true;
  this.waitlistPosition = position;
  this.status = 'pending';
  return this.save();
};

EventRegistration.prototype.upgradeFromWaitlist = async function() {
  this.isWaitlisted = false;
  this.waitlistPosition = null;
  this.status = 'confirmed';
  return this.save();
};

EventRegistration.prototype.getTicketUrl = function() {
  return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/ticket/${this.ticketId}`;
};

EventRegistration.prototype.getQRCodeUrl = function() {
  return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/events/registration/${this.id}/qrcode`;
};

EventRegistration.prototype.sendConfirmationEmail = async function() {
  // Implementation would send confirmation email
  // This would integrate with your email service
  console.log(`Sending confirmation email for ticket ${this.ticketId}`);
};

EventRegistration.prototype.sendReminderEmail = async function() {
  // Implementation would send reminder email
  // This would integrate with your email service
  console.log(`Sending reminder email for ticket ${this.ticketId}`);
};

EventRegistration.prototype.sendCancellationEmail = async function() {
  // Implementation would send cancellation email
  // This would integrate with your email service
  console.log(`Sending cancellation email for ticket ${this.ticketId}`);
};

// Static methods
EventRegistration.getEventRegistrations = async function(eventId, options = {}) {
  const {
    status,
    paymentStatus,
    page = 1,
    limit = 50,
    includeUser = true
  } = options;

  const offset = (page - 1) * limit;
  const whereClause = { eventId };

  if (status) whereClause.status = status;
  if (paymentStatus) whereClause.paymentStatus = paymentStatus;

  const include = [];
  if (includeUser) {
    include.push({
      model: require('./User'),
      as: 'user',
      attributes: ['id', 'username', 'email', 'displayName', 'avatar']
    });
  }

  return await this.findAndCountAll({
    where: whereClause,
    include,
    order: [['registrationDate', 'DESC']],
    limit,
    offset
  });
};

EventRegistration.getUserRegistrations = async function(userId, options = {}) {
  const {
    status,
    upcoming = false,
    page = 1,
    limit = 20,
    includeEvent = true
  } = options;

  const offset = (page - 1) * limit;
  const whereClause = { userId };

  if (status) whereClause.status = status;

  const include = [];
  if (includeEvent) {
    include.push({
      model: require('./Event'),
      as: 'event',
      where: upcoming ? {
        startDate: {
          [require('sequelize').Op.gt]: new Date()
        }
      } : undefined
    });
  }

  return await this.findAndCountAll({
    where: whereClause,
    include,
    order: [['registrationDate', 'DESC']],
    limit,
    offset
  });
};

EventRegistration.getWaitlist = async function(eventId) {
  return await this.findAll({
    where: {
      eventId,
      isWaitlisted: true,
      status: 'pending'
    },
    order: [['waitlistPosition', 'ASC']]
  });
};

EventRegistration.checkInByTicketId = async function(ticketId, checkInMethod = 'qr_code', checkedInBy = null) {
  const registration = await this.findOne({
    where: { ticketId }
  });

  if (!registration) {
    throw new Error('Registration not found');
  }

  if (registration.status === 'attended') {
    throw new Error('Already checked in');
  }

  return await registration.checkIn(checkInMethod, checkedInBy);
};

module.exports = EventRegistration;