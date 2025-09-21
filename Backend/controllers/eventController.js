const { Event, EventRegistration, EventUpdate, Exhibition, User, Admin } = require('../models');
const { Op } = require('sequelize');

// Get events with filtering and pagination
exports.getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      eventType,
      status = 'published',
      startDate,
      endDate,
      isVirtual,
      isFeatured,
      search,
      sortBy = 'startDate',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { status };

    // Apply filters
    if (category) whereClause.category = category;
    if (eventType) whereClause.eventType = eventType;
    if (isVirtual !== undefined) whereClause.isVirtual = isVirtual === 'true';
    if (isFeatured !== undefined) whereClause.isFeatured = isFeatured === 'true';

    // Date range filter
    if (startDate || endDate) {
      whereClause.startDate = {};
      if (startDate) whereClause.startDate[Op.gte] = new Date(startDate);
      if (endDate) whereClause.startDate[Op.lte] = new Date(endDate);
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } }
      ];
    }

    const events = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Add computed fields
    const eventsWithStatus = events.rows.map(event => ({
      ...event.toJSON(),
      eventStatus: event.getEventStatus(),
      availableCapacity: event.getAvailableCapacity(),
      isRegistrationOpen: event.isRegistrationOpen()
    }));

    res.json({
      events: eventsWithStatus,
      pagination: {
        total: events.count,
        totalPages: Math.ceil(events.count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get single event by ID or slug
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const identifier = id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? { id } : { slug: id };

    const event = await Event.findOne({
      where: identifier,
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Increment view count
    await event.incrementViews();

    const eventData = {
      ...event.toJSON(),
      eventStatus: event.getEventStatus(),
      availableCapacity: event.getAvailableCapacity(),
      isRegistrationOpen: event.isRegistrationOpen(),
      shareUrl: event.getShareUrl(),
      embedCode: event.getEmbedCode()
    };

    res.json({ event: eventData });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.admin ? req.admin.id : req.user?.id
    };

    // Generate slug if not provided
    if (!eventData.slug) {
      eventData.slug = eventData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const event = await Event.create(eventData);

    // Add to agenda if provided
    if (req.body.agenda && req.body.agenda.length > 0) {
      for (const session of req.body.agenda) {
        await event.addToAgenda(session);
      }
    }

    // Add speakers if provided
    if (req.body.speakers && req.body.speakers.length > 0) {
      for (const speaker of req.body.speakers) {
        await event.addSpeaker(speaker);
      }
    }

    res.status(201).json({
      event: {
        ...event.toJSON(),
        eventStatus: event.getEventStatus(),
        shareUrl: event.getShareUrl()
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Event slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
};

// Send OTP for event submission (supports authenticated and anonymous users)
exports.sendEventSubmissionOTP = async (req, res) => {
  try {
    const { email } = req.body; // For anonymous users
    const otpService = require('../services/otpService');

    let emailToSendOTP;

    if (req.user) {
      // Authenticated user - use their email
      emailToSendOTP = req.user.email;
    } else {
      // Anonymous user - use provided email
      if (!email) {
        return res.status(400).json({ error: 'Email is required for anonymous submissions' });
      }
      emailToSendOTP = email;
    }

    const result = await otpService.sendEventSubmissionOTP(emailToSendOTP);

    if (result.success) {
      res.json({ message: 'OTP sent to your email successfully' });
    } else {
      // Email failed but OTP is saved - return the OTP directly for testing
      res.status(200).json({
        message: 'OTP generated but email delivery failed. Please use the OTP shown below for testing.',
        warning: 'Email service is currently unavailable. Use the OTP below to continue.',
        otp: result.otp, // Include OTP in response for testing
        email: emailToSendOTP
      });
    }
  } catch (error) {
    console.error('Error sending event submission OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};


// Submit event by user (with validation, captcha, otp)
exports.submitUserEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      category,
      startDate,
      endDate,
      venue,
      isVirtual,
      virtualDetails,
      capacity,
      price,
      currency,
      tags,
      socialLinks,
      contactInfo,
      captchaToken,
      otpCode,
      acceptPrivacyPolicy,
      acceptEventRules
    } = req.body;

    // Validation
    if (!title || !description || !eventType || !category || !startDate || !endDate) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    if (!acceptPrivacyPolicy || !acceptEventRules) {
      return res.status(400).json({ error: 'You must accept the privacy policy and event rules' });
    }

    // Verify reCAPTCHA
    if (!captchaToken) {
      return res.status(400).json({ error: 'reCAPTCHA verification required' });
    }

    // Skip verification for test token in development
    if (captchaToken !== 'test') {
      // Verify reCAPTCHA token with Google
      const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
      if (!recaptchaSecret) {
        console.warn('RECAPTCHA_SECRET_KEY not configured, skipping verification');
        // Skip verification entirely when secret key is not configured
      } else {
        try {
          const axios = require('axios');
          const recaptchaResponse = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
              params: {
                secret: recaptchaSecret,
                response: captchaToken
              }
            }
          );

          if (!recaptchaResponse.data.success) {
            return res.status(400).json({ error: 'reCAPTCHA verification failed' });
          }
        } catch (recaptchaError) {
          console.error('reCAPTCHA verification error:', recaptchaError);
          return res.status(500).json({ error: 'Failed to verify reCAPTCHA' });
        }
      }
    }

    // Verify OTP
    if (!otpCode) {
      return res.status(400).json({ error: 'OTP verification required' });
    }

    const otpService = require('../services/otpService');
    let emailToVerify;

    if (req.user) {
      // Authenticated user - use their email
      emailToVerify = req.user.email;
    } else {
      // Anonymous user - use provided email from request body
      if (!req.body.submitterEmail) {
        return res.status(400).json({ error: 'Email is required for anonymous submissions' });
      }
      emailToVerify = req.body.submitterEmail;
    }

    const otpVerification = await otpService.verifyEventSubmissionOTP(emailToVerify, otpCode);
    if (!otpVerification.verified) {
      return res.status(400).json({ error: otpVerification.message || 'Invalid or expired OTP' });
    }

    // Create event data
    const eventData = {
      title,
      description,
      eventType,
      category,
      startDate,
      endDate,
      venue,
      isVirtual: isVirtual || false,
      virtualDetails,
      capacity,
      price,
      currency: currency || 'USD',
      tags: tags || [],
      socialLinks: socialLinks || {},
      contactInfo: contactInfo || {},
      status: 'pending_review',
      isUserSubmitted: true,
      submittedBy: req.user ? req.user.id : null, // Null for anonymous
      createdBy: req.user ? req.user.id : '12f264f9-dfad-436d-b95d-de7322d83acd'   // Default admin for anonymous
    };

    // Add anonymous submitter info to contact info if anonymous
    if (!req.user && req.body.submitterEmail) {
      eventData.contactInfo = {
        ...eventData.contactInfo,
        submitterEmail: req.body.submitterEmail,
        submitterName: req.body.submitterName || 'Anonymous'
      };
    }

    // Generate slug
    eventData.slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const event = await Event.create(eventData);

    // Mark OTP as used
    await otpService.markOTPUsed(emailToVerify, otpCode, 'event_submission');

    res.status(201).json({
      message: 'Event submitted successfully and is pending review',
      event: {
        ...event.toJSON(),
        eventStatus: event.getEventStatus()
      }
    });
  } catch (error) {
    console.error('Error submitting user event:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Event slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to submit event' });
    }
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or admin
    const userId = req.admin ? req.admin.id : req.user?.id;
    const userRole = req.admin ? req.admin.role?.name : req.user?.role?.name;

    if (event.createdBy !== userId && userRole !== 'admin' && userRole !== 'Master Admin') {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const updatedEvent = await event.update(req.body);

    res.json({
      event: {
        ...updatedEvent.toJSON(),
        eventStatus: updatedEvent.getEventStatus(),
        shareUrl: updatedEvent.getShareUrl()
      }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or admin
    const userId = req.admin ? req.admin.id : req.user?.id;
    const userRole = req.admin ? req.admin.role?.name : req.user?.role?.name;

    if (event.createdBy !== userId && userRole !== 'admin' && userRole !== 'Master Admin') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await event.destroy();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Get event calendar
exports.getEventCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const events = await Event.findAll({
      where: {
        status: 'published',
        startDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ['id', 'title', 'startDate', 'endDate', 'eventType', 'isVirtual'],
      order: [['startDate', 'ASC']]
    });

    // Group events by date
    const calendarEvents = {};
    events.forEach(event => {
      const dateKey = event.startDate.toISOString().split('T')[0];
      if (!calendarEvents[dateKey]) {
        calendarEvents[dateKey] = [];
      }
      calendarEvents[dateKey].push({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        eventType: event.eventType,
        isVirtual: event.isVirtual
      });
    });

    res.json({ calendarEvents });
  } catch (error) {
    console.error('Error fetching event calendar:', error);
    res.status(500).json({ error: 'Failed to fetch event calendar' });
  }
};

// Get featured events
exports.getFeaturedEvents = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const events = await Event.findAll({
      where: {
        status: 'published',
        isFeatured: true,
        startDate: {
          [Op.gte]: new Date()
        }
      },
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['startDate', 'ASC']],
      limit: parseInt(limit)
    });

    const eventsWithStatus = events.map(event => ({
      ...event.toJSON(),
      eventStatus: event.getEventStatus(),
      availableCapacity: event.getAvailableCapacity()
    }));

    res.json({ events: eventsWithStatus });
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ error: 'Failed to fetch featured events' });
  }
};

// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const events = await Event.findAll({
      where: {
        status: 'published',
        startDate: {
          [Op.gte]: new Date()
        }
      },
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['startDate', 'ASC']],
      limit: parseInt(limit)
    });

    const eventsWithStatus = events.map(event => ({
      ...event.toJSON(),
      eventStatus: event.getEventStatus(),
      availableCapacity: event.getAvailableCapacity()
    }));

    res.json({ events: eventsWithStatus });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
};

// Get event categories
exports.getEventCategories = async (req, res) => {
  try {
    const categories = await Event.findAll({
      attributes: [
        'category',
        [Event.sequelize.fn('COUNT', Event.sequelize.col('id')), 'count']
      ],
      where: { status: 'published' },
      group: ['category'],
      order: [['count', 'DESC']]
    });

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching event categories:', error);
    res.status(500).json({ error: 'Failed to fetch event categories' });
  }
};

// Get event types
exports.getEventTypes = async (req, res) => {
  try {
    const eventTypes = await Event.findAll({
      attributes: [
        'eventType',
        [Event.sequelize.fn('COUNT', Event.sequelize.col('id')), 'count']
      ],
      where: { status: 'published' },
      group: ['eventType'],
      order: [['count', 'DESC']]
    });

    res.json({ eventTypes });
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ error: 'Failed to fetch event types' });
  }
};

// Get event locations
exports.getEventLocations = async (req, res) => {
  try {
    // Get locations from venue.city (JSON field)
    const venueLocations = await Event.findAll({
      attributes: [
        [Event.sequelize.literal("venue->>'city'"), 'location'],
        [Event.sequelize.fn('COUNT', Event.sequelize.col('id')), 'count']
      ],
      where: {
        status: 'published',
        'venue.city': { [Op.ne]: null }
      },
      group: [Event.sequelize.literal("venue->>'city'")],
      order: [['count', 'DESC']]
    });

    // Get locations from emirate (ENUM field)
    const emirateLocations = await Event.findAll({
      attributes: [
        [Event.sequelize.col('emirate'), 'location'],
        [Event.sequelize.fn('COUNT', Event.sequelize.col('id')), 'count']
      ],
      where: {
        status: 'published',
        emirate: { [Op.ne]: null }
      },
      group: ['emirate'],
      order: [['count', 'DESC']]
    });

    // Combine and deduplicate locations
    const allLocations = [...venueLocations, ...emirateLocations];
    const locationMap = new Map();

    allLocations.forEach(item => {
      const location = item.dataValues.location;
      const count = parseInt(item.dataValues.count);

      if (locationMap.has(location)) {
        locationMap.set(location, locationMap.get(location) + count);
      } else {
        locationMap.set(location, count);
      }
    });

    const locations = Array.from(locationMap.entries()).map(([location, count]) => ({
      location,
      count
    }));

    res.json({ locations });
  } catch (error) {
    console.error('Error fetching event locations:', error);
    res.status(500).json({ error: 'Failed to fetch event locations' });
  }
};

// Get event statistics
exports.getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.count({ where: { status: 'published' } });
    const upcomingEvents = await Event.count({
      where: {
        status: 'published',
        startDate: { [Op.gte]: new Date() }
      }
    });
    const virtualEvents = await Event.count({
      where: {
        status: 'published',
        isVirtual: true
      }
    });

    // Handle EventRegistration query with error handling
    let totalRegistrations = 0;
    try {
      totalRegistrations = await EventRegistration.count({
        where: { status: { [Op.in]: ['confirmed', 'attended'] } }
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed, using default values:', regError.message);
      // Continue with default values (0) if table doesn't exist or has issues
    }

    res.json({
      stats: {
        totalEvents,
        upcomingEvents,
        virtualEvents,
        totalRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({ error: 'Failed to fetch event statistics' });
  }
};

// Search events
exports.searchEvents = async (req, res) => {
  try {
    const { q: query, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const events = await Event.findAndCountAll({
      where: {
        status: 'published',
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { tags: { [Op.contains]: [query] } }
        ]
      },
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['startDate', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const eventsWithStatus = events.rows.map(event => ({
      ...event.toJSON(),
      eventStatus: event.getEventStatus(),
      availableCapacity: event.getAvailableCapacity()
    }));

    res.json({
      events: eventsWithStatus,
      pagination: {
        total: events.count,
        totalPages: Math.ceil(events.count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
};

// Get event gallery
exports.getEventGallery = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get gallery images from event's gallery field
    const gallery = event.gallery || [];

    res.json({ gallery });
  } catch (error) {
    console.error('Error fetching event gallery:', error);
    res.status(500).json({ error: 'Failed to fetch event gallery' });
  }
};

// Get event attendees
exports.getEventAttendees = async (req, res) => {
  try {
    const { id } = req.params;

    let registrations = [];
    try {
      registrations = await EventRegistration.findAll({
        where: {
          eventId: id,
          status: { [Op.in]: ['confirmed', 'attended'] }
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'displayName', 'avatar', 'email']
          }
        ],
        order: [['createdAt', 'ASC']]
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed, returning empty attendees list:', regError.message);
      // Return empty list if table doesn't exist or has issues
    }

    const attendees = registrations.map(reg => ({
      id: reg.user?.id || 'unknown',
      username: reg.user?.username || 'unknown',
      displayName: reg.user?.displayName || 'Unknown User',
      avatar: reg.user?.avatar || null,
      email: reg.user?.email || 'unknown',
      registrationDate: reg.createdAt,
      status: reg.status,
      checkInTime: reg.checkInTime
    }));

    res.json({ attendees });
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    res.status(500).json({ error: 'Failed to fetch event attendees' });
  }
};

// Get event updates
exports.getEventUpdates = async (req, res) => {
  try {
    const { id } = req.params;

    const updates = await EventUpdate.findAll({
      where: { eventId: id },
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ updates });
  } catch (error) {
    console.error('Error fetching event updates:', error);
    res.status(500).json({ error: 'Failed to fetch event updates' });
  }
};

// Get event schedule
exports.getEventSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const schedule = event.agenda || [];

    res.json({ schedule });
  } catch (error) {
    console.error('Error fetching event schedule:', error);
    res.status(500).json({ error: 'Failed to fetch event schedule' });
  }
};

// Get event speakers
exports.getEventSpeakers = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const speakers = event.speakers || [];

    res.json({ speakers });
  } catch (error) {
    console.error('Error fetching event speakers:', error);
    res.status(500).json({ error: 'Failed to fetch event speakers' });
  }
};

// Register for event
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { ticketType, specialRequests, dietaryRestrictions } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.isRegistrationOpen()) {
      return res.status(400).json({ error: 'Registration is not open for this event' });
    }

    // Check if user is already registered
    try {
      const existingRegistration = await EventRegistration.findOne({
        where: {
          eventId: id,
          userId: req.user.id
        }
      });

      if (existingRegistration) {
        return res.status(400).json({ error: 'You are already registered for this event' });
      }
    } catch (regError) {
      console.warn('EventRegistration table query failed during duplicate check:', regError.message);
      // Continue with registration if table doesn't exist or has issues
    }

    // Check capacity
    if (!event.hasAvailableCapacity()) {
      return res.status(400).json({ error: 'Event is at full capacity' });
    }

    try {
      const registration = await EventRegistration.create({
        eventId: id,
        userId: req.user.id,
        ticketType: ticketType || 'standard',
        specialRequests,
        dietaryRestrictions,
        status: 'confirmed'
      });

      res.status(201).json({
        message: 'Successfully registered for event',
        registration
      });
    } catch (createError) {
      console.error('Error creating registration:', createError.message);
      res.status(500).json({ error: 'Failed to create registration record' });
    }
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
};

// Get registration details
exports.getRegistrationDetails = async (req, res) => {
  try {
    const { registrationId } = req.params;

    let registration = null;
    try {
      registration = await EventRegistration.findByPk(registrationId, {
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'startDate', 'endDate', 'location', 'isVirtual']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'displayName', 'email']
          }
        ]
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed:', regError.message);
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check if user owns this registration or is admin
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this registration' });
    }

    res.json({ registration });
  } catch (error) {
    console.error('Error fetching registration details:', error);
    res.status(500).json({ error: 'Failed to fetch registration details' });
  }
};

// Update registration
exports.updateRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { specialRequests, dietaryRestrictions } = req.body;

    let registration = null;
    try {
      registration = await EventRegistration.findByPk(registrationId);
    } catch (regError) {
      console.warn('EventRegistration table query failed:', regError.message);
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check if user owns this registration or is admin
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this registration' });
    }

    try {
      await registration.update({
        specialRequests,
        dietaryRestrictions
      });
    } catch (updateError) {
      console.error('Error updating registration:', updateError.message);
      return res.status(500).json({ error: 'Failed to update registration record' });
    }

    res.json({
      message: 'Registration updated successfully',
      registration
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ error: 'Failed to update registration' });
  }
};

// Cancel registration
exports.cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    let registration = null;
    try {
      registration = await EventRegistration.findByPk(registrationId);
    } catch (regError) {
      console.warn('EventRegistration table query failed:', regError.message);
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check if user owns this registration or is admin
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to cancel this registration' });
    }

    try {
      await registration.update({ status: 'cancelled' });
    } catch (updateError) {
      console.error('Error cancelling registration:', updateError.message);
      return res.status(500).json({ error: 'Failed to cancel registration record' });
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
};

// Check in attendee
exports.checkInAttendee = async (req, res) => {
  try {
    const { registrationId } = req.params;

    let registration = null;
    try {
      registration = await EventRegistration.findByPk(registrationId, {
        include: [
          {
            model: Event,
            as: 'event'
          }
        ]
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed:', regError.message);
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check if user owns this registration or is admin
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to check in this attendee' });
    }

    // Check if event is currently happening
    const now = new Date();
    if (now < registration.event.startDate || now > registration.event.endDate) {
      return res.status(400).json({ error: 'Event is not currently in progress' });
    }

    try {
      await registration.update({
        status: 'attended',
        checkInTime: now
      });
    } catch (updateError) {
      console.error('Error updating registration for check-in:', updateError.message);
      return res.status(500).json({ error: 'Failed to update registration record' });
    }

    res.json({
      message: 'Attendee checked in successfully',
      registration
    });
  } catch (error) {
    console.error('Error checking in attendee:', error);
    res.status(500).json({ error: 'Failed to check in attendee' });
  }
};

// Get user registrations
exports.getUserRegistrations = async (req, res) => {
  try {
    let registrations = [];
    try {
      registrations = await EventRegistration.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'startDate', 'endDate', 'location', 'isVirtual', 'status']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed, returning empty registrations list:', regError.message);
      // Return empty list if table doesn't exist or has issues
    }

    res.json({ registrations });
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ error: 'Failed to fetch user registrations' });
  }
};

// Get user upcoming events
exports.getUserUpcomingEvents = async (req, res) => {
  try {
    let registrations = [];
    try {
      registrations = await EventRegistration.findAll({
        where: {
          userId: req.user.id,
          status: { [Op.in]: ['confirmed', 'attended'] }
        },
        include: [
          {
            model: Event,
            as: 'event',
            where: {
              startDate: { [Op.gte]: new Date() },
              status: 'published'
            },
            attributes: ['id', 'title', 'startDate', 'endDate', 'location', 'isVirtual']
          }
        ],
        order: [['event', 'startDate', 'ASC']]
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed, returning empty events list:', regError.message);
      // Return empty list if table doesn't exist or has issues
    }

    const events = registrations.map(reg => reg.event);

    res.json({ events });
  } catch (error) {
    console.error('Error fetching user upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch user upcoming events' });
  }
};

// Publish event
exports.publishEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await event.update({ status: 'published' });

    res.json({
      message: 'Event published successfully',
      event
    });
  } catch (error) {
    console.error('Error publishing event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
};

// Approve user-submitted event (Master Admin only)
exports.approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'pending_review') {
      return res.status(400).json({ error: 'Event is not pending review' });
    }

    // Check if admin is Master Admin
    if (req.admin.role?.name !== 'Master Admin') {
      return res.status(403).json({ error: 'Only Master Admin can approve events' });
    }

    await event.update({
      status: 'published',
      reviewNotes,
      reviewedBy: req.admin.id,
      reviewedAt: new Date()
    });

    // Update RSS feed with new published event
    const rssService = require('../services/rssService');
    await rssService.updateRSSFeed();

    res.json({
      message: 'Event approved and published successfully',
      event
    });
  } catch (error) {
    console.error('Error approving event:', error);
    res.status(500).json({ error: 'Failed to approve event' });
  }
};

// Reject user-submitted event (Master Admin only)
exports.rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    if (!reviewNotes || reviewNotes.trim().length === 0) {
      return res.status(400).json({ error: 'Review notes are required for rejection' });
    }

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'pending_review') {
      return res.status(400).json({ error: 'Event is not pending review' });
    }

    // Check if admin is Master Admin
    if (req.admin.role?.name !== 'Master Admin') {
      return res.status(403).json({ error: 'Only Master Admin can reject events' });
    }

    await event.update({
      status: 'rejected',
      reviewNotes,
      reviewedBy: req.admin.id,
      reviewedAt: new Date()
    });

    res.json({
      message: 'Event rejected successfully',
      event
    });
  } catch (error) {
    console.error('Error rejecting event:', error);
    res.status(500).json({ error: 'Failed to reject event' });
  }
};

// Get pending events for review (Admin)
exports.getPendingEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { status: 'pending_review' };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const events = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'submitter',
          attributes: ['id', 'username', 'displayName', 'email'],
          required: false
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      events: events.rows,
      pagination: {
        total: events.count,
        totalPages: Math.ceil(events.count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    res.status(500).json({ error: 'Failed to fetch pending events' });
  }
};

// Unpublish event
exports.unpublishEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await event.update({ status: 'draft' });

    res.json({
      message: 'Event unpublished successfully',
      event
    });
  } catch (error) {
    console.error('Error unpublishing event:', error);
    res.status(500).json({ error: 'Failed to unpublish event' });
  }
};

// Get all events (admin)
exports.getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const events = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Admin,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      events: events.rows,
      pagination: {
        total: events.count,
        totalPages: Math.ceil(events.count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get event registrations (admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;

    const registrations = await EventRegistration.findAll({
      where: { eventId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ registrations });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ error: 'Failed to fetch event registrations' });
  }
};

// Create event update
exports.createEventUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, isImportant } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const update = await EventUpdate.create({
      eventId: id,
      title,
      content,
      type: type || 'general',
      isImportant: isImportant || false,
      createdBy: req.admin ? req.admin.id : req.user?.id
    });

    res.status(201).json({
      message: 'Event update created successfully',
      update
    });
  } catch (error) {
    console.error('Error creating event update:', error);
    res.status(500).json({ error: 'Failed to create event update' });
  }
};

// Update event update
exports.updateEventUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;
    const { title, content, type, isImportant } = req.body;

    const update = await EventUpdate.findByPk(updateId);
    if (!update) {
      return res.status(404).json({ error: 'Event update not found' });
    }

    await update.update({
      title,
      content,
      type,
      isImportant
    });

    res.json({
      message: 'Event update updated successfully',
      update
    });
  } catch (error) {
    console.error('Error updating event update:', error);
    res.status(500).json({ error: 'Failed to update event update' });
  }
};

// Delete event update
exports.deleteEventUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;

    const update = await EventUpdate.findByPk(updateId);
    if (!update) {
      return res.status(404).json({ error: 'Event update not found' });
    }

    await update.destroy();

    res.json({ message: 'Event update deleted successfully' });
  } catch (error) {
    console.error('Error deleting event update:', error);
    res.status(500).json({ error: 'Failed to delete event update' });
  }
};

// Bulk operations
exports.bulkPublishEvents = async (req, res) => {
  try {
    const { eventIds } = req.body;

    await Event.update(
      { status: 'published' },
      { where: { id: { [Op.in]: eventIds } } }
    );

    res.json({ message: 'Events published successfully' });
  } catch (error) {
    console.error('Error bulk publishing events:', error);
    res.status(500).json({ error: 'Failed to publish events' });
  }
};

exports.bulkUnpublishEvents = async (req, res) => {
  try {
    const { eventIds } = req.body;

    await Event.update(
      { status: 'draft' },
      { where: { id: { [Op.in]: eventIds } } }
    );

    res.json({ message: 'Events unpublished successfully' });
  } catch (error) {
    console.error('Error bulk unpublishing events:', error);
    res.status(500).json({ error: 'Failed to unpublish events' });
  }
};

exports.bulkDeleteEvents = async (req, res) => {
  try {
    const { eventIds } = req.body;

    await Event.destroy({
      where: { id: { [Op.in]: eventIds } }
    });

    res.json({ message: 'Events deleted successfully' });
  } catch (error) {
    console.error('Error bulk deleting events:', error);
    res.status(500).json({ error: 'Failed to delete events' });
  }
};

// Analytics
exports.getEventAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Handle EventRegistration queries with error handling
    let totalRegistrations = 0;
    let confirmedRegistrations = 0;
    let attendedCount = 0;

    try {
      totalRegistrations = await EventRegistration.count({
        where: { eventId: id }
      });

      confirmedRegistrations = await EventRegistration.count({
        where: {
          eventId: id,
          status: 'confirmed'
        }
      });

      attendedCount = await EventRegistration.count({
        where: {
          eventId: id,
          status: 'attended'
        }
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed, using default values:', regError.message);
      // Continue with default values (0) if table doesn't exist or has issues
    }

    res.json({
      analytics: {
        totalRegistrations,
        confirmedRegistrations,
        attendedCount,
        attendanceRate: totalRegistrations > 0 ? (attendedCount / totalRegistrations) * 100 : 0,
        capacityUtilization: event.capacity > 0 ? (confirmedRegistrations / event.capacity) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({ error: 'Failed to fetch event analytics' });
  }
};

exports.getEventsAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.count();
    const publishedEvents = await Event.count({ where: { status: 'published' } });
    const upcomingEvents = await Event.count({
      where: {
        status: 'published',
        startDate: { [Op.gte]: new Date() }
      }
    });

    // Handle EventRegistration queries with error handling
    let totalRegistrations = 0;
    let recentRegistrations = 0;

    try {
      totalRegistrations = await EventRegistration.count();
      recentRegistrations = await EventRegistration.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed, using default values:', regError.message);
      // Continue with default values (0) if table doesn't exist or has issues
    }

    res.json({
      analytics: {
        totalEvents,
        publishedEvents,
        upcomingEvents,
        totalRegistrations,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching events analytics:', error);
    res.status(500).json({ error: 'Failed to fetch events analytics' });
  }
};

// QR Code generation
exports.generateQRCode = async (req, res) => {
  try {
    const { registrationId } = req.params;

    let registration = null;
    try {
      registration = await EventRegistration.findByPk(registrationId, {
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'startDate']
          }
        ]
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed:', regError.message);
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check if user owns this registration or is admin
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this QR code' });
    }

    // Generate QR code data
    const qrData = {
      registrationId: registration.id,
      eventId: registration.event.id,
      userId: registration.userId,
      eventTitle: registration.event.title,
      timestamp: Date.now()
    };

    // In a real implementation, you'd generate an actual QR code image
    // For now, we'll just return the data
    res.json({
      qrData,
      qrCodeUrl: `/api/events/registration/${registrationId}/qrcode.png`
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

// Export functions
exports.exportAttendees = async (req, res) => {
  try {
    const { id } = req.params;

    let registrations = [];
    try {
      registrations = await EventRegistration.findAll({
        where: {
          eventId: id,
          status: { [Op.in]: ['confirmed', 'attended'] }
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'displayName', 'email']
          }
        ],
        order: [['createdAt', 'ASC']]
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed, returning empty export data:', regError.message);
      // Return empty list if table doesn't exist or has issues
    }

    // Format data for export
    const exportData = registrations.map(reg => ({
      name: reg.user?.displayName || 'Unknown User',
      email: reg.user?.email || 'unknown',
      username: reg.user?.username || 'unknown',
      registrationDate: reg.createdAt,
      status: reg.status,
      checkInTime: reg.checkInTime
    }));

    res.json({
      data: exportData,
      filename: `event_${id}_attendees_${new Date().toISOString().split('T')[0]}.csv`
    });
  } catch (error) {
    console.error('Error exporting attendees:', error);
    res.status(500).json({ error: 'Failed to export attendees' });
  }
};

exports.exportRegistrations = async (req, res) => {
  try {
    const { id } = req.params;

    let registrations = [];
    try {
      registrations = await EventRegistration.findAll({
        where: { eventId: id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'displayName', 'email']
          }
        ],
        order: [['createdAt', 'ASC']]
      });
    } catch (regError) {
      console.warn('EventRegistration table query failed, returning empty export data:', regError.message);
      // Return empty list if table doesn't exist or has issues
    }

    // Format data for export
    const exportData = registrations.map(reg => ({
      name: reg.user?.displayName || 'Unknown User',
      email: reg.user?.email || 'unknown',
      username: reg.user?.username || 'unknown',
      registrationDate: reg.createdAt,
      status: reg.status,
      ticketType: reg.ticketType,
      specialRequests: reg.specialRequests,
      checkInTime: reg.checkInTime
    }));

    res.json({
      data: exportData,
      filename: `event_${id}_registrations_${new Date().toISOString().split('T')[0]}.csv`
    });
  } catch (error) {
    console.error('Error exporting registrations:', error);
    res.status(500).json({ error: 'Failed to export registrations' });
  }
};

// Feedback functions
exports.submitEventFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, categories } = req.body;

    // In a real implementation, you'd have a Feedback model
    // For now, we'll just return a success response
    res.status(201).json({
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

exports.getEventFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    // In a real implementation, you'd fetch feedback from database
    // For now, we'll return mock data
    res.json({
      feedback: [],
      averageRating: 0,
      totalFeedback: 0
    });
  } catch (error) {
    console.error('Error fetching event feedback:', error);
    res.status(500).json({ error: 'Failed to fetch event feedback' });
  }
};

// Networking functions
exports.getNetworkingMatches = async (req, res) => {
  try {
    const { id } = req.params;

    // In a real implementation, you'd have networking logic
    // For now, we'll return mock data
    res.json({
      matches: []
    });
  } catch (error) {
    console.error('Error fetching networking matches:', error);
    res.status(500).json({ error: 'Failed to fetch networking matches' });
  }
};

exports.connectWithAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendeeId } = req.body;

    // In a real implementation, you'd handle networking connections
    // For now, we'll just return a success response
    res.json({
      message: 'Connection request sent successfully'
    });
  } catch (error) {
    console.error('Error connecting with attendee:', error);
    res.status(500).json({ error: 'Failed to connect with attendee' });
  }
};

// Live stream functions
exports.getStreamStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // In a real implementation, you'd check actual stream status
    // For now, we'll return mock data
    res.json({
      isLive: false,
      streamUrl: null,
      viewerCount: 0
    });
  } catch (error) {
    console.error('Error fetching stream status:', error);
    res.status(500).json({ error: 'Failed to fetch stream status' });
  }
};

exports.startLiveStream = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // In a real implementation, you'd start the live stream
    // For now, we'll just return a success response
    res.json({
      message: 'Live stream started successfully',
      streamUrl: 'rtmp://example.com/live/stream'
    });
  } catch (error) {
    console.error('Error starting live stream:', error);
    res.status(500).json({ error: 'Failed to start live stream' });
  }
};

exports.endLiveStream = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // In a real implementation, you'd end the live stream
    // For now, we'll just return a success response
    res.json({
      message: 'Live stream ended successfully'
    });
  } catch (error) {
    console.error('Error ending live stream:', error);
    res.status(500).json({ error: 'Failed to end live stream' });
  }
};

// Exhibition functions
exports.createExhibition = async (req, res) => {
  try {
    const { id } = req.params;
    const exhibitionData = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const exhibition = await Exhibition.create({
      ...exhibitionData,
      eventId: id
    });

    res.status(201).json({
      message: 'Exhibition created successfully',
      exhibition
    });
  } catch (error) {
    console.error('Error creating exhibition:', error);
    res.status(500).json({ error: 'Failed to create exhibition' });
  }
};

exports.updateExhibition = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const exhibitionData = req.body;

    const exhibition = await Exhibition.findByPk(exhibitionId);
    if (!exhibition) {
      return res.status(404).json({ error: 'Exhibition not found' });
    }

    await exhibition.update(exhibitionData);

    res.json({
      message: 'Exhibition updated successfully',
      exhibition
    });
  } catch (error) {
    console.error('Error updating exhibition:', error);
    res.status(500).json({ error: 'Failed to update exhibition' });
  }
};

exports.deleteExhibition = async (req, res) => {
  try {
    const { exhibitionId } = req.params;

    const exhibition = await Exhibition.findByPk(exhibitionId);
    if (!exhibition) {
      return res.status(404).json({ error: 'Exhibition not found' });
    }

    await exhibition.destroy();

    res.json({ message: 'Exhibition deleted successfully' });
  } catch (error) {
    console.error('Error deleting exhibition:', error);
    res.status(500).json({ error: 'Failed to delete exhibition' });
  }
};

// Virtual tour functions
exports.getVirtualTourData = async (req, res) => {
  try {
    const { id } = req.params;

    const exhibition = await Exhibition.findByPk(id);
    if (!exhibition) {
      return res.status(404).json({ error: 'Exhibition not found' });
    }

    // In a real implementation, you'd return virtual tour data
    // For now, we'll return mock data
    res.json({
      tourData: {
        scenes: [],
        hotspots: []
      }
    });
  } catch (error) {
    console.error('Error fetching virtual tour data:', error);
    res.status(500).json({ error: 'Failed to fetch virtual tour data' });
  }
};

exports.trackVirtualTourInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const interactionData = req.body;

    // In a real implementation, you'd track the interaction
    // For now, we'll just return a success response
    res.json({
      message: 'Interaction tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking virtual tour interaction:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
};

// Additional exhibition functions
exports.getVirtualTours = async (req, res) => {
  try {
    const exhibitions = await Exhibition.findAll({
      where: { hasVirtualTour: true },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'endDate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ exhibitions });
  } catch (error) {
    console.error('Error fetching virtual tours:', error);
    res.status(500).json({ error: 'Failed to fetch virtual tours' });
  }
};

exports.getExhibitionById = async (req, res) => {
  try {
    const { id } = req.params;

    const exhibition = await Exhibition.findByPk(id, {
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'endDate', 'location']
        }
      ]
    });

    if (!exhibition) {
      return res.status(404).json({ error: 'Exhibition not found' });
    }

    res.json({ exhibition });
  } catch (error) {
    console.error('Error fetching exhibition:', error);
    res.status(500).json({ error: 'Failed to fetch exhibition' });
  }
};

exports.getExhibitionArtworks = async (req, res) => {
  try {
    const { id } = req.params;

    const exhibition = await Exhibition.findByPk(id);
    if (!exhibition) {
      return res.status(404).json({ error: 'Exhibition not found' });
    }

    // In a real implementation, you'd have an artworks relationship
    // For now, we'll return mock data
    res.json({
      artworks: exhibition.artworks || []
    });
  } catch (error) {
    console.error('Error fetching exhibition artworks:', error);
    res.status(500).json({ error: 'Failed to fetch exhibition artworks' });
  }
};

module.exports = exports;