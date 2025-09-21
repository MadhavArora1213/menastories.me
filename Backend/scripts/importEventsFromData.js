const { Event, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const rawEventData = `1	2	Dubai	DWTC	https://www.dwtc.com/en/events/	https://www.dwtc.com/en/events/paper-arabia-2025/	Paper Arabia	https://www.paperarabia.com/	2025-09-02	2025-09-04	Hall 4	Exhibition	Paper, Packaging and Printing	Trade and Public	Al Fajer Information & Services	https://alfajer.net/	Not available	Not available	https://ae.sajilni.com/cart-new/checkout/169	Free	https://www.paperarabia.com/media_supporters.php	https://www.linkedin.com/in/paper-arabia-dubai-76209b172/	https://www.instagram.com/paperarabiauae/	\`04 3406888	Not available	nair@alfajer.net	Not available
2	6	Dubai	DEC, Expo City	https://www.expocitydubai.com/en/things-to-do/events-and-workshops/	Not able to find	FESPA Middle East	https://www.fespamiddleeast.com/	2026-01-13	2026-01-15	Not avaiable	Exhibition	Printing and signage	Trade and Public	FESPA	https://www.fespa.com/en/	Not available	Not available	https://www.fespamiddleeast.com/visitor-interest-form	Free	https://www.fespaglobalprintexpo.com/news-hub/media-partners	https://www.linkedin.com/showcase/fespa-middle-east/	https://www.instagram.com/fespamiddleeast/	\`+971 555 710900	Not available	sales@fespa.com / marketing@fespa.com / operations@fespa.com / bazil.cassim@fespa.com / Shakoor.saban@fespa.com	Not available	Not sure about the media partner list. Please Ignore the Media Partner list for this event
3	3	Dubai	Festival Arena	https://festivalarenadubai.com/upcoming-events/	Event not available on Event Location Website Link	Blockchain Life	https://blockchain-life.com/	2025-10-28	2025-10-29	Not avaiable	Conference	Web 3 / Blockchain / Crypto	Not mentioned	Blockchain Life	Not applicabe	Not available	Not available	https://blockchain-life.com/#tickets-row	Paid	https://blockchain-life.com/	https://www.linkedin.com/company/blockchainlife2025/	https://www.instagram.com/blockchain_life_forum/	Not available	https://wa.me/79533662458	info@blockchain-life.com	https://t.me/BlockchainLifeSupport	Media Partner list on the homepage
4	8	Dubai	Madinath Jumeirah	https://www.jumeirah.com/en/stay/dubai/madinat-jumeirah/events/listing	Not able to find	Token 2049 Dubai	https://www.dubai.token2049.com/	2026-04-29	2026-04-30	Not avaiable	Conference	Web 3 / Blockchain / Crypto	Not mentioned	Token 2049	Not applicabe	Not available	Not available	https://forms.token2049.com/dubai/2026-waitlist	Paid	https://www.dubai.token2049.com/partners#media-partner	https://www.linkedin.com/company/token2049/	https://www.instagram.com/token2049/	Not available	Not available	info@token2049.com	https://t.me/token2049official	Visitor Registration on Waiting list
5	1	Abu Dhabi	ADNEC	https://www.adnec.ae/en/eventlisting	https://www.adnec.ae/en/eventlisting/international-real-estate-investment-show	International Real Estate & Investment Show	https://realestateshow.ae/	2025-09-12	2025-09-14	Hall 5	Exhibition	Real Estate	Not mentioned	DOME Exhibitions	www.domeexhibitions.com	Not available	Not available	https://realestateshow.ae/visitorregistration.html	Free	https://realestateshow.ae/	https://www.linkedin.com/company/ireis/	https://www.instagram.com/realestateshow/	\`+971507450036, +971 52 5702 847, +971 2 674 4040, +971 2 582 4159	arun.bose@domeexhibitions.com	Not available	Media Partner list on the homepage
6	4	Dubai	Dubai Harbour	https://www.dubaiharbour.com/	Not able to find	Dubai International Boat Show	https://www.boatshowdubai.com/	2026-04-08	2026-04-12	Not avaiable	Show	Lifestyle (Yacht)	Not mentioned	DWTC	https://www.dwtc.com/en/	Not available	Not available	https://www.boatshowdubai.com/visitor/	Paid	https://www.boatshowdubai.com/media-partner/	https://www.linkedin.com/company/dubai-international-boat-show/	https://www.instagram.com/dibshow/	Not available	Not available	Neeraj.Dalal@dwtc.com / Avinash.Shanbhogue@dwtc.com	Not available	Organiser detail obtained by email address	Visitor Registration on Waiting list
7	5	Sharjah	Expo Center	https://expo-centre.ae/events/	https://expo-centre.ae/event/56th-watch-jewellery-middle-east-show/	Watch & Jewellery Middle East Show	https://www.mideastjewellery.com/	2025-10-24	2025-10-28	Not avaiable	Exhibition	Lifestyle (Watches and Jewelery / Jewellery and gems)	Not mentioned	Expo Centre Sharjah	https://expo-centre.ae/	Not available	Not able to find	https://register.mideastjewellery.com/registration/?event=MzU=&form=NjE=&lang=en&affiliate_partner=WJ5680	Free	https://www.mideastjewellery.com/	Not available	https://www.instagram.com/watchandjewelleryshow/	\`+971509641565	Not available	Not able to find	Not available	Media Partner list on the homepage	Organiser detail obtained by email address
8	5	Sharjah	Expo Center	https://expo-centre.ae/events/	https://expo-centre.ae/event/middle-east-cosmetics-show/	Middle East Cosmetics Show	https://mecosmeticsshow.ae/	2025-10-08	2025-10-12	Not avaiable	Exhibition	Lifestyle (Beauty and Cosmetics)	Not mentioned	Expo Centre Sharjah	https://expo-centre.ae/	Not available	Sharjah Chamber of Commerce & Industry	https://register.mecosmeticsshow.ae/visitor-registration.html	Free	Not available	Not available	https://www.instagram.com/mecosmeticsshow	Refer Whatsapp Column, +971-6-5770000, +971-6-5770496, +971 50 587 7797, +971 55 284 1211, +971 55 749 1984	hosam.m@expo-centre.ae / hazal@expo-centre.ae / hesham@expo-centre.ae / tasnim@expo-centre.ae	Not available
9	7	Dubai	DIFC	https://www.difc.com/whats-on/events	https://www.difc.com/whats-on/events/the-dubai-fixed-income-alternatives-conference	The Dubai Fixed Income Alternatives Conference	https://www.dealcatalyst.io/events/dubai-fixed-income-alternatives-conference	2025-10-09	2025-10-09	Ritz Carlton DIFC	Conference	Banking and Capital Markets	Not mentioned	Deal Catalyst	https://www.dealcatalyst.io/events	Not available	Not available	https://events.dealcatalyst.io/dubai-structured-credit-summit-2025/page/4135135/register	Free / Paid	https://events.dealcatalyst.io/dubai-structured-credit-summit-2025/page/4135137/sponsors	https://www.linkedin.com/company/dealcatalyst/	Not available	Not available	Not available	events@dealcatalyst.io	Not available	Media Partner list on the sponsors page link	Event Organisers could be either https://www.dealcatalyst.io/ or DIFC
10	9	Dubai	DFF	https://www.dubaifuture.ae/events	https://www.dubaifuture.ae/dubai-future-forum-2025	Dubai Future Forum 2025	https://www.dubaifuture.ae/dubai-future-forum-2025	2025-11-18	2025-11-19	Not avaiable	Conference	Future	Not mentioned	Dubai Future Foundation	https://www.dubaifuture.ae/	Not available	Not available	https://events.dubaifuture.ae/event/d85eec75-143d-46b2-b030-fde2e53bbb71/regProcessStep1	Free	https://www.dubaifuture.ae/dubai-future-forum-media	https://www.linkedin.com/showcase/dubai-future-forum/	https://www.instagram.com/dubaifuture/	Not available, +971 50 4377995	forum@dubaifuture.ae, gfs@dubaifuture.gov.ae	Not available`;

const parseEventData = (rawData) => {
  const lines = rawData.trim().split('\n');
  const events = [];

  for (const line of lines) {
    const fields = line.split('\t');

    // Pad fields to ensure we have at least 29 fields
    while (fields.length < 29) {
      fields.push('');
    }

    const event = {
      title: fields[6] || 'Untitled Event',
      slug: generateSlug(fields[6] || 'untitled-event'),
      description: '',
      eventType: mapEventType(fields[11]),
      startDate: new Date(fields[8]),
      endDate: new Date(fields[9]),
      timezone: 'Asia/Dubai',
      status: 'published',
      category: 'business',

      // Additional fields
      eventLocationNumber: parseInt(fields[1]) || null,
      emirate: fields[2] || null,
      eventLocationName: fields[3] || null,
      locationLink: validateUrl(fields[4]),
      eventVenueLink: validateUrl(fields[5]),
      eventWebsite: validateUrl(fields[7]),
      eventSubLocation: fields[10] || null,
      industry: fields[12] || null,
      audience: fields[13] || 'Not mentioned',
      eventOrganisedBy: fields[14] || null,
      eventOrganisedByWebsite: validateUrl(fields[15]),
      eventManagedBy: fields[16] || null,
      eventSupportedBy: fields[17] || null,
      eventRegistrationLink: validateUrl(fields[18]),
      eventRegistrationCharges: fields[19] || 'Free',
      mediaPartners: fields[20] || null,
      eventLinkedIn: validateUrl(fields[21]),
      eventInstagram: validateUrl(fields[22]),
      eventContactNumbers: parseContactNumbers(fields[23]),
      eventWhatsappNumbers: parseContactNumbers(fields[24]),
      eventContactEmails: parseEmails(fields[25]),
      eventContactTelegram: fields[26] || null,
      remarks1: fields[27] || null,
      remarks2: fields[28] || null,

      // Default values
      isPublic: true,
      allowRegistration: true,
      requireRegistration: false,
      createdBy: null // Will be set later
    };

    events.push(event);
  }

  return events;
};

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

const mapEventType = (type) => {
  const typeMap = {
    'Exhibition': 'exhibition',
    'Conference': 'conference',
    'Show': 'show'
  };
  return typeMap[type] || 'conference';
};

const parseContactNumbers = (numbers) => {
  if (!numbers || numbers === 'Not available') return [];
  return numbers.split(/[,/]/).map(num => num.trim()).filter(num => num);
};

const parseEmails = (emails) => {
  if (!emails || emails === 'Not available') return [];
  return emails.split(/[,/]/).map(email => email.trim()).filter(email => email);
};

const validateUrl = (url) => {
  if (!url || url === 'Not available' || url === 'Not able to find' || url === 'Event not available on Event Location Website Link') return null;
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
};

const importEvents = async () => {
  try {
    console.log('Starting event import...');

    // Get a default admin user for createdBy
    const defaultUser = await User.findOne();
    if (!defaultUser) {
      console.error('No users found in database. Please create a user first.');
      return;
    }

    const events = parseEventData(rawEventData);

    console.log(`Parsed ${events.length} events from data`);

    for (const eventData of events) {
      eventData.createdBy = defaultUser.id;

      // Check if event already exists
      const existingEvent = await Event.findOne({
        where: { slug: eventData.slug }
      });

      if (existingEvent) {
        console.log(`Event "${eventData.title}" already exists, skipping...`);
        continue;
      }

      await Event.create(eventData);
      console.log(`Created event: ${eventData.title}`);
    }

    console.log('Event import completed successfully!');
  } catch (error) {
    console.error('Error importing events:', error);
  }
};

// Execute if run directly
if (require.main === module) {
  importEvents()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

module.exports = importEvents;