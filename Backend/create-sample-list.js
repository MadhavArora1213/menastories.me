const { List, ListEntry, Admin } = require('./models');
const fs = require('fs');
const path = require('path');

async function createSampleList() {
  try {
    console.log('🚀 Creating sample list with Top 30 Companies CEOs...');

    // Get the first admin user (you might want to change this logic)
    const admin = await Admin.findOne();
    if (!admin) {
      console.error('❌ No admin user found. Please create an admin user first.');
      return;
    }

    // Check if list already exists
    let list = await List.findOne({ where: { slug: 'top-30-companies-ceos-2025' } });

    if (list) {
      console.log('✅ Sample list already exists:', list.title);
      console.log(`📊 List ID: ${list.id}`);
      console.log(`📊 List Slug: ${list.slug}`);

      // Check if entries already exist
      const existingEntries = await ListEntry.findAll({ where: { listId: list.id } });
      if (existingEntries.length > 0) {
        console.log(`📊 Found ${existingEntries.length} existing entries`);
        console.log('🎉 Sample list verification completed!');
        return;
      }
    } else {
      // Create the main list
      list = await List.create({
        title: 'Top 30 Companies CEOs 2025',
        slug: 'top-30-companies-ceos-2025',
      description: 'A comprehensive list of the top 30 company CEOs for 2025, featuring visionary leaders driving innovation and growth across various industries.',
      content: 'This curated list highlights the most influential CEOs leading major corporations worldwide. These executives are shaping the future of business through strategic innovation, digital transformation, and sustainable practices.',
      category: 'Business & Leadership',
      year: '2025',
      recommended: true,
      leaders: true,
      companies: true,
      methodology: 'This list was compiled based on company performance, innovation metrics, leadership impact, and market influence. Rankings consider revenue growth, market share, employee satisfaction, and industry disruption.',
      metaTitle: 'Top 30 Companies CEOs 2025 | Leading Business Executives',
      metaDescription: 'Discover the top 30 company CEOs of 2025 driving innovation and growth across global industries. Meet the visionary leaders shaping business future.',
      status: 'published',
      createdBy: admin.id,
      updatedBy: admin.id
    });

    console.log('✅ Created main list:', list.title);
  }

    // Sample CEO data
    const ceoData = [
      {
        name: 'Satya Nadella',
        rank: 1,
        designation: 'Chief Executive Officer',
        company: 'Microsoft Corporation',
        residence: 'Bellevue, Washington, USA',
        description: 'Transformed Microsoft into a cloud-first, AI-driven company with Azure and Office 365 success.',
        nationality: 'Indian-American',
        category: 'Technology'
      },
      {
        name: 'Tim Cook',
        rank: 2,
        designation: 'Chief Executive Officer',
        company: 'Apple Inc.',
        residence: 'Cupertino, California, USA',
        description: 'Led Apple through the post-Steve Jobs era, focusing on privacy, sustainability, and services growth.',
        nationality: 'American',
        category: 'Technology'
      },
      {
        name: 'Andy Jassy',
        rank: 3,
        designation: 'Chief Executive Officer',
        company: 'Amazon Web Services',
        residence: 'Seattle, Washington, USA',
        description: 'Former AWS CEO who helped build the cloud computing giant into a trillion-dollar business.',
        nationality: 'American',
        category: 'Technology'
      },
      {
        name: 'Mark Zuckerberg',
        rank: 4,
        designation: 'Chief Executive Officer',
        company: 'Meta Platforms Inc.',
        residence: 'Menlo Park, California, USA',
        description: 'Founder and CEO of Meta, driving the metaverse vision and social media innovation.',
        nationality: 'American',
        category: 'Technology'
      },
      {
        name: 'Sundar Pichai',
        rank: 5,
        designation: 'Chief Executive Officer',
        company: 'Alphabet Inc.',
        residence: 'Mountain View, California, USA',
        description: 'Leads Google\'s parent company, overseeing search, YouTube, and AI initiatives.',
        nationality: 'Indian-American',
        category: 'Technology'
      },
      {
        name: 'Jensen Huang',
        rank: 6,
        designation: 'Chief Executive Officer',
        company: 'NVIDIA Corporation',
        residence: 'Santa Clara, California, USA',
        description: 'Founder and CEO of NVIDIA, pioneer in GPU technology and AI computing.',
        nationality: 'Taiwanese-American',
        category: 'Technology'
      },
      {
        name: 'Lisa Su',
        rank: 7,
        designation: 'Chief Executive Officer',
        company: 'Advanced Micro Devices (AMD)',
        residence: 'Santa Clara, California, USA',
        description: 'First woman to lead AMD, transformed the company into a major competitor to Intel.',
        nationality: 'Taiwanese-American',
        category: 'Technology'
      },
      {
        name: 'Arvind Krishna',
        rank: 8,
        designation: 'Chief Executive Officer',
        company: 'IBM Corporation',
        residence: 'Armonk, New York, USA',
        description: 'Leads IBM\'s transformation toward hybrid cloud and AI solutions.',
        nationality: 'Indian-American',
        category: 'Technology'
      },
      {
        name: 'Gwynne Shotwell',
        rank: 9,
        designation: 'President and Chief Operating Officer',
        company: 'SpaceX',
        residence: 'Hawthorne, California, USA',
        description: 'Key executive at SpaceX, overseeing commercial and government contracts.',
        nationality: 'American',
        category: 'Aerospace'
      },
      {
        name: 'Elon Musk',
        rank: 10,
        designation: 'Chief Executive Officer',
        company: 'Tesla, Inc.',
        residence: 'Austin, Texas, USA',
        description: 'CEO of Tesla and SpaceX, driving electric vehicles and space exploration.',
        nationality: 'South African-American',
        category: 'Automotive'
      },
      {
        name: 'Mary Barra',
        rank: 11,
        designation: 'Chief Executive Officer',
        company: 'General Motors Company',
        residence: 'Detroit, Michigan, USA',
        description: 'First female CEO of GM, leading the transition to electric vehicles.',
        nationality: 'American',
        category: 'Automotive'
      },
      {
        name: 'Albert Small Jr.',
        rank: 12,
        designation: 'Chief Executive Officer',
        company: 'Southern National Bancorp',
        residence: 'Winston-Salem, North Carolina, USA',
        description: 'Leads one of the largest banks in the southeastern United States.',
        nationality: 'American',
        category: 'Banking'
      },
      {
        name: 'Jamie Dimon',
        rank: 13,
        designation: 'Chief Executive Officer',
        company: 'JPMorgan Chase & Co.',
        residence: 'New York City, New York, USA',
        description: 'Longest-serving CEO of a major U.S. bank, overseeing global financial operations.',
        nationality: 'American',
        category: 'Banking'
      },
      {
        name: 'Warren Buffett',
        rank: 14,
        designation: 'Chief Executive Officer',
        company: 'Berkshire Hathaway Inc.',
        residence: 'Omaha, Nebraska, USA',
        description: 'Legendary investor and CEO of Berkshire Hathaway, one of the world\'s largest conglomerates.',
        nationality: 'American',
        category: 'Investment'
      },
      {
        name: 'Reed Hastings',
        rank: 15,
        designation: 'Chief Executive Officer',
        company: 'Netflix, Inc.',
        residence: 'Los Gatos, California, USA',
        description: 'Co-founder and CEO of Netflix, revolutionized streaming entertainment.',
        nationality: 'American',
        category: 'Entertainment'
      },
      {
        name: 'Bob Iger',
        rank: 16,
        designation: 'Chief Executive Officer',
        company: 'The Walt Disney Company',
        residence: 'Burbank, California, USA',
        description: 'Returned as Disney CEO, overseeing theme parks, streaming, and content creation.',
        nationality: 'American',
        category: 'Entertainment'
      },
      {
        name: 'Brian Chesky',
        rank: 17,
        designation: 'Chief Executive Officer',
        company: 'Airbnb, Inc.',
        residence: 'San Francisco, California, USA',
        description: 'Co-founder and CEO of Airbnb, transformed the hospitality industry.',
        nationality: 'American',
        category: 'Hospitality'
      },
      {
        name: 'Daniel Zhang',
        rank: 18,
        designation: 'Chief Executive Officer',
        company: 'Alibaba Group Holding Limited',
        residence: 'Hangzhou, China',
        description: 'Leads Alibaba, China\'s largest e-commerce company and tech conglomerate.',
        nationality: 'Chinese',
        category: 'E-commerce'
      },
      {
        name: 'Jeff Bezos',
        rank: 19,
        designation: 'Executive Chairman',
        company: 'Amazon.com, Inc.',
        residence: 'Seattle, Washington, USA',
        description: 'Founder of Amazon, transitioned to Executive Chairman while remaining influential.',
        nationality: 'American',
        category: 'E-commerce'
      },
      {
        name: 'Andrew Wilson',
        rank: 20,
        designation: 'Chief Executive Officer',
        company: 'Electronic Arts Inc.',
        residence: 'Redwood City, California, USA',
        description: 'Leads EA, one of the world\'s largest video game companies.',
        nationality: 'American',
        category: 'Gaming'
      },
      {
        name: 'Bobby Kotick',
        rank: 21,
        designation: 'Chief Executive Officer',
        company: 'Activision Blizzard, Inc.',
        residence: 'Santa Monica, California, USA',
        description: 'CEO of Activision Blizzard, overseeing major game franchises like Call of Duty.',
        nationality: 'American',
        category: 'Gaming'
      },
      {
        name: 'Emma Walmsley',
        rank: 22,
        designation: 'Chief Executive Officer',
        company: 'GSK plc',
        residence: 'London, United Kingdom',
        description: 'Leads GSK, a major pharmaceutical and healthcare company.',
        nationality: 'British',
        category: 'Pharmaceuticals'
      },
      {
        name: 'Albert Bourla',
        rank: 23,
        designation: 'Chief Executive Officer',
        company: 'Pfizer Inc.',
        residence: 'New York City, New York, USA',
        description: 'CEO of Pfizer during the COVID-19 vaccine development and distribution.',
        nationality: 'Greek-American',
        category: 'Pharmaceuticals'
      },
      {
        name: 'Rouaissi Toufik',
        rank: 24,
        designation: 'Chief Executive Officer',
        company: 'Sanofi S.A.',
        residence: 'Paris, France',
        description: 'Leads Sanofi, a global pharmaceutical company focused on vaccines and medicines.',
        nationality: 'French',
        category: 'Pharmaceuticals'
      },
      {
        name: 'Pascal Soriot',
        rank: 25,
        designation: 'Chief Executive Officer',
        company: 'AstraZeneca plc',
        residence: 'Cambridge, United Kingdom',
        description: 'CEO of AstraZeneca, leading pharmaceutical innovation and COVID-19 vaccine development.',
        nationality: 'French-British',
        category: 'Pharmaceuticals'
      },
      {
        name: 'Christophe Catoir',
        rank: 26,
        designation: 'Chief Executive Officer',
        company: 'Sanofi Pasteur',
        residence: 'Lyon, France',
        description: 'Leads Sanofi\'s vaccine division, crucial for global immunization efforts.',
        nationality: 'French',
        category: 'Pharmaceuticals'
      },
      {
        name: 'Paul Hudson',
        rank: 27,
        designation: 'Chief Executive Officer',
        company: 'Sanofi',
        residence: 'Paris, France',
        description: 'CEO overseeing Sanofi\'s global operations and strategic direction.',
        nationality: 'British',
        category: 'Pharmaceuticals'
      },
      {
        name: 'Carlos Tavares',
        rank: 28,
        designation: 'Chief Executive Officer',
        company: 'Stellantis N.V.',
        residence: 'Amsterdam, Netherlands',
        description: 'CEO of Stellantis, formed by the merger of FCA and PSA Group.',
        nationality: 'Portuguese',
        category: 'Automotive'
      },
      {
        name: 'Herbert Diess',
        rank: 29,
        designation: 'Chief Executive Officer',
        company: 'Volkswagen Group',
        residence: 'Wolfsburg, Germany',
        description: 'Leads Volkswagen through its electric vehicle transformation.',
        nationality: 'Austrian',
        category: 'Automotive'
      },
      {
        name: 'Oliver Blume',
        rank: 30,
        designation: 'Chief Executive Officer',
        company: 'Porsche AG',
        residence: 'Stuttgart, Germany',
        description: 'CEO of Porsche, overseeing luxury sports cars and electric vehicle development.',
        nationality: 'German',
        category: 'Automotive'
      }
    ];

    // Create list entries
    const listEntries = [];
    for (const ceo of ceoData) {
      // Generate slug manually since the hook might not be working
      const slugify = require('slugify');
      let slug = slugify(ceo.name, { lower: true, strict: true });

      // Check for duplicate slugs within the same list
      const existingSlug = await ListEntry.findOne({
        where: {
          slug: slug,
          listId: list.id
        }
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }

      const entry = await ListEntry.create({
        listId: list.id,
        name: ceo.name,
        slug: slug,
        rank: ceo.rank,
        designation: ceo.designation,
        company: ceo.company,
        residence: ceo.residence,
        description: ceo.description,
        nationality: ceo.nationality,
        category: ceo.category,
        status: 'active',
        createdBy: admin.id,
        updatedBy: admin.id
      });
      listEntries.push(entry);
    }

    console.log(`✅ Created ${listEntries.length} CEO entries for the list`);
    console.log('🎉 Sample list creation completed successfully!');
    console.log(`📊 List ID: ${list.id}`);
    console.log(`📊 List Slug: ${list.slug}`);
    console.log(`📊 Total Entries: ${listEntries.length}`);

  } catch (error) {
    console.error('❌ Error creating sample list:', error);
    throw error;
  }
}

// Run the function
if (require.main === module) {
  createSampleList()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSampleList };