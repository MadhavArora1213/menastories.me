const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9-]+$/i
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 2000]
    }
  },
  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 300]
    }
  },
  eventType: {
    type: DataTypes.ENUM(
      'conference',
      'seminar',
      'workshop',
      'networking',
      'trade_show',
      'award_show',
      'concert',
      'festival',
      'exhibition',
      'charity_gala',
      'masterclass',
      'fashion_show',
      'wellness_event',
      'food_festival',
      'travel_expo',
      'cultural_event',
      'community_event',
      'fundraiser',
      'show'
    ),
    allowNull: false,
    defaultValue: 'conference'
  },
  category: {
    type: DataTypes.ENUM(
      'business',
      'entertainment',
      'cultural',
      'social',
      'educational',
      'fashion',
      'lifestyle',
      'technology',
      'health',
      'sports'
    ),
    allowNull: false,
    defaultValue: 'business'
  },
  status: {
    type: DataTypes.ENUM(
      'draft',
      'pending_review',
      'published',
      'cancelled',
      'postponed',
      'completed',
      'rejected'
    ),
    allowNull: false,
    defaultValue: 'draft'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'UTC'
  },
  venue: {
    type: DataTypes.JSON, // { name, address, city, country, coordinates, capacity }
    allowNull: true,
    defaultValue: {}
  },
  isVirtual: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  virtualDetails: {
    type: DataTypes.JSON, // { platform, meetingLink, accessCode, recordingUrl }
    allowNull: true,
    defaultValue: {}
  },
  isHybrid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  registrationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  ticketTypes: {
    type: DataTypes.JSON, // Array of ticket types with pricing
    allowNull: true,
    defaultValue: []
  },
  agenda: {
    type: DataTypes.JSON, // Array of sessions/schedule items
    allowNull: true,
    defaultValue: []
  },
  speakers: {
    type: DataTypes.JSON, // Array of speaker information
    allowNull: true,
    defaultValue: []
  },
  sponsors: {
    type: DataTypes.JSON, // Array of sponsor information
    allowNull: true,
    defaultValue: []
  },
  exhibitors: {
    type: DataTypes.JSON, // Array of exhibitor information
    allowNull: true,
    defaultValue: []
  },
  mediaAssets: {
    type: DataTypes.JSON, // { banner, logo, gallery, videos }
    allowNull: true,
    defaultValue: {}
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  socialLinks: {
    type: DataTypes.JSON, // { website, facebook, twitter, instagram, linkedin }
    allowNull: true,
    defaultValue: {}
  },
  contactInfo: {
    type: DataTypes.JSON, // { email, phone, organizer }
    allowNull: true,
    defaultValue: {}
  },
  registrationSettings: {
    type: DataTypes.JSON, // { requireApproval, allowWaitlist, maxTicketsPerPerson }
    allowNull: true,
    defaultValue: {}
  },
  // Additional fields from Excel import
  eventLocationNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  emirate: {
    type: DataTypes.ENUM('Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'),
    allowNull: true
  },
  eventLocationName: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  locationLink: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  eventVenueLink: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  eventWebsite: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  eventSubLocation: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  industry: {
    type: DataTypes.ENUM(
      'Paper, Packaging and Printing',
      'Printing and signage',
      'Web 3 / Blockchain / Crypto',
      'Real Estate',
      'Lifestyle (Yacht)',
      'Lifestyle (Watches and Jewelery / Jewellery and gems)',
      'Lifestyle (Beauty and Cosmetics)',
      'Banking and Capital Markets',
      'Future',
      'Technology',
      'Healthcare',
      'Education',
      'Entertainment',
      'Sports',
      'Other'
    ),
    allowNull: true
  },
  audience: {
    type: DataTypes.ENUM('Trade and Public', 'Trade', 'Public', 'Not mentioned'),
    allowNull: true,
    defaultValue: 'Not mentioned'
  },
  eventOrganisedBy: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  eventOrganisedByWebsite: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  eventManagedBy: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  eventSupportedBy: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  eventRegistrationLink: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  eventRegistrationCharges: {
    type: DataTypes.ENUM('Free', 'Paid', 'Free / Paid'),
    allowNull: true,
    defaultValue: 'Free'
  },
  mediaPartners: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  eventLinkedIn: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  eventInstagram: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  eventContactNumbers: {
    type: DataTypes.JSON, // Array of contact numbers
    allowNull: true,
    defaultValue: []
  },
  eventWhatsappNumbers: {
    type: DataTypes.JSON, // Array of WhatsApp numbers
    allowNull: true,
    defaultValue: []
  },
  eventContactEmails: {
    type: DataTypes.JSON, // Array of contact emails
    allowNull: true,
    defaultValue: []
  },
  eventContactTelegram: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  remarks1: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  remarks2: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  allowRegistration: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  requireRegistration: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  registrationCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  attendeeCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  seoTitle: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  seoDescription: {
    type: DataTypes.STRING(160),
    allowNull: true
  },
  canonicalUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  submittedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isUserSubmitted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'events',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slug']
    },
    {
      fields: ['eventType']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['startDate']
    },
    {
      fields: ['endDate']
    },
    {
      fields: ['isVirtual']
    },
    {
      fields: ['isFeatured']
    },
    {
      fields: ['isPublic']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['submittedBy']
    },
    {
      fields: ['isUserSubmitted']
    },
    {
      fields: ['reviewedBy']
    },
    {
      fields: ['viewCount']
    }
  ]
});

// Instance methods
Event.prototype.incrementViews = async function() {
  this.viewCount += 1;
  return this.save();
};

Event.prototype.incrementRegistrations = async function() {
  this.registrationCount += 1;
  return this.save();
};

Event.prototype.incrementAttendees = async function() {
  this.attendeeCount += 1;
  return this.save();
};

Event.prototype.getEventStatus = function() {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);

  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'postponed') return 'postponed';
  if (now < startDate) return 'upcoming';
  if (now >= startDate && now <= endDate) return 'ongoing';
  if (now > endDate) return 'completed';

  return 'unknown';
};

Event.prototype.getAvailableCapacity = function() {
  if (!this.capacity) return null;
  return Math.max(0, this.capacity - this.registrationCount);
};

Event.prototype.isRegistrationOpen = function() {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const deadline = this.registrationDeadline ? new Date(this.registrationDeadline) : null;

  return (
    this.allowRegistration &&
    this.status === 'published' &&
    now < startDate &&
    (!deadline || now <= deadline) &&
    (!this.capacity || this.getAvailableCapacity() > 0)
  );
};

Event.prototype.getShareUrl = function() {
  return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${this.slug}`;
};

Event.prototype.getEmbedCode = function(options = {}) {
  const {
    width = '100%',
    height = '600px',
    showDetails = true
  } = options;

  return `<iframe
    src="${this.getShareUrl()}?embed=true"
    width="${width}"
    height="${height}"
    frameborder="0"
    allowfullscreen
    ${showDetails ? '' : 'data-hide-details="true"'}
  ></iframe>`;
};

Event.prototype.addToAgenda = async function(session) {
  const agenda = [...(this.agenda || [])];
  agenda.push({
    id: session.id || Date.now().toString(),
    title: session.title,
    description: session.description,
    startTime: session.startTime,
    endTime: session.endTime,
    speaker: session.speaker,
    location: session.location,
    type: session.type || 'session',
    ...session
  });
  this.agenda = agenda;
  return this.save();
};

Event.prototype.addSpeaker = async function(speaker) {
  const speakers = [...(this.speakers || [])];
  speakers.push({
    id: speaker.id || Date.now().toString(),
    name: speaker.name,
    title: speaker.title,
    company: speaker.company,
    bio: speaker.bio,
    photo: speaker.photo,
    socialLinks: speaker.socialLinks,
    sessions: speaker.sessions || [],
    ...speaker
  });
  this.speakers = speakers;
  return this.save();
};

module.exports = Event;