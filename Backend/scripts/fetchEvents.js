const { Event, User, Admin } = require('../models');
const sequelize = require('../config/db');

async function fetchEvents() {
  try {
    console.log('🔄 Connecting to database...');

    // Fetch all events
    const events = await Event.findAll({
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 Found ${events.length} events in database:\n`);

    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Slug: ${event.slug}`);
      console.log(`   Event Type: ${event.eventType}`);
      console.log(`   Category: ${event.category}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Start Date: ${event.startDate}`);
      console.log(`   End Date: ${event.endDate}`);
      console.log(`   Location: ${event.emirate || 'N/A'} - ${event.eventLocationName || 'N/A'}`);
      console.log(`   Organised By: ${event.eventOrganisedBy || 'N/A'}`);
      console.log(`   Website: ${event.eventWebsite || 'N/A'}`);
      console.log(`   Registration: ${event.eventRegistrationCharges || 'N/A'}`);
      console.log(`   Created By: ${event.createdBy}`);
      console.log(`   Created At: ${event.createdAt}`);
      console.log('   ---');
    });

    // Also fetch published events only
    const publishedEvents = await Event.findAll({
      where: { status: 'published' },
      order: [['startDate', 'ASC']]
    });

    console.log(`\n📅 Published Events (${publishedEvents.length}):`);
    publishedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.startDate.toDateString()} to ${event.endDate.toDateString()}`);
    });

    // Fetch upcoming events
    const upcomingEvents = await Event.findAll({
      where: {
        status: 'published',
        startDate: {
          [sequelize.Sequelize.Op.gte]: new Date()
        }
      },
      order: [['startDate', 'ASC']],
      limit: 5
    });

    console.log(`\n⏰ Upcoming Events (${upcomingEvents.length}):`);
    upcomingEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.startDate.toDateString()}`);
    });

  } catch (error) {
    console.error('❌ Error fetching events:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fetchEvents();