const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { Event, User, Role } = require('../models');
const { Op } = require('sequelize');

// Function to parse Excel data
function parseExcelData(excelFilePath) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);

    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Use first row as headers
      defval: null, // Default value for empty cells
      blankrows: false // Skip blank rows
    });

    if (jsonData.length === 0) {
      throw new Error('Excel file is empty');
    }

    const headers = jsonData[0].map(h => h ? h.toString().trim() : '');
    const events = [];

    // Process each row starting from row 1 (skip headers)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.length > 0 && row[0]) { // Check if row has data
        const event = {};

        headers.forEach((header, index) => {
          let value = row[index];

          // Convert to string and clean up
          if (value !== null && value !== undefined) {
            value = value.toString().trim();

            // Handle "Not available" and similar values
            if (value.toLowerCase() === 'not available' ||
                value.toLowerCase() === 'not able to find' ||
                value.toLowerCase() === 'not applicabe' ||
                value.toLowerCase() === 'n/a' ||
                value === '') {
              value = null;
            }
          } else {
            value = null;
          }

          event[header] = value;
        });

        events.push(event);
      }
    }

    console.log(`📊 Parsed ${events.length} rows from Excel file`);
    console.log('📋 Headers found:', headers);
    console.log('📋 First row data:', jsonData[0]);
    console.log('📋 Second row data:', jsonData[1]);
    console.log('📋 Third row data:', jsonData[2]);

    return events;
  } catch (error) {
    console.error('❌ Error parsing Excel file:', error.message);
    throw error;
  }
}

// Function to convert Excel serial date to JavaScript Date
function excelSerialToDate(serial) {
  if (!serial || isNaN(serial)) return null;

  // Check if it's already a valid date string
  if (typeof serial === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(serial)) {
    return new Date(serial);
  }

  // Excel serial dates start from 1900-01-01
  const excelEpoch = new Date(1900, 0, 1);
  const days = parseInt(serial) - 2; // Excel has a bug where 1900 is treated as a leap year
  const milliseconds = days * 24 * 60 * 60 * 1000;

  return new Date(excelEpoch.getTime() + milliseconds);
}

// Function to parse contact numbers from string
function parseContactNumbers(contactString) {
  if (!contactString) return [];

  // Split by common delimiters and clean up
  const numbers = contactString.split(/[,;/]/)
    .map(num => num.trim())
    .filter(num => num && num !== 'Not available')
    .map(num => {
      // Clean up phone number format
      return num.replace(/[^\d+\-\s()]/g, '').trim();
    });

  return numbers.filter(num => num.length > 0);
}

// Function to parse emails from string
function parseEmails(emailString) {
  if (!emailString) return [];

  // Split by common delimiters and clean up
  const emails = emailString.split(/[,;/]/)
    .map(email => email.trim())
    .filter(email => email && email !== 'Not available' && email.includes('@'))
    .map(email => email.replace(/[()]/g, '').trim());

  return emails.filter(email => email.length > 0);
}

// Function to clean URL by extracting the actual URL from text
function cleanUrl(urlString) {
  if (!urlString) return null;

  // Remove extra text and parentheses, extract just the URL
  const urlMatch = urlString.match(/https?:\/\/[^\s)]+/);
  if (urlMatch) {
    let url = urlMatch[0];
    // Remove trailing punctuation that might be included
    url = url.replace(/[.,;]$/, '');
    // Basic URL validation
    try {
      new URL(url);
      return url;
    } catch (e) {
      console.log(`Invalid URL detected: ${url}`);
      return null;
    }
  }

  // If no URL found, return null to avoid validation errors
  return null;
}

// Function to map Excel data to Event model
function mapExcelToEvent(excelRow, adminUserId) {
  const eventData = {
    createdBy: adminUserId,
    status: 'published',
    currency: 'AED',
    timezone: 'Asia/Dubai'
  };

  // Basic event information
  eventData.title = excelRow['Event Name'] || 'Untitled Event';
  eventData.description = `Event organized by ${excelRow['Event Organised by'] || 'Unknown Organizer'}`;
  eventData.shortDescription = excelRow['Event Name'] || '';

  // Generate slug from title
  eventData.slug = eventData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Dates - handle Excel serial format
  const startDateStr = excelRow['Starting Date'];
  const endDateStr = excelRow['End Date'];

  console.log(`Date parsing for "${excelRow['Event Name'] || 'Unnamed'}": start=${startDateStr}, end=${endDateStr}`);

  if (startDateStr) {
    const startDate = excelSerialToDate(startDateStr) || new Date(startDateStr);
    if (startDate && !isNaN(startDate.getTime())) {
      eventData.startDate = startDate;
      console.log(`✅ Parsed start date: ${startDate.toISOString()}`);
    } else {
      console.log(`❌ Failed to parse start date: ${startDateStr}`);
    }
  }

  if (endDateStr) {
    const endDate = excelSerialToDate(endDateStr) || new Date(endDateStr);
    if (endDate && !isNaN(endDate.getTime())) {
      eventData.endDate = endDate;
      console.log(`✅ Parsed end date: ${endDate.toISOString()}`);
    } else {
      console.log(`❌ Failed to parse end date: ${endDateStr}`);
    }
  }

  // If we don't have valid dates, skip this event
  if (!eventData.startDate || !eventData.endDate) {
    console.log(`⚠️  Skipping event due to missing/invalid dates`);
    return null;
  }

  // Event type mapping
  const eventTypeMap = {
    'Exhibition': 'exhibition',
    'Conference': 'conference',
    'Show': 'trade_show',
    'Seminar': 'seminar',
    'Workshop': 'workshop'
  };
  eventData.eventType = eventTypeMap[excelRow['Event Type ']] || 'conference';

  // Category mapping
  const categoryMap = {
    'Business': 'business',
    'Entertainment': 'entertainment',
    'Cultural': 'cultural',
    'Social': 'social',
    'Educational': 'educational',
    'Fashion': 'fashion',
    'Lifestyle': 'lifestyle',
    'Technology': 'technology',
    'Health': 'health',
    'Sports': 'sports'
  };
  eventData.category = categoryMap[excelRow['Industry']] || 'business';

  // Venue information
  eventData.venue = {
    name: excelRow['Event Location Name'] || excelRow['Event Venue Link'] || 'TBD',
    address: excelRow['Event Sub Location'] || '',
    city: excelRow['Event Emirate'] || '',
    country: 'UAE'
  };

  // Social links - clean URLs
  eventData.socialLinks = {
    website: cleanUrl(excelRow['Event Website']) || cleanUrl(excelRow['Event Organised by Website Link']),
    linkedin: cleanUrl(excelRow['Event Linkedin']),
    instagram: cleanUrl(excelRow['Event Instagram'])
  };

  // Contact information
  eventData.contactInfo = {
    organizer: excelRow['Event Organised by'],
    email: parseEmails(excelRow['Event Contact Email/(s)']),
    phone: parseContactNumbers(excelRow['Event Contact Number/(s)'])
  };

  // Registration settings
  const registrationCharges = excelRow['Event Registration Charges'];
  eventData.price = registrationCharges === 'Free' ? 0 : null;
  eventData.registrationSettings = {
    requireApproval: false,
    allowWaitlist: true,
    maxTicketsPerPerson: 1
  };

  // Excel-specific fields - clean URLs
  eventData.eventLocationNumber = excelRow['Event Location Number'] ? parseInt(excelRow['Event Location Number']) : null;
  eventData.emirate = excelRow['Event Emirate'];
  eventData.eventLocationName = excelRow['Event Location Name'];
  eventData.locationLink = cleanUrl(excelRow['Location Link']);
  eventData.eventVenueLink = cleanUrl(excelRow['Event Venue Link']);
  eventData.eventWebsite = cleanUrl(excelRow['Event Website']);
  eventData.eventSubLocation = excelRow['Event Sub Location'];
  eventData.industry = excelRow['Industry'];
  eventData.audience = excelRow['Audience'];
  eventData.eventOrganisedBy = excelRow['Event Organised by'];
  eventData.eventOrganisedByWebsite = cleanUrl(excelRow['Event Organised by Website Link']);
  eventData.eventManagedBy = excelRow['Event Managed by'];
  eventData.eventSupportedBy = excelRow['Event Supported by'];
  eventData.eventRegistrationLink = cleanUrl(excelRow['Event Registration Link']);
  eventData.eventRegistrationCharges = excelRow['Event Registration Charges'];
  eventData.mediaPartners = excelRow['Media Partners'];
  eventData.eventLinkedIn = cleanUrl(excelRow['Event Linkedin']);
  eventData.eventInstagram = cleanUrl(excelRow['Event Instagram']);
  eventData.eventContactNumbers = parseContactNumbers(excelRow['Event Contact Number/(s)']);
  eventData.eventWhatsappNumbers = parseContactNumbers(excelRow['Event Whatsapp Number/(s)']);
  eventData.eventContactEmails = parseEmails(excelRow['Event Contact Email/(s)']);
  eventData.eventContactTelegram = excelRow['Event Contact Telegram'];
  eventData.remarks1 = excelRow['Remarks 1'];
  eventData.remarks2 = excelRow['Remarks 2'];

  return eventData;
}

// Main import function
async function importEventsFromExcel(excelFilePath) {
  try {
    console.log('🚀 Starting Excel import process...');

    // Parse the Excel data
    const excelRows = parseExcelData(excelFilePath);
    console.log(`📊 Parsed ${excelRows.length} rows from Excel`);

    // Get admin user for createdBy field
    const adminUser = await User.findOne({
      include: [
        {
          model: Role,
          as: 'role',
          where: { isAdmin: true }
        }
      ],
      where: {
        isActive: true
      }
    });

    if (!adminUser) {
      throw new Error('No admin user found. Please create an admin user first.');
    }

    console.log(`👤 Using admin user: ${adminUser.username} (ID: ${adminUser.id})`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each row
    for (let i = 0; i < excelRows.length; i++) {
      const row = excelRows[i];

      try {
        console.log(`\n📝 Processing row ${i + 1}: ${row['Event Name'] || 'Unnamed Event'}`);

        // Map Excel data to Event model
        const eventData = mapExcelToEvent(row, adminUser.id);

        // Skip if mapping failed (invalid dates)
        if (!eventData) {
          console.log(`⚠️  Skipping row ${i + 1} due to invalid data`);
          errorCount++;
          continue;
        }

        // Check if event already exists (by title and date)
        const existingEvent = await Event.findOne({
          where: {
            title: eventData.title,
            startDate: eventData.startDate
          }
        });

        if (existingEvent) {
          console.log(`⚠️  Event already exists: ${eventData.title}`);
          continue;
        }

        if (existingEvent) {
          console.log(`⚠️  Event already exists: ${eventData.title}`);
          continue;
        }

        // Create the event
        try {
          const event = await Event.create(eventData);
          console.log(`✅ Created event: ${event.title} (ID: ${event.id})`);
          successCount++;
        } catch (createError) {
          console.error(`❌ Failed to create event "${eventData.title}":`, createError.message);
          if (createError.errors) {
            createError.errors.forEach(err => {
              console.error(`   - ${err.path}: ${err.message} (value: ${err.value})`);
            });
          }
          errorCount++;
          continue;
        }

      } catch (error) {
        console.error(`❌ Error processing row ${i + 1}:`, error.message);
        errors.push({
          row: i + 1,
          eventName: row['Event Name'],
          error: error.message
        });
        errorCount++;
      }
    }

    // Summary
    console.log('\n📈 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount} events`);
    console.log(`❌ Failed to import: ${errorCount} events`);

    if (errors.length > 0) {
      console.log('\n🚨 Errors:');
      errors.forEach(err => {
        console.log(`Row ${err.row} (${err.eventName}): ${err.error}`);
      });
    }

    return {
      success: true,
      totalRows: excelRows.length,
      successCount,
      errorCount,
      errors
    };

  } catch (error) {
    console.error('💥 Import failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  const excelFilePath = process.argv[2];

  if (!excelFilePath) {
    console.error('❌ Please provide the path to the Excel file');
    console.log('Usage: node importEventsFromExcel.js <path-to-excel-file>');
    process.exit(1);
  }

  if (!fs.existsSync(excelFilePath)) {
    console.error('❌ Excel file not found:', excelFilePath);
    process.exit(1);
  }

  importEventsFromExcel(excelFilePath)
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Import completed successfully!');
        process.exit(0);
      } else {
        console.error('\n💥 Import failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { importEventsFromExcel, parseExcelData, mapExcelToEvent };