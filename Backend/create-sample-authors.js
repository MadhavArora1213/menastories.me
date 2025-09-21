require('dotenv').config();
const { Author } = require('./models');
const sequelize = require('./config/db');

// Sample authors data
const sampleAuthors = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@magazine.com',
    title: 'Senior Technology Journalist',
    bio: 'Sarah has been covering technology and innovation for over 10 years, with a focus on AI, blockchain, and emerging technologies.',
    experience: '10+ years in technology journalism',
    education: 'MBA in Business Administration, BS in Computer Science',
    social_media: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: 'https://twitter.com/sarahjtech'
    },
    is_active: true
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@magazine.com',
    title: 'Business & Finance Editor',
    bio: 'Michael specializes in financial markets, startup ecosystems, and economic analysis with extensive experience in business journalism.',
    experience: '8+ years in business and finance reporting',
    education: 'MS in Finance, BA in Economics',
    social_media: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      twitter: 'https://twitter.com/michaelcfinance'
    },
    is_active: true
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@magazine.com',
    title: 'Healthcare & Life Sciences Correspondent',
    bio: 'Dr. Rodriguez brings medical expertise and journalistic insight to cover healthcare innovation, biotechnology, and medical research.',
    experience: '12+ years in healthcare journalism, MD background',
    education: 'MD from Johns Hopkins, MPH in Public Health',
    social_media: {
      linkedin: 'https://linkedin.com/in/emilyrodriguez',
      twitter: 'https://twitter.com/emilyrhealth'
    },
    is_active: true
  },
  {
    name: 'David Thompson',
    email: 'david.thompson@magazine.com',
    title: 'Real Estate & Property Analyst',
    bio: 'David covers real estate markets, property development, and investment trends with deep knowledge of global property markets.',
    experience: '15+ years in real estate journalism and analysis',
    education: 'MBA in Real Estate, BS in Business Administration',
    social_media: {
      linkedin: 'https://linkedin.com/in/davidthompson',
      twitter: 'https://twitter.com/davidtrealestate'
    },
    is_active: true
  },
  {
    name: 'Lisa Park',
    email: 'lisa.park@magazine.com',
    title: 'Consumer Trends & Lifestyle Writer',
    bio: 'Lisa explores consumer behavior, lifestyle trends, and cultural shifts that shape modern society and business.',
    experience: '7+ years in lifestyle and consumer journalism',
    education: 'MA in Cultural Studies, BA in Communications',
    social_media: {
      linkedin: 'https://linkedin.com/in/lisapark',
      twitter: 'https://twitter.com/lisapconsumer'
    },
    is_active: true
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@magazine.com',
    title: 'Web3 & Blockchain Specialist',
    bio: 'James is an expert in decentralized technologies, cryptocurrencies, and the future of digital economies.',
    experience: '6+ years covering blockchain and crypto industries',
    education: 'MS in Computer Science, Blockchain certification',
    social_media: {
      linkedin: 'https://linkedin.com/in/jameswilson',
      twitter: 'https://twitter.com/jameswblockchain'
    },
    is_active: true
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@magazine.com',
    title: 'Hospitality & Tourism Reporter',
    bio: 'Maria covers the hospitality industry, travel trends, and tourism innovation with a global perspective.',
    experience: '9+ years in travel and hospitality journalism',
    education: 'MA in Tourism Management, BA in International Relations',
    social_media: {
      linkedin: 'https://linkedin.com/in/mariagarcia',
      twitter: 'https://twitter.com/mariaghospitality'
    },
    is_active: true
  },
  {
    name: 'Robert Kim',
    email: 'robert.kim@magazine.com',
    title: 'Geographic & Regional Affairs Editor',
    bio: 'Robert provides in-depth coverage of regional developments, geopolitical trends, and international business.',
    experience: '11+ years in international affairs and regional reporting',
    education: 'MA in International Relations, BA in Political Science',
    social_media: {
      linkedin: 'https://linkedin.com/in/robertkim',
      twitter: 'https://twitter.com/robertkgeo'
    },
    is_active: true
  },
  {
    name: 'Anna Patel',
    email: 'anna.patel@magazine.com',
    title: 'Industries & Manufacturing Analyst',
    bio: 'Anna covers industrial sectors, manufacturing innovation, and supply chain developments across global markets.',
    experience: '8+ years in industrial and manufacturing journalism',
    education: 'MS in Industrial Engineering, BA in Business',
    social_media: {
      linkedin: 'https://linkedin.com/in/annapatel',
      twitter: 'https://twitter.com/annapindustry'
    },
    is_active: true
  },
  {
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@magazine.com',
    title: 'Energy & Sustainability Writer',
    bio: 'Carlos focuses on energy markets, renewable technologies, and sustainable business practices.',
    experience: '10+ years in energy and environmental journalism',
    education: 'MS in Environmental Science, BA in Engineering',
    social_media: {
      linkedin: 'https://linkedin.com/in/carlosmendoza',
      twitter: 'https://twitter.com/carlosmenergy'
    },
    is_active: true
  }
];

async function createSampleAuthors() {
  try {
    console.log('🔄 Connecting to database...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      console.log('\n📝 Creating sample authors...');

      let createdCount = 0;

      for (const authorData of sampleAuthors) {
        try {
          // Check if author already exists
          const existingAuthor = await Author.findOne({
            where: { email: authorData.email },
            transaction
          });

          if (existingAuthor) {
            console.log(`⚠️  Author ${authorData.name} already exists, skipping...`);
            continue;
          }

          // Create the author
          const author = await Author.create(authorData, { transaction });
          console.log(`✅ Created author: ${author.name} (${author.email})`);
          createdCount++;

        } catch (error) {
          console.error(`❌ Error creating author ${authorData.name}:`, error.message);
        }
      }

      // Commit transaction
      await transaction.commit();

      console.log('\n📊 SUMMARY:');
      console.log(`Authors created: ${createdCount}`);
      console.log(`Total authors in database: ${await Author.count()}`);

      if (createdCount > 0) {
        console.log('✅ Sample authors created successfully!');
        console.log('🎉 Article management system should now work properly with authors available.');
      } else {
        console.log('ℹ️  No new authors were created (they may already exist).');
      }

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error creating sample authors:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
if (require.main === module) {
  createSampleAuthors().catch(console.error);
}

module.exports = { createSampleAuthors };