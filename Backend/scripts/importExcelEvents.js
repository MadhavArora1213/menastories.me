const { Event, User, Admin } = require('../models');
const sequelize = require('../config/db');

async function importExcelEvents() {
  try {
    console.log('🔄 Connecting to database...');

    // Get a creator (admin or user)
    const [users, admins] = await Promise.all([
      User.findAll({ limit: 1 }),
      Admin.findAll({ limit: 1 })
    ]);

    if (users.length === 0 && admins.length === 0) {
      console.log('❌ No users or admins found. Please create at least one user or admin first.');
      return;
    }

    const creatorId = users.length > 0 ? users[0].id : admins[0].id;
    console.log(`✅ Using ${users.length > 0 ? 'user' : 'admin'} with ID: ${creatorId}`);

    // Excel data from the provided list
    const excelEvents = [
      {
        eventLocationNumber: 2,
        emirate: 'Dubai',
        eventLocationName: 'DWTC',
        locationLink: 'https://www.dwtc.com/en/events/',
        eventVenueLink: 'https://www.dwtc.com/en/events/paper-arabia-2025/',
        title: 'Paper Arabia',
        eventWebsite: 'https://www.paperarabia.com/',
        startDate: '2025-09-02',
        endDate: '2025-09-04',
        eventSubLocation: 'Hall 4',
        eventType: 'exhibition',
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
        eventContactTelegram: '',
        remarks1: '',
        remarks2: ''
      },
      {
        eventLocationNumber: 6,
        emirate: 'Dubai',
        eventLocationName: 'DEC, Expo City',
        locationLink: 'https://www.expocitydubai.com/en/things-to-do/events-and-workshops/',
        eventVenueLink: '',
        title: 'FESPA Middle East',
        eventWebsite: 'https://www.fespamiddleeast.com/',
        startDate: '2026-01-13',
        endDate: '2026-01-15',
        eventSubLocation: 'Not available',
        eventType: 'exhibition',
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
        eventContactTelegram: '',
        remarks1: 'Not sure about the media partner list. Please Ignore the Media Partner list for this event',
        remarks2: ''
      },
      {
        eventLocationNumber: 3,
        emirate: 'Dubai',
        eventLocationName: 'Festival Arena',
        locationLink: 'https://festivalarenadubai.com/upcoming-events/',
        eventVenueLink: '',
        title: 'Blockchain Life',
        eventWebsite: 'https://blockchain-life.com/',
        startDate: '2025-10-28',
        endDate: '2025-10-29',
        eventSubLocation: 'Not available',
        eventType: 'conference',
        industry: 'Web 3 / Blockchain / Crypto',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Blockchain Life',
        eventOrganisedByWebsite: '',
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
        remarks2: ''
      },
      {
        eventLocationNumber: 8,
        emirate: 'Dubai',
        eventLocationName: 'Madinath Jumeirah',
        locationLink: 'https://www.jumeirah.com/en/stay/dubai/madinat-jumeirah/events/listing',
        eventVenueLink: '',
        title: 'Token 2049 Dubai',
        eventWebsite: 'https://www.dubai.token2049.com/',
        startDate: '2026-04-29',
        endDate: '2026-04-30',
        eventSubLocation: 'Not available',
        eventType: 'conference',
        industry: 'Web 3 / Blockchain / Crypto',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Token 2049',
        eventOrganisedByWebsite: '',
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
        remarks2: ''
      },
      {
        eventLocationNumber: 1,
        emirate: 'Abu Dhabi',
        eventLocationName: 'ADNEC',
        locationLink: 'https://www.adnec.ae/en/eventlisting',
        eventVenueLink: 'https://www.adnec.ae/en/eventlisting/international-real-estate-investment-show',
        title: 'International Real Estate & Investment Show',
        eventWebsite: 'https://realestateshow.ae/',
        startDate: '2025-09-12',
        endDate: '2025-09-14',
        eventSubLocation: 'Hall 5',
        eventType: 'exhibition',
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
        eventContactTelegram: '',
        remarks1: 'Media Partner list on the homepage',
        remarks2: ''
      },
      {
        eventLocationNumber: 4,
        emirate: 'Dubai',
        eventLocationName: 'Dubai Harbour',
        locationLink: 'https://www.dubaiharbour.com/',
        eventVenueLink: '',
        title: 'Dubai International Boat Show',
        eventWebsite: 'https://www.boatshowdubai.com/',
        startDate: '2026-04-08',
        endDate: '2026-04-12',
        eventSubLocation: 'Not available',
        eventType: 'show',
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
        eventContactTelegram: '',
        remarks1: 'Organiser detail obtained by email address',
        remarks2: 'Visitor Registration on Waiting list'
      },
      {
        eventLocationNumber: 5,
        emirate: 'Sharjah',
        eventLocationName: 'Expo Center',
        locationLink: 'https://expo-centre.ae/events/',
        eventVenueLink: 'https://expo-centre.ae/event/56th-watch-jewellery-middle-east-show/',
        title: 'Watch & Jewellery Middle East Show',
        eventWebsite: 'https://www.mideastjewellery.com/',
        startDate: '2025-10-24',
        endDate: '2025-10-28',
        eventSubLocation: 'Not available',
        eventType: 'exhibition',
        industry: 'Lifestyle (Watches and Jewelery / Jewellery and gems)',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Expo Centre Sharjah',
        eventOrganisedByWebsite: 'https://expo-centre.ae/',
        eventManagedBy: 'Not available',
        eventSupportedBy: '',
        eventRegistrationLink: 'https://register.mideastjewellery.com/registration/?event=MzU=&form=NjE=&lang=en&affiliate_partner=WJ5680',
        eventRegistrationCharges: 'Free',
        mediaPartners: 'https://www.mideastjewellery.com/',
        eventLinkedIn: '',
        eventInstagram: 'https://www.instagram.com/watchandjewelleryshow/',
        eventContactNumbers: ['+971509641565'],
        eventWhatsappNumbers: [],
        eventContactEmails: [],
        eventContactTelegram: '',
        remarks1: 'Media Partner list on the homepage',
        remarks2: 'Organiser detail obtained by email address'
      },
      {
        eventLocationNumber: 5,
        emirate: 'Sharjah',
        eventLocationName: 'Expo Center',
        locationLink: 'https://expo-centre.ae/events/',
        eventVenueLink: 'https://expo-centre.ae/event/middle-east-cosmetics-show/',
        title: 'Middle East Cosmetics Show',
        eventWebsite: 'https://mecosmeticsshow.ae/',
        startDate: '2025-10-08',
        endDate: '2025-10-12',
        eventSubLocation: 'Not available',
        eventType: 'exhibition',
        industry: 'Lifestyle (Beauty and Cosmetics)',
        audience: 'Not mentioned',
        eventOrganisedBy: 'Expo Centre Sharjah',
        eventOrganisedByWebsite: 'https://expo-centre.ae/',
        eventManagedBy: 'Not available',
        eventSupportedBy: 'Sharjah Chamber of Commerce & Industry',
        eventRegistrationLink: 'https://register.mecosmeticsshow.ae/visitor-registration.html',
        eventRegistrationCharges: 'Free',
        mediaPartners: '',
        eventLinkedIn: '',
        eventInstagram: 'https://www.instagram.com/mecosmeticsshow',
        eventContactNumbers: ['+971-6-5770000', '+971-6-5770496', '+971 50 587 7797', '+971 55 284 1211', '+971 55 749 1984'],
        eventWhatsappNumbers: [],
        eventContactEmails: ['hosam.m@expo-centre.ae', 'hazal@expo-centre.ae', 'hesham@expo-centre.ae', 'tasnim@expo-centre.ae'],
        eventContactTelegram: '',
        remarks1: '',
        remarks2: ''
      },
      {
        eventLocationNumber: 7,
        emirate: 'Dubai',
        eventLocationName: 'DIFC',
        locationLink: 'https://www.difc.com/whats-on/events',
        eventVenueLink: 'https://www.difc.com/whats-on/events/the-dubai-fixed-income-alternatives-conference',
        title: 'The Dubai Fixed Income Alternatives Conference',
        eventWebsite: 'https://www.dealcatalyst.io/events/dubai-fixed-income-alternatives-conference',
        startDate: '2025-10-09',
        endDate: '2025-10-09',
        eventSubLocation: 'Ritz Carlton DIFC',
        eventType: 'conference',
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
        eventInstagram: '',
        eventContactNumbers: [],
        eventWhatsappNumbers: [],
        eventContactEmails: ['events@dealcatalyst.io'],
        eventContactTelegram: '',
        remarks1: 'Media Partner list on the sponsors page link',
        remarks2: 'Event Organisers could be either https://www.dealcatalyst.io/ or DIFC'
      },
      {
        eventLocationNumber: 9,
        emirate: 'Dubai',
        eventLocationName: 'DFF',
        locationLink: 'https://www.dubaifuture.ae/events',
        eventVenueLink: 'https://www.dubaifuture.ae/dubai-future-forum-2025',
        title: 'Dubai Future Forum 2025',
        eventWebsite: 'https://www.dubaifuture.ae/dubai-future-forum-2025',
        startDate: '2025-11-18',
        endDate: '2025-11-19',
        eventSubLocation: 'Not available',
        eventType: 'conference',
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
        eventContactTelegram: '',
        remarks1: '',
        remarks2: ''
      }
    ];

    console.log(`📝 Importing ${excelEvents.length} events from Excel data...`);

    for (const [index, eventData] of excelEvents.entries()) {
      try {
        // Map Excel data to Event model fields
        const eventPayload = {
          title: eventData.title,
          slug: eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          description: `${eventData.title} - ${eventData.industry} event organized by ${eventData.eventOrganisedBy}`,
          shortDescription: `${eventData.eventType} in ${eventData.emirate}`,
          eventType: eventData.eventType.toLowerCase(),
          category: mapIndustryToCategory(eventData.industry),
          status: 'published',
          startDate: new Date(eventData.startDate + 'T00:00:00Z'),
          endDate: new Date(eventData.endDate + 'T23:59:59Z'),
          timezone: 'UTC',
          venue: {
            name: eventData.eventLocationName,
            address: eventData.eventSubLocation || eventData.emirate,
            city: eventData.emirate,
            country: 'UAE',
            coordinates: getCoordinates(eventData.emirate)
          },
          isVirtual: false,
          capacity: 1000, // Default capacity
          price: eventData.eventRegistrationCharges === 'Free' ? 0 : 100, // Default pricing
          currency: 'AED',
          tags: [eventData.industry, eventData.eventType, eventData.emirate],
          socialLinks: {
            website: eventData.eventWebsite,
            linkedin: eventData.eventLinkedIn,
            instagram: eventData.eventInstagram
          },
          contactInfo: {
            email: eventData.eventContactEmails,
            phone: eventData.eventContactNumbers,
            organizer: eventData.eventOrganisedBy
          },
          eventLocationNumber: eventData.eventLocationNumber,
          emirate: eventData.emirate,
          eventLocationName: eventData.eventLocationName,
          locationLink: eventData.locationLink,
          eventVenueLink: eventData.eventVenueLink,
          eventSubLocation: eventData.eventSubLocation,
          industry: eventData.industry,
          audience: eventData.audience,
          eventOrganisedBy: eventData.eventOrganisedBy,
          eventOrganisedByWebsite: eventData.eventOrganisedByWebsite,
          eventManagedBy: eventData.eventManagedBy,
          eventSupportedBy: eventData.eventSupportedBy,
          eventRegistrationLink: eventData.eventRegistrationLink,
          eventRegistrationCharges: eventData.eventRegistrationCharges,
          mediaPartners: eventData.mediaPartners,
          eventLinkedIn: eventData.eventLinkedIn,
          eventInstagram: eventData.eventInstagram,
          eventContactNumbers: eventData.eventContactNumbers,
          eventWhatsappNumbers: eventData.eventWhatsappNumbers,
          eventContactEmails: eventData.eventContactEmails,
          eventContactTelegram: eventData.eventContactTelegram,
          remarks1: eventData.remarks1,
          remarks2: eventData.remarks2,
          isFeatured: index < 3, // Make first 3 events featured
          isPublic: true,
          allowRegistration: true,
          createdBy: creatorId
        };

        const event = await Event.create(eventPayload);
        console.log(`✅ Created event ${index + 1}: ${event.title} (ID: ${event.id})`);

      } catch (error) {
        console.error(`❌ Failed to create event ${index + 1} "${eventData.title}":`, error.message);
      }
    }

    console.log('🎉 Excel events import completed!');

    // Verify the events were created
    const totalEvents = await Event.count();
    console.log(`📊 Total events in database: ${totalEvents}`);

  } catch (error) {
    console.error('❌ Error importing Excel events:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Helper function to map industry to category
function mapIndustryToCategory(industry) {
  const industryMap = {
    'Paper, Packaging and Printing': 'business',
    'Printing and signage': 'business',
    'Web 3 / Blockchain / Crypto': 'technology',
    'Real Estate': 'business',
    'Lifestyle (Yacht)': 'lifestyle',
    'Lifestyle (Watches and Jewelery / Jewellery and gems)': 'fashion',
    'Lifestyle (Beauty and Cosmetics)': 'lifestyle',
    'Banking and Capital Markets': 'business',
    'Future': 'technology'
  };

  return industryMap[industry] || 'business';
}

// Helper function to get coordinates for emirates
function getCoordinates(emirate) {
  const coordinatesMap = {
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
    'Sharjah': { lat: 25.3463, lng: 55.4209 }
  };

  return coordinatesMap[emirate] || { lat: 25.2048, lng: 55.2708 };
}

importExcelEvents();