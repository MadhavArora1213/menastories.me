const { List, PowerListEntry, Admin } = require('./models');
const { sequelize } = require('./models');

async function createSamplePowerList() {
  try {
    console.log('Creating sample power list...');

    // First, get an admin user (assuming there's at least one admin)
    const admin = await Admin.findOne();
    if (!admin) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Create a sample power list
    const powerList = await List.create({
      title: 'Top 30 Young Leaders 2025',
      slug: 'top-30-young-leaders-2025',
      description: 'A comprehensive list of the most influential young leaders shaping the future across various industries.',
      content: 'This power list features young innovators, entrepreneurs, and change-makers who are making significant impacts in their respective fields. From technology pioneers to social entrepreneurs, these leaders represent the next generation of global influencers.',
      category: 'Business',
      year: 2025,
      methodology: 'Our selection process involved extensive research, industry analysis, and expert consultations to identify individuals who have demonstrated exceptional leadership, innovation, and impact in their fields.',
      metaTitle: 'Top 30 Young Leaders 2025 | Emerging Global Influencers',
      metaDescription: 'Discover the top 30 young leaders shaping the future in business, technology, and social impact. Meet the next generation of global influencers.',
      status: 'published',
      createdBy: admin.id
    });

    console.log('✅ Power list created:', powerList.title);

    // Create sample power list entries
    const sampleEntries = [
      {
        name: 'Alex Chen',
        designation: 'CEO & Founder',
        organization: 'TechFlow Solutions',
        category: 'Technology',
        industry: 'Software',
        location: 'San Francisco, CA',
        nationality: 'American',
        age: 28,
        gender: 'male',
        achievements: 'Founded TechFlow at age 22, raised $50M in funding, serves 10,000+ enterprise clients',
        shortBio: 'Pioneering AI-driven workflow automation solutions that have revolutionized how businesses operate globally.',
        rank: 1
      },
      {
        name: 'Maria Rodriguez',
        designation: 'Chief Innovation Officer',
        organization: 'GreenFuture Labs',
        category: 'Sustainability',
        industry: 'Clean Energy',
        location: 'Barcelona, Spain',
        nationality: 'Spanish',
        age: 26,
        gender: 'female',
        achievements: 'Developed breakthrough solar panel technology, reduced production costs by 40%, deployed in 15 countries',
        shortBio: 'Leading the charge in renewable energy innovation with sustainable solutions for a greener planet.',
        rank: 2
      },
      {
        name: 'David Kim',
        designation: 'Founder & CEO',
        organization: 'HealthTech Innovations',
        category: 'Healthcare',
        industry: 'Biotechnology',
        location: 'Seoul, South Korea',
        nationality: 'Korean',
        age: 29,
        gender: 'male',
        achievements: 'Created AI-powered diagnostic platform used by 500+ hospitals, improved accuracy by 35%',
        shortBio: 'Revolutionizing healthcare through artificial intelligence and personalized medicine approaches.',
        rank: 3
      },
      {
        name: 'Sarah Johnson',
        designation: 'Executive Director',
        organization: 'Global Education Initiative',
        category: 'Education',
        industry: 'Non-Profit',
        location: 'London, UK',
        nationality: 'British',
        age: 27,
        gender: 'female',
        achievements: 'Expanded educational access to 2 million children in developing countries, launched 50+ learning centers',
        shortBio: 'Dedicated to bridging the global education gap through innovative technology and community partnerships.',
        rank: 4
      },
      {
        name: 'Marcus Thompson',
        designation: 'VP of Engineering',
        organization: 'Quantum Computing Corp',
        category: 'Technology',
        industry: 'Quantum Computing',
        location: 'Toronto, Canada',
        nationality: 'Canadian',
        age: 30,
        gender: 'male',
        achievements: 'Led development of quantum algorithms that solved previously intractable computational problems',
        shortBio: 'Pushing the boundaries of quantum computing to solve complex real-world challenges.',
        rank: 5
      }
    ];

    for (const entryData of sampleEntries) {
      await PowerListEntry.create({
        ...entryData,
        listId: powerList.id,
        createdBy: admin.id,
        status: 'active'
      });
      console.log(`✅ Created power list entry: ${entryData.name} (Rank ${entryData.rank})`);
    }

    console.log(`\n🎉 Sample power list created successfully!`);
    console.log(`📊 Power List: "${powerList.title}"`);
    console.log(`👥 Entries: ${sampleEntries.length}`);
    console.log(`📅 Year: ${powerList.year}`);
    console.log(`🏷️ Category: ${powerList.category}`);

  } catch (error) {
    console.error('❌ Error creating sample power list:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
createSamplePowerList();