const { Event } = require('./models');

async function checkEvents() {
  try {
    const events = await Event.findAll({
      attributes: ['id', 'title', 'status', 'startDate', 'endDate', 'eventType', 'category']
    });

    console.log('📊 Imported Events:');
    events.forEach(event => {
      const startDate = event.startDate ? event.startDate.toISOString().split('T')[0] : 'N/A';
      const endDate = event.endDate ? event.endDate.toISOString().split('T')[0] : 'N/A';
      console.log(`✅ ${event.title} (${event.status}) - ${startDate} to ${endDate}`);
    });
    console.log(`\nTotal: ${events.length} events`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkEvents();