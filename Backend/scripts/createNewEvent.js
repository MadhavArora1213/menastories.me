const { Event, User, Admin } = require('../models');
const sequelize = require('../config/db');

async function createNewEvent() {
  try {
    console.log('🔄 Connecting to database...');

    // First, let's check if there are any users or admins to use as creators
    const [users, admins] = await Promise.all([
      User.findAll({ limit: 1 }),
      Admin.findAll({ limit: 1 })
    ]);

    if (users.length === 0 && admins.length === 0) {
      console.log('❌ No users or admins found. Please create at least one user or admin first.');
      return;
    }

    const creatorId = users.length > 0 ? users[0].id : admins[0].id;
    const creatorType = users.length > 0 ? 'user' : 'admin';

    console.log(`✅ Using ${creatorType} with ID: ${creatorId}`);

    // Helper function to convert DD-MM-YYYY HH:mm to Date object
    function parseDate(dateString) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');
      return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);
    }

    // New event data from user input
    const newEventData = {
      title: 'xnb',
      slug: 'xnb',
      description: 'sdfegtr',
      shortDescription: 'sdfrgtr',
      eventType: 'conference',
      category: 'business',
      status: 'published',
      startDate: parseDate('18-09-2025 18:13'),
      endDate: parseDate('19-09-2025 18:13'),
      timezone: 'UTC',
      venue: {
        name: 'sdfgd',
        address: 'dfg',
        city: 'df',
        country: 'sn'
      },
      isVirtual: false,
      isHybrid: false,
      capacity: 22,
      registrationDeadline: parseDate('06-09-2025 18:13'),
      price: 222.00,
      currency: 'USD',
      allowRegistration: true,
      requireRegistration: true,
      tags: ['xcvb', 'dfvbn'],
      socialLinks: {
        website: 'https://madhavarora1213.github.io/CodSoft-Task3/',
        facebook: 'https://facebook.com/page',
        twitter: 'https://twitter.com/handle',
        instagram: 'https://instagram.com/handle',
        linkedin: 'https://www.linkedin.com/in/madhav-arora-32b056254/'
      },
      contactInfo: {
        email: 'op@gmail.com',
        phone: '+919877275894',
        organizer: 'dfbnvbm'
      },
      seoTitle: 'dfn',
      seoDescription: 'dfgnm',
      isFeatured: true,
      isPublic: true,
      createdBy: creatorId
    };

    console.log('📝 Creating new event...');

    try {
      const event = await Event.create(newEventData);
      console.log(`✅ Created event: ${event.title} (ID: ${event.id})`);
      console.log(`📅 Event dates: ${event.startDate} to ${event.endDate}`);
      console.log(`🏷️ Event slug: ${event.slug}`);
      console.log(`📍 Venue: ${event.venue.name}, ${event.venue.city}, ${event.venue.country}`);
      console.log(`💰 Price: ${event.price} ${event.currency}`);
      console.log(`👥 Capacity: ${event.capacity}`);
      console.log(`🔗 Registration: ${event.allowRegistration ? 'Enabled' : 'Disabled'}`);
      console.log(`⭐ Featured: ${event.isFeatured ? 'Yes' : 'No'}`);
      console.log(`🌐 Public: ${event.isPublic ? 'Yes' : 'No'}`);

    } catch (error) {
      console.error(`❌ Failed to create event:`, error.message);
      console.error('Full error:', error);
    }

    console.log('🎉 Event creation completed!');

    // Verify the event was created
    const totalEvents = await Event.count();
    console.log(`📊 Total events in database: ${totalEvents}`);

    // Get the created event details
    const createdEvent = await Event.findOne({
      where: { slug: 'xnb' },
      attributes: ['id', 'title', 'slug', 'status', 'startDate', 'endDate', 'venue', 'price', 'capacity']
    });

    if (createdEvent) {
      console.log('📋 Created event details:');
      console.log(JSON.stringify(createdEvent.toJSON(), null, 2));
    }

  } catch (error) {
    console.error('❌ Error creating event:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createNewEvent();