const { Event } = require('../models');
const sequelize = require('../config/db');

async function testSingleEvent() {
  try {
    console.log('🔄 Connecting to database...');

    // Get the first event from the database
    const event = await Event.findOne({
      order: [['createdAt', 'DESC']]
    });

    if (!event) {
      console.log('❌ No events found in database');
      return;
    }

    console.log(`✅ Found event: ${event.title} (ID: ${event.id})`);
    console.log('📋 Event details:');
    console.log(`   - Title: ${event.title}`);
    console.log(`   - Slug: ${event.slug}`);
    console.log(`   - Status: ${event.status}`);
    console.log(`   - Start Date: ${event.startDate}`);
    console.log(`   - End Date: ${event.endDate}`);
    console.log(`   - Created By: ${event.createdBy}`);

    // Test the getEventById method from controller
    console.log('\n🧪 Testing getEventById method...');

    // Simulate the controller method
    const eventData = {
      ...event.toJSON(),
      eventStatus: event.getEventStatus(),
      availableCapacity: event.getAvailableCapacity(),
      isRegistrationOpen: event.isRegistrationOpen(),
      shareUrl: event.getShareUrl(),
      embedCode: event.getEmbedCode()
    };

    console.log('✅ Event data prepared for frontend:');
    console.log(`   - Event Status: ${eventData.eventStatus}`);
    console.log(`   - Available Capacity: ${eventData.availableCapacity}`);
    console.log(`   - Registration Open: ${eventData.isRegistrationOpen}`);
    console.log(`   - Share URL: ${eventData.shareUrl}`);

    console.log('\n🎉 Single event fetch test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing single event:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testSingleEvent();