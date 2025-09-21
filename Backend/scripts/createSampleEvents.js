const { Event, User, Admin } = require('../models');
const sequelize = require('../config/db');

async function createSampleEvents() {
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

    // Sample events data
    const sampleEvents = [
      {
        title: 'Tech Conference 2025',
        slug: 'tech-conference-2025',
        description: 'A comprehensive technology conference featuring the latest innovations in AI, blockchain, and software development.',
        shortDescription: 'Leading tech conference with industry experts',
        eventType: 'conference',
        category: 'technology',
        status: 'published',
        startDate: new Date('2025-06-15T09:00:00Z'),
        endDate: new Date('2025-06-17T18:00:00Z'),
        timezone: 'UTC',
        venue: {
          name: 'Dubai International Convention Centre',
          address: 'Convention Tower, Sheikh Zayed Road',
          city: 'Dubai',
          country: 'UAE',
          coordinates: { lat: 25.2329, lng: 55.3187 },
          capacity: 2000
        },
        isVirtual: false,
        capacity: 500,
        price: 299.99,
        currency: 'USD',
        ticketTypes: [
          { name: 'Early Bird', price: 199.99, available: 100 },
          { name: 'Regular', price: 299.99, available: 300 },
          { name: 'VIP', price: 499.99, available: 50 }
        ],
        agenda: [
          {
            title: 'Opening Keynote',
            description: 'Welcome and overview of the conference',
            startTime: '2025-06-15T09:00:00Z',
            endTime: '2025-06-15T10:00:00Z',
            speaker: 'Dr. Sarah Johnson',
            location: 'Main Hall'
          },
          {
            title: 'AI in Modern Business',
            description: 'How AI is transforming business processes',
            startTime: '2025-06-15T11:00:00Z',
            endTime: '2025-06-15T12:00:00Z',
            speaker: 'Prof. Michael Chen',
            location: 'Room A'
          }
        ],
        speakers: [
          {
            name: 'Dr. Sarah Johnson',
            title: 'Chief Technology Officer',
            company: 'TechCorp Inc.',
            bio: 'Leading expert in AI and machine learning with 15+ years experience'
          },
          {
            name: 'Prof. Michael Chen',
            title: 'Professor of Computer Science',
            company: 'MIT',
            bio: 'Renowned researcher in artificial intelligence and data science'
          }
        ],
        tags: ['AI', 'Technology', 'Innovation', 'Conference'],
        socialLinks: {
          website: 'https://techconf2025.com',
          linkedin: 'https://linkedin.com/company/techconf2025'
        },
        contactInfo: {
          email: 'info@techconf2025.com',
          phone: '+971-4-123-4567'
        },
        isFeatured: true,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'Digital Marketing Summit',
        slug: 'digital-marketing-summit-2025',
        description: 'Learn the latest digital marketing strategies and tools from industry leaders.',
        shortDescription: 'Master digital marketing techniques',
        eventType: 'seminar',
        category: 'business',
        status: 'published',
        startDate: new Date('2025-07-20T10:00:00Z'),
        endDate: new Date('2025-07-20T16:00:00Z'),
        timezone: 'UTC',
        venue: {
          name: 'Business Bay Conference Center',
          address: 'World Trade Center',
          city: 'Dubai',
          country: 'UAE',
          capacity: 300
        },
        isVirtual: true,
        virtualDetails: {
          platform: 'Zoom',
          meetingLink: 'https://zoom.us/meeting/123456789',
          accessCode: 'DIGITAL2025'
        },
        capacity: 200,
        price: 149.99,
        currency: 'USD',
        tags: ['Marketing', 'Digital', 'SEO', 'Social Media'],
        socialLinks: {
          website: 'https://digitalmarketingsummit.com'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'Fashion Week Dubai 2025',
        slug: 'fashion-week-dubai-2025',
        description: 'Experience the glamour and creativity of Dubai Fashion Week featuring international designers.',
        shortDescription: 'Premier fashion event in the Middle East',
        eventType: 'fashion_show',
        category: 'fashion',
        status: 'published',
        startDate: new Date('2025-03-10T18:00:00Z'),
        endDate: new Date('2025-03-15T22:00:00Z'),
        timezone: 'UTC',
        venue: {
          name: 'Dubai Opera',
          address: 'Downtown Dubai',
          city: 'Dubai',
          country: 'UAE',
          capacity: 2000
        },
        capacity: 800,
        price: 399.99,
        currency: 'USD',
        tags: ['Fashion', 'Design', 'Luxury', 'Culture'],
        socialLinks: {
          instagram: 'https://instagram.com/dubaifashionweek',
          website: 'https://dubaifashionweek.ae'
        },
        isFeatured: true,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      }
    ];

    console.log('📝 Creating sample events...');

    for (const eventData of sampleEvents) {
      try {
        const event = await Event.create(eventData);
        console.log(`✅ Created event: ${event.title} (ID: ${event.id})`);
      } catch (error) {
        console.error(`❌ Failed to create event "${eventData.title}":`, error.message);
      }
    }

    console.log('🎉 Sample events creation completed!');

    // Verify the events were created
    const totalEvents = await Event.count();
    console.log(`📊 Total events in database: ${totalEvents}`);

  } catch (error) {
    console.error('❌ Error creating sample events:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createSampleEvents();