const { Event, User, Admin } = require('../models');
const sequelize = require('../config/db');

async function importEventData() {
  try {
    console.log('🔄 Connecting to database...');

    // First, check if there are any users or admins to use as creators
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

    // Event data from the CSV
    const eventData = [
      {
        title: 'Paper Arabia',
        slug: 'paper-arabia-2025',
        description: 'Paper Arabia exhibition featuring paper, packaging and printing industry',
        shortDescription: 'Leading paper and packaging exhibition',
        eventType: 'exhibition',
        category: 'business',
        status: 'published',
        startDate: new Date('2025-09-02T00:00:00Z'),
        endDate: new Date('2025-09-04T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'DWTC',
          address: 'Dubai World Trade Centre',
          city: 'Dubai',
          country: 'UAE',
          coordinates: { lat: 25.2215, lng: 55.2797 }
        },
        isVirtual: false,
        eventLocationNumber: 2,
        emirate: 'Dubai',
        eventLocationName: 'DWTC',
        locationLink: 'https://www.dwtc.com/en/events/',
        eventVenueLink: 'https://www.dwtc.com/en/events/paper-arabia-2025/',
        eventWebsite: 'https://www.paperarabia.com/',
        eventSubLocation: 'Hall 4',
        industry: 'Paper, Packaging and Printing',
        audience: 'Trade and Public',
        eventOrganisedBy: 'Al Fajer Information & Services',
        eventOrganisedByWebsite: 'https://alfajer.net/',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Not available',
        eventRegistrationLink: 'https://ae.sajilni.com/cart-new/checkout/169',
        eventRegistrationCharges: 'Free',
        mediaPartners: 'https://www.paperarabia.com/media_supporters.php',
        eventLinkedIn: 'https://www.linkedin.com/in/paper-arabia-dubai-76209b172/',
        eventInstagram: 'https://www.instagram.com/paperarabiauae/',
        eventContactNumbers: ['04 3406888'],
        eventWhatsappNumbers: [],
        eventContactEmails: ['nair@alfajer.net'],
        eventContactTelegram: 'Not available',
        remarks1: '',
        remarks2: '',
        socialLinks: {
          website: 'https://www.paperarabia.com/',
          linkedin: 'https://www.linkedin.com/in/paper-arabia-dubai-76209b172/',
          instagram: 'https://www.instagram.com/paperarabiauae/'
        },
        contactInfo: {
          email: 'nair@alfajer.net',
          phone: '04 3406888'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'FESPA Middle East',
        slug: 'fespa-middle-east-2026',
        description: 'FESPA Middle East exhibition for printing and signage industry',
        shortDescription: 'Leading printing and signage exhibition',
        eventType: 'exhibition',
        category: 'business',
        status: 'published',
        startDate: new Date('2026-01-13T00:00:00Z'),
        endDate: new Date('2026-01-15T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'DEC, Expo City',
          address: 'Dubai Expo City',
          city: 'Dubai',
          country: 'UAE'
        },
        isVirtual: false,
        eventLocationNumber: 6,
        emirate: 'Dubai',
        eventLocationName: 'DEC, Expo City',
        locationLink: 'https://www.expocitydubai.com/en/things-to-do/events-and-workshops/',
        eventVenueLink: 'Not able to find',
        eventWebsite: 'https://www.fespamiddleeast.com/',
        eventSubLocation: 'Not available',
        industry: 'Printing and signage',
        audience: 'Trade and Public',
        eventOrganisedBy: 'FESPA',
        eventOrganisedByWebsite: 'https://www.fespa.com/en/',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Not available',
        eventRegistrationLink: 'https://www.fespamiddleeast.com/visitor-interest-form',
        eventRegistrationCharges: 'Free',
        mediaPartners: 'https://www.fespaglobalprintexpo.com/news-hub/media-partners',
        eventLinkedIn: 'https://www.linkedin.com/showcase/fespa-middle-east/',
        eventInstagram: 'https://www.instagram.com/fespamiddleeast/',
        eventContactNumbers: ['+971 555 710900'],
        eventWhatsappNumbers: [],
        eventContactEmails: ['sales@fespa.com', 'marketing@fespa.com', 'operations@fespa.com', 'bazil.cassim@fespa.com', 'Shakoor.saban@fespa.com'],
        eventContactTelegram: 'Not available',
        remarks1: 'Not sure about the media partner list. Please Ignore the Media Partner list for this event',
        remarks2: '',
        socialLinks: {
          website: 'https://www.fespamiddleeast.com/',
          linkedin: 'https://www.linkedin.com/showcase/fespa-middle-east/',
          instagram: 'https://www.instagram.com/fespamiddleeast/'
        },
        contactInfo: {
          email: 'sales@fespa.com',
          phone: '+971 555 710900'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'Blockchain Life',
        slug: 'blockchain-life-2025',
        description: 'Blockchain Life conference featuring Web 3 and blockchain technologies',
        shortDescription: 'Leading blockchain and Web 3 conference',
        eventType: 'conference',
        category: 'technology',
        status: 'published',
        startDate: new Date('2025-10-28T00:00:00Z'),
        endDate: new Date('2025-10-29T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'Festival Arena',
          address: 'Dubai Festival City',
          city: 'Dubai',
          country: 'UAE'
        },
        isVirtual: false,
        eventLocationNumber: 3,
        emirate: 'Dubai',
        eventLocationName: 'Festival Arena',
        locationLink: 'https://festivalarenadubai.com/upcoming-events/',
        eventVenueLink: 'Event not available on Event Location Website Link',
        eventWebsite: 'https://blockchain-life.com/',
        eventSubLocation: 'Not available',
        industry: 'Web 3 / Blockchain / Crypto',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Blockchain Life',
        eventOrganisedByWebsite: 'Not applicable',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Not available',
        eventRegistrationLink: 'https://blockchain-life.com/#tickets-row',
        eventRegistrationCharges: 'Paid',
        mediaPartners: 'https://blockchain-life.com/',
        eventLinkedIn: 'https://www.linkedin.com/company/blockchainlife2025/',
        eventInstagram: 'https://www.instagram.com/blockchain_life_forum/',
        eventContactNumbers: [],
        eventWhatsappNumbers: ['https://wa.me/79533662458'],
        eventContactEmails: ['info@blockchain-life.com'],
        eventContactTelegram: 'https://t.me/BlockchainLifeSupport',
        remarks1: 'Media Partner list on the homepage',
        remarks2: '',
        socialLinks: {
          website: 'https://blockchain-life.com/',
          linkedin: 'https://www.linkedin.com/company/blockchainlife2025/',
          instagram: 'https://www.instagram.com/blockchain_life_forum/'
        },
        contactInfo: {
          email: 'info@blockchain-life.com'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'Token 2049 Dubai',
        slug: 'token-2049-dubai-2026',
        description: 'Token 2049 Dubai conference for Web 3 and blockchain technologies',
        shortDescription: 'Leading blockchain conference',
        eventType: 'conference',
        category: 'technology',
        status: 'published',
        startDate: new Date('2026-04-29T00:00:00Z'),
        endDate: new Date('2026-04-30T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'Madinath Jumeirah',
          address: 'Jumeirah Beach Road',
          city: 'Dubai',
          country: 'UAE'
        },
        isVirtual: false,
        eventLocationNumber: 8,
        emirate: 'Dubai',
        eventLocationName: 'Madinath Jumeirah',
        locationLink: 'https://www.jumeirah.com/en/stay/dubai/madinat-jumeirah/events/listing',
        eventVenueLink: 'Not able to find',
        eventWebsite: 'https://www.dubai.token2049.com/',
        eventSubLocation: 'Not available',
        industry: 'Web 3 / Blockchain / Crypto',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Token 2049',
        eventOrganisedByWebsite: 'Not applicable',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Not available',
        eventRegistrationLink: 'https://forms.token2049.com/dubai/2026-waitlist',
        eventRegistrationCharges: 'Paid',
        mediaPartners: 'https://www.dubai.token2049.com/partners#media-partner',
        eventLinkedIn: 'https://www.linkedin.com/company/token2049/',
        eventInstagram: 'https://www.instagram.com/token2049/',
        eventContactNumbers: [],
        eventWhatsappNumbers: [],
        eventContactEmails: ['info@token2049.com'],
        eventContactTelegram: 'https://t.me/token2049official',
        remarks1: 'Visitor Registration on Waiting list',
        remarks2: '',
        socialLinks: {
          website: 'https://www.dubai.token2049.com/',
          linkedin: 'https://www.linkedin.com/company/token2049/',
          instagram: 'https://www.instagram.com/token2049/'
        },
        contactInfo: {
          email: 'info@token2049.com'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'International Real Estate & Investment Show',
        slug: 'international-real-estate-investment-show-2025',
        description: 'International Real Estate & Investment Show in Abu Dhabi',
        shortDescription: 'Leading real estate exhibition',
        eventType: 'exhibition',
        category: 'business',
        status: 'published',
        startDate: new Date('2025-09-12T00:00:00Z'),
        endDate: new Date('2025-09-14T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'ADNEC',
          address: 'Abu Dhabi National Exhibition Centre',
          city: 'Abu Dhabi',
          country: 'UAE'
        },
        isVirtual: false,
        eventLocationNumber: 1,
        emirate: 'Abu Dhabi',
        eventLocationName: 'ADNEC',
        locationLink: 'https://www.adnec.ae/en/eventlisting',
        eventVenueLink: 'https://www.adnec.ae/en/eventlisting/international-real-estate-investment-show',
        eventWebsite: 'https://realestateshow.ae/',
        eventSubLocation: 'Hall 5',
        industry: 'Real Estate',
        audience: 'Not mentioned',
        eventOrganisedBy: 'DOME Exhibitions',
        eventOrganisedByWebsite: 'www.domeexhibitions.com',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Not available',
        eventRegistrationLink: 'https://realestateshow.ae/visitorregistration.html',
        eventRegistrationCharges: 'Free',
        mediaPartners: 'https://realestateshow.ae/',
        eventLinkedIn: 'https://www.linkedin.com/company/ireis/',
        eventInstagram: 'https://www.instagram.com/realestateshow/',
        eventContactNumbers: ['+971507450036', '+971 52 5702 847', '+971 2 674 4040', '+971 2 582 4159'],
        eventWhatsappNumbers: [],
        eventContactEmails: ['arun.bose@domeexhibitions.com'],
        eventContactTelegram: 'Not available',
        remarks1: 'Media Partner list on the homepage',
        remarks2: '',
        socialLinks: {
          website: 'https://realestateshow.ae/',
          linkedin: 'https://www.linkedin.com/company/ireis/',
          instagram: 'https://www.instagram.com/realestateshow/'
        },
        contactInfo: {
          email: 'arun.bose@domeexhibitions.com',
          phone: '+971507450036'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'Dubai International Boat Show',
        slug: 'dubai-international-boat-show-2026',
        description: 'Dubai International Boat Show featuring yachts and marine lifestyle',
        shortDescription: 'Leading boat and yacht exhibition',
        eventType: 'show',
        category: 'lifestyle',
        status: 'published',
        startDate: new Date('2026-04-08T00:00:00Z'),
        endDate: new Date('2026-04-12T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'Dubai Harbour',
          address: 'Dubai Harbour',
          city: 'Dubai',
          country: 'UAE'
        },
        isVirtual: false,
        eventLocationNumber: 4,
        emirate: 'Dubai',
        eventLocationName: 'Dubai Harbour',
        locationLink: 'https://www.dubaiharbour.com/',
        eventVenueLink: 'Not able to find',
        eventWebsite: 'https://www.boatshowdubai.com/',
        eventSubLocation: 'Not available',
        industry: 'Lifestyle (Yacht)',
        audience: 'Not mentioned',
        eventOrganisedBy: 'DWTC',
        eventOrganisedByWebsite: 'https://www.dwtc.com/en/',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Not available',
        eventRegistrationLink: 'https://www.boatshowdubai.com/visitor/',
        eventRegistrationCharges: 'Paid',
        mediaPartners: 'https://www.boatshowdubai.com/media-partner/',
        eventLinkedIn: 'https://www.linkedin.com/company/dubai-international-boat-show/',
        eventInstagram: 'https://www.instagram.com/dibshow/',
        eventContactNumbers: [],
        eventWhatsappNumbers: [],
        eventContactEmails: ['Neeraj.Dalal@dwtc.com', 'Avinash.Shanbhogue@dwtc.com'],
        eventContactTelegram: 'Not available',
        remarks1: 'Organiser detail obtained by email address',
        remarks2: 'Visitor Registration on Waiting list',
        socialLinks: {
          website: 'https://www.boatshowdubai.com/',
          linkedin: 'https://www.linkedin.com/company/dubai-international-boat-show/',
          instagram: 'https://www.instagram.com/dibshow/'
        },
        contactInfo: {
          email: 'Neeraj.Dalal@dwtc.com'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'Watch & Jewellery Middle East Show',
        slug: 'watch-jewellery-middle-east-show-2025',
        description: 'Watch & Jewellery Middle East Show featuring luxury watches and jewelry',
        shortDescription: 'Leading luxury watch and jewelry exhibition',
        eventType: 'exhibition',
        category: 'fashion',
        status: 'published',
        startDate: new Date('2025-10-24T00:00:00Z'),
        endDate: new Date('2025-10-28T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'Expo Center',
          address: 'Expo Centre Sharjah',
          city: 'Sharjah',
          country: 'UAE'
        },
        isVirtual: false,
        eventLocationNumber: 5,
        emirate: 'Sharjah',
        eventLocationName: 'Expo Center',
        locationLink: 'https://expo-centre.ae/events/',
        eventVenueLink: 'https://expo-centre.ae/event/56th-watch-jewellery-middle-east-show/',
        eventWebsite: 'https://www.mideastjewellery.com/',
        eventSubLocation: 'Not available',
        industry: 'Lifestyle (Watches and Jewelery / Jewellery and gems)',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Expo Centre Sharjah',
        eventOrganisedByWebsite: 'https://expo-centre.ae/',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Not able to find',
        eventRegistrationLink: 'https://register.mideastjewellery.com/registration/?event=MzU=&form=NjE=&lang=en&affiliate_partner=WJ5680',
        eventRegistrationCharges: 'Free',
        mediaPartners: 'https://www.mideastjewellery.com/',
        eventLinkedIn: 'Not available',
        eventInstagram: 'https://www.instagram.com/watchandjewelleryshow/',
        eventContactNumbers: ['+971509641565'],
        eventWhatsappNumbers: [],
        eventContactEmails: [],
        eventContactTelegram: 'Not available',
        remarks1: 'Media Partner list on the homepage',
        remarks2: 'Organiser detail obtained by email address',
        socialLinks: {
          website: 'https://www.mideastjewellery.com/',
          instagram: 'https://www.instagram.com/watchandjewelleryshow/'
        },
        contactInfo: {
          phone: '+971509641565'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'Middle East Cosmetics Show',
        slug: 'middle-east-cosmetics-show-2025',
        description: 'Middle East Cosmetics Show featuring beauty and cosmetics products',
        shortDescription: 'Leading beauty and cosmetics exhibition',
        eventType: 'exhibition',
        category: 'lifestyle',
        status: 'published',
        startDate: new Date('2025-10-08T00:00:00Z'),
        endDate: new Date('2025-10-12T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'Expo Center',
          address: 'Expo Centre Sharjah',
          city: 'Sharjah',
          country: 'UAE'
        },
        isVirtual: false,
        eventLocationNumber: 5,
        emirate: 'Sharjah',
        eventLocationName: 'Expo Center',
        locationLink: 'https://expo-centre.ae/events/',
        eventVenueLink: 'https://expo-centre.ae/event/middle-east-cosmetics-show/',
        eventWebsite: 'https://mecosmeticsshow.ae/',
        eventSubLocation: 'Not available',
        industry: 'Lifestyle (Beauty and Cosmetics)',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Expo Centre Sharjah',
        eventOrganisedByWebsite: 'https://expo-centre.ae/',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Sharjah Chamber of Commerce & Industry',
        eventRegistrationLink: 'https://register.mecosmeticsshow.ae/visitor-registration.html',
        eventRegistrationCharges: 'Free',
        mediaPartners: 'Not available',
        eventLinkedIn: 'Not available',
        eventInstagram: 'https://www.instagram.com/mecosmeticsshow',
        eventContactNumbers: ['+971-6-5770000', '+971-6-5770496', '+971 50 587 7797', '+971 55 284 1211', '+971 55 749 1984'],
        eventWhatsappNumbers: [],
        eventContactEmails: ['hosam.m@expo-centre.ae', 'hazal@expo-centre.ae', 'hesham@expo-centre.ae', 'tasnim@expo-centre.ae'],
        eventContactTelegram: 'Not available',
        remarks1: '',
        remarks2: '',
        socialLinks: {
          website: 'https://mecosmeticsshow.ae/',
          instagram: 'https://www.instagram.com/mecosmeticsshow'
        },
        contactInfo: {
          email: 'hosam.m@expo-centre.ae',
          phone: '+971-6-5770000'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'The Dubai Fixed Income Alternatives Conference',
        slug: 'dubai-fixed-income-alternatives-conference-2025',
        description: 'Dubai Fixed Income Alternatives Conference for banking and capital markets',
        shortDescription: 'Leading fixed income conference',
        eventType: 'conference',
        category: 'business',
        status: 'published',
        startDate: new Date('2025-10-09T00:00:00Z'),
        endDate: new Date('2025-10-09T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'DIFC',
          address: 'Dubai International Financial Centre',
          city: 'Dubai',
          country: 'UAE'
        },
        isVirtual: false,
        eventLocationNumber: 7,
        emirate: 'Dubai',
        eventLocationName: 'DIFC',
        locationLink: 'https://www.difc.com/whats-on/events',
        eventVenueLink: 'https://www.difc.com/whats-on/events/the-dubai-fixed-income-alternatives-conference',
        eventWebsite: 'https://www.dealcatalyst.io/events/dubai-fixed-income-alternatives-conference',
        eventSubLocation: 'Ritz Carlton DIFC',
        industry: 'Banking and Capital Markets',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Deal Catalyst',
        eventOrganisedByWebsite: 'https://www.dealcatalyst.io/events',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Not available',
        eventRegistrationLink: 'https://events.dealcatalyst.io/dubai-structured-credit-summit-2025/page/4135135/register',
        eventRegistrationCharges: 'Free / Paid',
        mediaPartners: 'https://events.dealcatalyst.io/dubai-structured-credit-summit-2025/page/4135137/sponsors',
        eventLinkedIn: 'https://www.linkedin.com/company/dealcatalyst/',
        eventInstagram: 'Not available',
        eventContactNumbers: [],
        eventWhatsappNumbers: [],
        eventContactEmails: ['events@dealcatalyst.io'],
        eventContactTelegram: 'Not available',
        remarks1: 'Media Partner list on the sponsors page link',
        remarks2: 'Event Organisers could be either https://www.dealcatalyst.io/ or DIFC',
        socialLinks: {
          website: 'https://www.dealcatalyst.io/events/dubai-fixed-income-alternatives-conference',
          linkedin: 'https://www.linkedin.com/company/dealcatalyst/'
        },
        contactInfo: {
          email: 'events@dealcatalyst.io'
        },
        isFeatured: false,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      },
      {
        title: 'Dubai Future Forum 2025',
        slug: 'dubai-future-forum-2025',
        description: 'Dubai Future Forum 2025 conference on future technologies and innovations',
        shortDescription: 'Leading future technology conference',
        eventType: 'conference',
        category: 'technology',
        status: 'published',
        startDate: new Date('2025-11-18T00:00:00Z'),
        endDate: new Date('2025-11-19T23:59:59Z'),
        timezone: 'UTC',
        venue: {
          name: 'DFF',
          address: 'Dubai Future Foundation',
          city: 'Dubai',
          country: 'UAE'
        },
        isVirtual: false,
        eventLocationNumber: 9,
        emirate: 'Dubai',
        eventLocationName: 'DFF',
        locationLink: 'https://www.dubaifuture.ae/events',
        eventVenueLink: 'https://www.dubaifuture.ae/dubai-future-forum-2025',
        eventWebsite: 'https://www.dubaifuture.ae/dubai-future-forum-2025',
        eventSubLocation: 'Not available',
        industry: 'Future',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Dubai Future Foundation',
        eventOrganisedByWebsite: 'https://www.dubaifuture.ae/',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Not available',
        eventRegistrationLink: 'https://events.dubaifuture.ae/event/d85eec75-143d-46b2-b030-fde2e53bbb71/regProcessStep1',
        eventRegistrationCharges: 'Free',
        mediaPartners: 'https://www.dubaifuture.ae/dubai-future-forum-media',
        eventLinkedIn: 'https://www.linkedin.com/showcase/dubai-future-forum/',
        eventInstagram: 'https://www.instagram.com/dubaifuture/',
        eventContactNumbers: ['+971 50 4377995'],
        eventWhatsappNumbers: [],
        eventContactEmails: ['forum@dubaifuture.ae', 'gfs@dubaifuture.gov.ae'],
        eventContactTelegram: 'Not available',
        remarks1: '',
        remarks2: '',
        socialLinks: {
          website: 'https://www.dubaifuture.ae/dubai-future-forum-2025',
          linkedin: 'https://www.linkedin.com/showcase/dubai-future-forum/',
          instagram: 'https://www.instagram.com/dubaifuture/'
        },
        contactInfo: {
          email: 'forum@dubaifuture.ae',
          phone: '+971 50 4377995'
        },
        isFeatured: true,
        isPublic: true,
        allowRegistration: true,
        createdBy: creatorId
      }
    ];

    console.log('📝 Importing event data...');

    for (const eventItem of eventData) {
      try {
        const event = await Event.create(eventItem);
        console.log(`✅ Created event: ${event.title} (ID: ${event.id})`);
      } catch (error) {
        console.error(`❌ Failed to create event "${eventItem.title}":`, error.message);
      }
    }

    console.log('🎉 Event data import completed!');

    // Verify the events were created
    const totalEvents = await Event.count();
    console.log(`📊 Total events in database: ${totalEvents}`);

  } catch (error) {
    console.error('❌ Error importing event data:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

importEventData();