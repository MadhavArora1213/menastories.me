const { Event, User, Admin } = require('../models');
const sequelize = require('../config/db');

// Mock request and response objects
function createMockReq(query = {}, params = {}, body = {}, user = null) {
  return {
    query,
    params,
    body,
    user: user || { id: 'cf5d753c-13a2-4d3c-a0ff-f0a708a39b60', role: 'admin' }
  };
}


function createMockRes() {
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      console.log(`Response (${this.statusCode || 200}):`, JSON.stringify(data, null, 2));
      return this;
    },
    send: function(data) {
      this.data = data;
      console.log(`Response (${this.statusCode || 200}):`, data);
      return this;
    }
  };
  return res;
}

// Import controller methods
const eventController = require('../controllers/eventController');

async function testEventController() {
  try {
    console.log('🔄 Connecting to database...');

    console.log('\n🧪 Testing Event Controller Methods...\n');

    // Test 1: Get all events
    console.log('1️⃣ Testing getEvents (fetch all events)...');
    const req1 = createMockReq({ status: 'published', limit: 5 });
    const res1 = createMockRes();
    await eventController.getEvents(req1, res1);

    // Test 2: Get single event by ID
    console.log('\n2️⃣ Testing getEventById...');
    const events = await Event.findAll({ limit: 1 });
    if (events.length > 0) {
      const req2 = createMockReq({}, { id: events[0].id });
      const res2 = createMockRes();
      await eventController.getEventById(req2, res2);
    }

    // Test 3: Get upcoming events
    console.log('\n3️⃣ Testing getUpcomingEvents...');
    const req3 = createMockReq({ limit: 3 });
    const res3 = createMockRes();
    await eventController.getUpcomingEvents(req3, res3);

    // Test 4: Get featured events
    console.log('\n4️⃣ Testing getFeaturedEvents...');
    const req4 = createMockReq({ limit: 3 });
    const res4 = createMockRes();
    await eventController.getFeaturedEvents(req4, res4);

    // Test 5: Get event categories
    console.log('\n5️⃣ Testing getEventCategories...');
    const req5 = createMockReq();
    const res5 = createMockRes();
    await eventController.getEventCategories(req5, res5);

    // Test 6: Get event types
    console.log('\n6️⃣ Testing getEventTypes...');
    const req6 = createMockReq();
    const res6 = createMockRes();
    await eventController.getEventTypes(req6, res6);

    // Test 7: Get event stats
    console.log('\n7️⃣ Testing getEventStats...');
    const req7 = createMockReq();
    const res7 = createMockRes();
    await eventController.getEventStats(req7, res7);

    console.log('\n✅ Event Controller testing completed!');

  } catch (error) {
    console.error('❌ Error testing event controller:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testEventController();