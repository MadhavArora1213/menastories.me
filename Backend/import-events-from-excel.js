const { Event, Admin, Role } = require('./models');
const fs = require('fs');
const path = require('path');

// Parse the Excel data (tab-separated values)
const excelData = `SN	Event Location Number	Event Emirate	Event Location Name	Location Link	Event Venue Link	Event Name	Event Website	Starting Date	End Date	Event Sub Location	Event Type 	Industry	Audience	Event Organised by	Event Organised by Website Link	Event Managed by	Event Supported by	Event Registration Link	Event Registration Charges	Media Partners	Event Linkedin	Event Instagram	Event Contact Number/(s)	Event Whatsapp Number/(s)	Event Contact Email/(s)	Event Contact Telegram	Remarks 1	Remarks 2
1	2	Dubai	DWTC	https://www.dwtc.com/en/events/	https://www.dwtc.com/en/events/paper-arabia-2025/	Paper Arabia	https://www.paperarabia.com/	2025-09-02	2025-09-04	Hall 4	Exhibition	Paper, Packaging and Printing	Trade and Public	Al Fajer Information & Services	https://alfajer.net/	Not available	Not available	https://ae.sajilni.com/cart-new/checkout/169	Free	https://www.paperarabia.com/media_supporters.php	https://www.linkedin.com/in/paper-arabia-dubai-76209b172/	https://www.instagram.com/paperarabiauae/	+971 4 3406888	Not available	nair@alfajer.net	Not available
2	6	Dubai	DEC, Expo City	https://www.expocitydubai.com/en/things-to-do/events-and-workshops/	Not able to find	FESPA Middle East	https://www.fespamiddleeast.com/	2026-01-13	2026-01-15	Not avaiable	Exhibition	Printing and signage	Trade and Public	FESPA	https://www.fespa.com/en/	Not available	Not available	https://www.fespamiddleeast.com/visitor-interest-form	Free	https://www.fespaglobalprintexpo.com/news-hub/media-partners	https://www.linkedin.com/showcase/fespa-middle-east/	https://www.instagram.com/fespamiddleeast/	+971 555 710900	Not available	sales@fespa.com / marketing@fespa.com / operations@fespa.com / bazil.cassim@fespa.com / Shakoor.saban@fespa.com	Not available	Not sure about the media partner list. Please Ignore the Media Partner list for this event
3	3	Dubai	Festival Arena	https://festivalarenadubai.com/upcoming-events/	Event not available on Event Location Website Link	Blockchain Life	https://blockchain-life.com/	2025-10-28	2025-10-29	Not avaiable	Conference	Web 3 / Blockchain / Crypto	Not mentioned	Blockchain Life	Not applicabe	Not available	Not available	https://blockchain-life.com/#tickets-row	Paid	https://blockchain-life.com/	https://www.linkedin.com/company/blockchainlife2025/	https://www.instagram.com/blockchain_life_forum/	Not available	https://wa.me/79533662458	info@blockchain-life.com	https://t.me/BlockchainLifeSupport	Media Partner list on the homepage
4	8	Dubai	Madinath Jumeirah	https://www.jumeirah.com/en/stay/dubai/madinat-jumeirah/events/listing	Not able to find	Token 2049 Dubai	https://www.dubai.token2049.com/	2026-04-29	2026-04-30	Not avaiable	Conference	Web 3 / Blockchain / Crypto	Not mentioned	Token 2049	Not applicabe	Not available	Not available	https://forms.token2049.com/dubai/2026-waitlist	Paid	https://www.dubai.token2049.com/partners#media-partner	https://www.linkedin.com/company/token2049/	https://www.instagram.com/token2049/	Not available	Not available	info@token2049.com	https://t.me/token2049official	Visitor Registration on Waiting list
5	1	Abu Dhabi	ADNEC	https://www.adnec.ae/en/eventlisting	https://www.adnec.ae/en/eventlisting/international-real-estate-investment-show	International Real Estate & Investment Show	https://realestateshow.ae/	2025-09-12	2025-09-14	Hall 5	Exhibition	Real Estate	Not mentioned	DOME Exhibitions	www.domeexhibitions.com	Not available	Not available	https://realestateshow.ae/visitorregistration.html	Free	https://realestateshow.ae/	https://www.linkedin.com/company/ireis/	https://www.instagram.com/realestateshow/	+971507450036	+971 52 5702 847 +971 2 674 4040 | +971 2 582 4159	arun.bose@domeexhibitions.com	Not available	Media Partner list on the homepage
6	4	Dubai	Dubai Harbour	https://www.dubaiharbour.com/	Not able to find	Dubai International Boat Show	https://www.boatshowdubai.com/	2026-04-08	2026-04-12	Not avaiable	Show	Lifestyle (Yacht)	Not mentioned	DWTC	https://www.dwtc.com/en/	Not available	Not available	https://www.boatshowdubai.com/visitor/	Paid	https://www.boatshowdubai.com/media-partner/	https://www.linkedin.com/company/dubai-international-boat-show/	https://www.instagram.com/dibshow/	Not available	Not available	Neeraj.Dalal@dwtc.com / Avinash.Shanbhogue@dwtc.com	Not available	Oraniser detail obtained by email address Visitor Registration on Waiting list
7	5	Sharjah	Expo Center	https://expo-centre.ae/events/	https://expo-centre.ae/event/56th-watch-jewellery-middle-east-show/	Watch & Jewellery Middle East Show	https://www.mideastjewellery.com/	2025-10-24	2025-10-28	Not avaiable	Exhibition	Lifestyle (Watches and Jewelery / Jewellery and gems)	Not mentioned	Expo Centre Sharjah	https://expo-centre.ae/	Not available	Not able to find	https://register.mideastjewellery.com/registration/?event=MzU=&form=NjE=&lang=en&affiliate_partner=WJ5680	Free	https://www.mideastjewellery.com/	Not available	https://www.instagram.com/watchandjewelleryshow/	+971509641565	Not available	Not able to find	Not available	Media Partner list on the homepage Oraniser detail obtained by email address
8	5	Sharjah	Expo Center	https://expo-centre.ae/events/	https://expo-centre.ae/event/middle-east-cosmetics-show/	Middle East Cosmetics Show	https://mecosmeticsshow.ae/	2025-10-08	2025-10-12	Not avaiable	Exhibition	Lifestyle (Beauty and Cosmetics)	Not mentioned	Expo Centre Sharjah	https://expo-centre.ae/	Not available	Sharjah Chamber of Commerce & Industry	https://register.mecosmeticsshow.ae/visitor-registration.html	Free	Not available	Not available	https://www.instagram.com/mecosmeticsshow	Refer Whatsapp Column	+971-6-5770000 +971-6-5770496 +971 50 587 7797 +971 55 284 1211 +971 55 749 1984	hosam.m@expo-centre.ae / hazal@expo-centre.ae / hesham@expo-centre.ae / tasnim@expo-centre.ae	Not available
9	7	Dubai	DIFC	https://www.difc.com/whats-on/events	https://www.difc.com/whats-on/events/the-dubai-fixed-income-alternatives-conference	The Dubai Fixed Income Alternatives Conference	https://www.dealcatalyst.io/events/dubai-fixed-income-alternatives-conference	2025-10-09	2025-10-09	Ritz Carlton DIFC	Conference	Banking and Capital Markets	Not mentioned	Deal Catalyst	https://www.dealcatalyst.io/events	Not available	Not available	https://events.dealcatalyst.io/dubai-structured-credit-summit-2025/page/4135135/register	Free / Paid	https://events.dealcatalyst.io/dubai-structured-credit-summit-2025/page/4135137/sponsors	https://www.linkedin.com/company/dealcatalyst/	Not available	Not available	Not available	events@dealcatalyst.io	Not available	Media Partner list on the sponsors page link Event Organisers could be either https://www.dealcatalyst.io/ or DIFC
10	9	Dubai	DFF	https://www.dubaifuture.ae/events	https://www.dubaifuture.ae/dubai-future-forum-2025	Dubai Future Forum 2025	https://www.dubaifuture.ae/dubai-future-forum-2025	2025-11-18	2025-11-19	Not avaiable	Conference	Future	Not mentioned	Dubai Future Foundation	https://www.dubaifuture.ae/	Not available	Not available	https://events.dubaifuture.ae/event/d85eec75-143d-46b2-b030-fde2e53bbb71/regProcessStep1	Free	https://www.dubaifuture.ae/dubai-future-forum-media	https://www.linkedin.com/showcase/dubai-future-forum/	https://www.instagram.com/dubaifuture/	Not available	+971 50 4377995	forum@dubaifuture.ae gfs@dubaifuture.gov.ae	Not available`;

async function importEvents() {
  try {
    console.log('🚀 Starting event import from Excel data...');

    // Get the first admin user to set as createdBy
    const admin = await Admin.findOne({
      include: [{
        model: Role,
        as: 'role',
        where: { name: 'Master Admin' }
      }]
    });

    if (!admin) {
      // Try to find any admin user
      const anyAdmin = await Admin.findOne();
      if (!anyAdmin) {
        console.log('❌ No admin users found. Please create an admin user first.');
        return;
      }
      console.log('⚠️  No Master Admin found, using first available admin user.');
      admin = anyAdmin;
    }

    // Parse the TSV data
    const lines = excelData.trim().split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());

    console.log(`📊 Found ${lines.length - 1} events to import...`);

    let importedCount = 0;
    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t').map(v => v.trim());

      if (values.length < 2 || !values[6]) continue; // Skip empty rows

      const eventData = {};

      // Map Excel columns to Event model fields
      headers.forEach((header, index) => {
        const value = values[index] || '';

        switch (header) {
          case 'Event Name':
            eventData.title = value;
            break;
          case 'Event Website':
            eventData.eventWebsite = value;
            break;
          case 'Starting Date':
            eventData.startDate = value ? new Date(value) : null;
            break;
          case 'End Date':
            eventData.endDate = value ? new Date(value) : null;
            break;
          case 'Event Sub Location':
            eventData.eventSubLocation = value;
            break;
          case 'Event Type':
            // Map Excel event types to our enum values
            const typeMapping = {
              'Exhibition': 'exhibition',
              'Conference': 'conference',
              'Show': 'show'
            };
            eventData.eventType = typeMapping[value] || 'conference';
            break;
          case 'Industry':
            // Map Excel industries to our enum values
            const industryMapping = {
              'Paper, Packaging and Printing': 'Paper, Packaging and Printing',
              'Printing and signage': 'Printing and signage',
              'Web 3 / Blockchain / Crypto': 'Web 3 / Blockchain / Crypto',
              'Real Estate': 'Real Estate',
              'Lifestyle (Yacht)': 'Lifestyle (Yacht)',
              'Lifestyle (Watches and Jewelery / Jewellery and gems)': 'Lifestyle (Watches and Jewelery / Jewellery and gems)',
              'Lifestyle (Beauty and Cosmetics)': 'Lifestyle (Beauty and Cosmetics)',
              'Banking and Capital Markets': 'Banking and Capital Markets',
              'Future': 'Future'
            };
            eventData.industry = industryMapping[value] || 'Other';
            break;
          case 'Audience':
            eventData.audience = value;
            break;
          case 'Event Organised by':
            eventData.eventOrganisedBy = value;
            break;
          case 'Event Organised by Website Link':
            eventData.eventOrganisedByWebsite = value;
            break;
          case 'Event Managed by':
            eventData.eventManagedBy = value;
            break;
          case 'Event Supported by':
            eventData.eventSupportedBy = value;
            break;
          case 'Event Registration Link':
            eventData.eventRegistrationLink = value;
            break;
          case 'Event Registration Charges':
            eventData.eventRegistrationCharges = value;
            break;
          case 'Media Partners':
            eventData.mediaPartners = value;
            break;
          case 'Event Linkedin':
            if (value) {
              eventData.socialLinks = eventData.socialLinks || {};
              eventData.socialLinks.linkedin = value;
            }
            break;
          case 'Event Instagram':
            if (value) {
              eventData.socialLinks = eventData.socialLinks || {};
              eventData.socialLinks.instagram = value;
            }
            break;
          case 'Event Contact Number/(s)':
            if (value) {
              eventData.eventContactNumbers = value.split(',').map(num => num.trim());
            }
            break;
          case 'Event Whatsapp Number/(s)':
            if (value) {
              eventData.eventWhatsappNumbers = value.split(',').map(num => num.trim());
            }
            break;
          case 'Event Contact Email/(s)':
            if (value) {
              eventData.eventContactEmails = value.split('/').map(email => email.trim());
            }
            break;
          case 'Event Contact Telegram':
            eventData.eventContactTelegram = value;
            break;
          case 'Remarks 1':
            eventData.remarks1 = value;
            break;
          case 'Remarks 2':
            eventData.remarks2 = value;
            break;
          case 'Event Emirate':
            eventData.emirate = value;
            break;
          case 'Event Location Name':
            eventData.eventLocationName = value;
            break;
          case 'Location Link':
            eventData.locationLink = value;
            break;
          case 'Event Venue Link':
            eventData.eventVenueLink = value;
            break;
          case 'Event Location Number':
            eventData.eventLocationNumber = value ? parseInt(value) : null;
            break;
        }
      });

      // Set required fields and defaults
      eventData.status = 'published'; // Import as published since these are official events
      eventData.category = 'business'; // Default category
      eventData.timezone = 'UTC+4'; // UAE timezone
      eventData.createdBy = admin.id;
      eventData.isUserSubmitted = false;

      // Generate slug
      if (eventData.title) {
        eventData.slug = eventData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      // Set venue information
      if (eventData.eventLocationName) {
        eventData.venue = {
          name: eventData.eventLocationName,
          city: eventData.emirate || 'Dubai',
          country: 'UAE'
        };
      }

      // Set contact info
      if (eventData.eventContactEmails && eventData.eventContactEmails.length > 0) {
        eventData.contactInfo = {
          email: eventData.eventContactEmails[0],
          organizer: eventData.eventOrganisedBy
        };
      }

      // Set website
      if (eventData.eventWebsite) {
        eventData.website = eventData.eventWebsite;
        if (eventData.socialLinks) {
          eventData.socialLinks.website = eventData.eventWebsite;
        } else {
          eventData.socialLinks = { website: eventData.eventWebsite };
        }
      }

      try {
        // Check if event already exists
        const existingEvent = await Event.findOne({
          where: { slug: eventData.slug }
        });

        if (existingEvent) {
          console.log(`⏭️  Skipping existing event: ${eventData.title}`);
          skippedCount++;
          continue;
        }

        await Event.create(eventData);
        console.log(`✅ Imported event: ${eventData.title}`);
        importedCount++;

      } catch (error) {
        console.error(`❌ Error importing event "${eventData.title}":`, error.message);
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`📊 Events imported: ${importedCount}`);
    console.log(`⏭️  Events skipped: ${skippedCount}`);
    console.log(`📈 Total processed: ${importedCount + skippedCount}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the import
importEvents();