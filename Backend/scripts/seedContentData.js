const sequelize = require('../config/db');
const { Article, Category, Tag, Admin, Role } = require('../models');

const seedContentData = async () => {
  try {
    console.log('Starting content data seeding...');

    // Sample categories based on the navigation structure
    const categories = [
      {
        name: 'People & Profiles',
        slug: 'people-profiles',
        description: 'Celebrity spotlights, influencer stories, business leaders, and rising stars',
        parentId: null,
        displayOrder: 1,
        isActive: true,
        seoTitle: 'People & Profiles - Celebrity News and Influencer Stories',
        seoDescription: 'Get exclusive interviews and stories from celebrities, influencers, business leaders, and rising stars.',
        subcategories: [
          { name: 'Celebrity Spotlight', slug: 'celebrity-spotlight' },
          { name: 'Influencer Stories', slug: 'influencer-stories' },
          { name: 'Business Leaders', slug: 'business-leaders' },
          { name: 'Rising Stars', slug: 'rising-stars' }
        ]
      },
      {
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Bollywood, Hollywood, TV shows, music, and entertainment news',
        parentId: null,
        displayOrder: 2,
        isActive: true,
        seoTitle: 'Entertainment News - Bollywood, Hollywood & Music',
        seoDescription: 'Latest entertainment news, movie reviews, celebrity updates, and music industry coverage.',
        subcategories: [
          { name: 'Bollywood News', slug: 'bollywood-news' },
          { name: 'Hollywood Updates', slug: 'hollywood-updates' },
          { name: 'TV Shows & Series', slug: 'tv-shows-series' },
          { name: 'Music & Artists', slug: 'music-artists' }
        ]
      },
      {
        name: 'Lifestyle',
        slug: 'lifestyle',
        description: 'Fashion, beauty, health, wellness, and lifestyle trends',
        parentId: null,
        displayOrder: 3,
        isActive: true,
        seoTitle: 'Lifestyle - Fashion, Beauty, Health & Wellness',
        seoDescription: 'Discover the latest in fashion trends, beauty tips, health advice, and lifestyle inspiration.',
        subcategories: [
          { name: 'Fashion & Style', slug: 'fashion-style' },
          { name: 'Beauty & Skincare', slug: 'beauty-skincare' },
          { name: 'Health & Wellness', slug: 'health-wellness' },
          { name: 'Travel & Destinations', slug: 'travel-destinations' }
        ]
      },
      {
        name: 'Business & Leadership',
        slug: 'business-leadership',
        description: 'Industry leaders, startup stories, economic trends, and business insights',
        parentId: null,
        displayOrder: 4,
        isActive: true,
        seoTitle: 'Business & Leadership - Industry Leaders and Startup Stories',
        seoDescription: 'Business news, leadership insights, startup success stories, and economic trends.',
        subcategories: [
          { name: 'Industry Leaders', slug: 'industry-leaders' },
          { name: 'Startup Stories', slug: 'startup-stories' },
          { name: 'Women in Business', slug: 'women-in-business' },
          { name: 'Economic Trends', slug: 'economic-trends' }
        ]
      },
      {
        name: 'Regional Focus',
        slug: 'regional-focus',
        description: 'UAE news, local events, government updates, and regional coverage',
        parentId: null,
        displayOrder: 5,
        isActive: true,
        seoTitle: 'Regional Focus - Local News, Events & Government Updates',
        seoDescription: 'Stay updated with UAE news, local events, government initiatives, and regional developments.',
        subcategories: [
          { name: 'UAE Spotlight', slug: 'uae-spotlight' },
          { name: 'Local Events', slug: 'local-events' },
          { name: 'Community Heroes', slug: 'community-heroes' },
          { name: 'Government News', slug: 'government-news' },
          { name: 'Cultural Festivals', slug: 'cultural-festivals' },
          { name: 'Business Hub', slug: 'business-hub' },
          { name: 'Tourism & Attractions', slug: 'tourism-attractions' },
          { name: 'Local Personalities', slug: 'local-personalities' }
        ]
      }
    ];

    // Create main categories and subcategories
    const createdCategories = {};
    for (const categoryData of categories) {
      const { subcategories, ...mainCategoryData } = categoryData;
      
      // Create main category
      const [mainCategory, created] = await Category.findOrCreate({
        where: { slug: mainCategoryData.slug },
        defaults: mainCategoryData
      });
      
      createdCategories[mainCategory.slug] = mainCategory;
      console.log(`Category ${mainCategory.name}: ${created ? 'Created' : 'Already exists'}`);
      
      // Create subcategories
      for (const subCategoryData of subcategories) {
        const [subCategory, subCreated] = await Category.findOrCreate({
          where: { slug: subCategoryData.slug },
          defaults: {
            ...subCategoryData,
            parentId: mainCategory.id,
            description: `${subCategoryData.name} content within ${mainCategory.name}`,
            isActive: true,
            displayOrder: 1
          }
        });
        
        createdCategories[subCategory.slug] = subCategory;
        console.log(`  Subcategory ${subCategory.name}: ${subCreated ? 'Created' : 'Already exists'}`);
      }
    }

    // Sample tags
    const tags = [
      'UAE', 'Dubai', 'Abu Dhabi', 'Bollywood', 'Hollywood', 'Fashion', 'Technology',
      'Business', 'Startup', 'CEO', 'Entrepreneur', 'Innovation', 'Healthcare',
      'Education', 'Art', 'Culture', 'Music', 'Film', 'Celebrity', 'Interview',
      'Exclusive', 'Trending', 'Breaking', 'Analysis', 'Review', 'Guide'
    ];

    const createdTags = {};
    for (const tagName of tags) {
      const [tag, created] = await Tag.findOrCreate({
        where: { name: tagName },
        defaults: {
          name: tagName,
          slug: tagName.toLowerCase().replace(/\s+/g, '-')
        }
      });
      
      createdTags[tagName] = tag;
      console.log(`Tag ${tagName}: ${created ? 'Created' : 'Already exists'}`);
    }

    // Get admin user for articles
    const admin = await Admin.findOne({
      include: [{ model: Role }]
    });

    if (!admin) {
      console.log('No admin user found. Please run the admin seeding script first.');
      return;
    }

    console.log(`Found admin user: ${admin.firstName} ${admin.lastName} with role: ${admin.Role.name}`);

    // Sample articles
    const articles = [
      {
        title: "UAE's Vision 2071: Building the World's Best Country",
        slug: "uae-vision-2071-building-worlds-best-country",
        excerpt: "An exclusive look into the UAE's ambitious plans to become the world's best country by its centennial year, featuring interviews with key government officials and business leaders.",
        content: `
          <h2>The Ambitious Vision</h2>
          <p>The UAE Vision 2071 represents one of the most ambitious national development plans in modern history. This comprehensive strategy aims to position the United Arab Emirates as the world's best country by the nation's centennial celebration in 2071.</p>
          
          <h3>Key Pillars of Success</h3>
          <p>The vision is built on several foundational pillars that will guide the nation's development over the next five decades:</p>
          <ul>
            <li><strong>Economic Excellence:</strong> Diversifying the economy beyond oil and establishing the UAE as a global business hub</li>
            <li><strong>Innovation Leadership:</strong> Becoming a world leader in artificial intelligence, renewable energy, and space exploration</li>
            <li><strong>Education Revolution:</strong> Creating the world's most advanced educational system</li>
            <li><strong>Quality of Life:</strong> Ensuring the highest standards of living for all residents</li>
          </ul>
          
          <h3>Government Initiatives</h3>
          <p>The government has already launched several major initiatives to support this vision, including the Mars mission, renewable energy projects, and massive infrastructure developments.</p>
          
          <blockquote>"We are not just planning for the next few years, but for the next 50 years. This vision will transform the UAE into a global powerhouse across all sectors." - Government Official</blockquote>
          
          <p>With continuous investment in innovation and human capital, the UAE is well-positioned to achieve these ambitious goals.</p>
        `,
        categoryId: createdCategories['uae-spotlight']?.id,
        authorId: admin.id,
        status: 'published',
        featured: true,
        publishedAt: new Date('2024-01-20'),
        views: 15420,
        readTime: 8,
        seoTitle: "UAE Vision 2071: Complete Guide to Building World's Best Country",
        seoDescription: "Discover UAE's ambitious Vision 2071 plan to become the world's best country. Exclusive interviews with officials and detailed analysis of key initiatives.",
        tags: ['UAE', 'Dubai', 'Abu Dhabi', 'Innovation', 'Analysis']
      },
      {
        title: "Bollywood's New Generation: Rising Stars Making Global Impact",
        slug: "bollywood-new-generation-rising-stars-global-impact",
        excerpt: "Meet the talented young actors who are revolutionizing Indian cinema with their fresh perspectives, bold choices, and international appeal.",
        content: `
          <h2>A New Era of Indian Cinema</h2>
          <p>Bollywood is experiencing a renaissance, driven by a new generation of talented actors who are redefining what it means to be a global entertainer.</p>
          
          <h3>Breaking Traditional Boundaries</h3>
          <p>These rising stars are not just following the traditional Bollywood playbook. They're creating their own rules:</p>
          <ul>
            <li>Choosing content-driven scripts over commercial formulas</li>
            <li>Collaborating with international filmmakers</li>
            <li>Using social media to connect directly with global audiences</li>
            <li>Addressing contemporary social issues through their work</li>
          </ul>
          
          <h3>International Recognition</h3>
          <p>Several young actors have gained recognition at international film festivals and are being courted by Hollywood studios.</p>
          
          <p>This new wave of talent is positioning Indian cinema as a force to be reckoned with on the global stage.</p>
        `,
        categoryId: createdCategories['bollywood-news']?.id,
        authorId: admin.id,
        status: 'published',
        featured: true,
        publishedAt: new Date('2024-01-19'),
        views: 12350,
        readTime: 6,
        seoTitle: "Bollywood Rising Stars 2024: New Generation Going Global",
        seoDescription: "Discover the new generation of Bollywood actors making waves internationally. Exclusive interviews and career insights.",
        tags: ['Bollywood', 'Celebrity', 'Interview', 'Film', 'Trending']
      },
      {
        title: "Dubai Fashion Week 2024: Where Tradition Meets Innovation",
        slug: "dubai-fashion-week-2024-tradition-meets-innovation",
        excerpt: "From sustainable luxury to digital fashion, Dubai Fashion Week showcases the future of style in the Middle East and beyond.",
        content: `
          <h2>Fashion Forward in Dubai</h2>
          <p>Dubai Fashion Week 2024 has established itself as one of the most important fashion events in the Middle East, showcasing both traditional craftsmanship and cutting-edge innovation.</p>
          
          <h3>Sustainability Takes Center Stage</h3>
          <p>This year's theme focused heavily on sustainable fashion, with designers presenting collections made from:</p>
          <ul>
            <li>Recycled and upcycled materials</li>
            <li>Organic and natural fibers</li>
            <li>Locally sourced textiles</li>
            <li>Zero-waste production techniques</li>
          </ul>
          
          <h3>Digital Innovation</h3>
          <p>The event also featured groundbreaking digital fashion presentations, including virtual runway shows and NFT fashion collections.</p>
          
          <p>Dubai continues to position itself as a global fashion capital, bridging Eastern and Western design philosophies.</p>
        `,
        categoryId: createdCategories['fashion-style']?.id,
        authorId: admin.id,
        status: 'published',
        featured: true,
        publishedAt: new Date('2024-01-18'),
        views: 9876,
        readTime: 5,
        seoTitle: "Dubai Fashion Week 2024: Complete Coverage & Highlights",
        seoDescription: "Complete coverage of Dubai Fashion Week 2024, featuring sustainable fashion, digital innovation, and designer showcases.",
        tags: ['Fashion', 'Dubai', 'Trending', 'Review', 'Innovation']
      },
      {
        title: "Women Entrepreneurs Reshaping the Middle East Business Landscape",
        slug: "women-entrepreneurs-reshaping-middle-east-business",
        excerpt: "How female business leaders are breaking barriers and creating innovative solutions across industries in the MENA region.",
        content: `
          <h2>Breaking Barriers, Building Businesses</h2>
          <p>The Middle East is witnessing an unprecedented rise in women-led businesses, with female entrepreneurs driving innovation across multiple sectors.</p>
          
          <h3>Success Stories</h3>
          <p>From fintech startups to sustainable fashion brands, women entrepreneurs are creating solutions that address real-world challenges:</p>
          <ul>
            <li><strong>Fintech Revolution:</strong> Women-led financial technology companies are increasing financial inclusion</li>
            <li><strong>Healthcare Innovation:</strong> Female founders are developing cutting-edge medical technologies</li>
            <li><strong>Education Technology:</strong> Creating platforms that transform how we learn</li>
            <li><strong>Sustainable Solutions:</strong> Leading the charge in environmental sustainability</li>
          </ul>
          
          <h3>Government Support</h3>
          <p>Regional governments are providing increased support through funding programs, incubators, and policy reforms that encourage female entrepreneurship.</p>
          
          <p>This entrepreneurial wave is not just changing businesses—it's transforming society and inspiring the next generation of leaders.</p>
        `,
        categoryId: createdCategories['women-in-business']?.id,
        authorId: admin.id,
        status: 'published',
        featured: false,
        publishedAt: new Date('2024-01-17'),
        views: 7654,
        readTime: 7,
        seoTitle: "Women Entrepreneurs Middle East: Success Stories & Insights",
        seoDescription: "Discover inspiring stories of women entrepreneurs reshaping the Middle East business landscape with innovative solutions.",
        tags: ['Business', 'Entrepreneur', 'UAE', 'Innovation', 'Interview']
      },
      {
        title: "The Rise of Tech Startups in the UAE Ecosystem",
        slug: "rise-tech-startups-uae-ecosystem",
        excerpt: "Inside the booming startup ecosystem that's making Dubai and Abu Dhabi global technology hubs, featuring exclusive interviews with unicorn founders.",
        content: `
          <h2>The Tech Startup Revolution</h2>
          <p>The UAE has emerged as one of the most dynamic startup ecosystems in the world, with Dubai and Abu Dhabi leading the charge in technological innovation.</p>
          
          <h3>Success Metrics</h3>
          <p>The numbers tell a compelling story:</p>
          <ul>
            <li>Over $2 billion in funding raised in 2023</li>
            <li>3 unicorn companies and counting</li>
            <li>50+ active VC funds and accelerators</li>
            <li>15,000+ registered startups</li>
          </ul>
          
          <h3>Key Sectors</h3>
          <p>UAE startups are making waves in several key areas:</p>
          <ul>
            <li><strong>Fintech:</strong> Digital banking and payment solutions</li>
            <li><strong>PropTech:</strong> Real estate technology innovations</li>
            <li><strong>HealthTech:</strong> Medical and wellness technologies</li>
            <li><strong>EdTech:</strong> Educational technology platforms</li>
          </ul>
          
          <h3>Government Initiatives</h3>
          <p>The UAE government has launched multiple programs to support the startup ecosystem, including visa programs for entrepreneurs and significant funding initiatives.</p>
        `,
        categoryId: createdCategories['startup-stories']?.id,
        authorId: admin.id,
        status: 'draft',
        featured: false,
        publishedAt: null,
        views: 0,
        readTime: 9,
        seoTitle: "UAE Tech Startups 2024: Complete Ecosystem Guide",
        seoDescription: "Comprehensive guide to UAE's thriving tech startup ecosystem, featuring unicorn success stories and investment insights.",
        tags: ['Startup', 'Technology', 'UAE', 'Dubai', 'Business']
      }
    ];

    // Create articles
    for (const articleData of articles) {
      const { tags: articleTags, ...articleInfo } = articleData;
      
      const [article, created] = await Article.findOrCreate({
        where: { slug: articleInfo.slug },
        defaults: articleInfo
      });
      
      // Associate tags
      if (created && articleTags) {
        const tagInstances = articleTags.map(tagName => createdTags[tagName]).filter(Boolean);
        if (tagInstances.length > 0) {
          await article.addTags(tagInstances);
        }
      }
      
      console.log(`Article "${article.title}": ${created ? 'Created' : 'Already exists'}`);
    }

    console.log('\nContent data seeding completed successfully!');
    console.log('\n=== Summary ===');
    console.log('Categories: 5 main categories with subcategories');
    console.log('Tags: 26 tags created');
    console.log('Articles: 5 sample articles with full content');
    console.log('\nYou can now test the admin panel and frontend with this data.');

  } catch (error) {
    console.error('Error seeding content data:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  seedContentData();
}

module.exports = seedContentData;