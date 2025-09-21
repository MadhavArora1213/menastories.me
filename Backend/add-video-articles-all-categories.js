require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
});

async function addVideoArticlesToAllCategories() {
  try {
    console.log('🎬 Adding video articles to ALL categories...');

    const categoryMap = {
      'cd516d20-32c2-4050-9cd2-48ac765e4d93': 'Consumer Categories',
      'e58a62f3-fcbe-4581-910c-5d898c48d1e7': 'Finance',
      'eda6dc94-b02a-48d9-96f2-7b97cda10a54': 'Geographic Coverage',
      'c32e44e0-7f7f-4cff-8aae-f59ac3b60383': 'Hospitality',
      '8bd977f0-2fbb-4a7b-b5e1-4ffb6d87fe62': 'Industries',
      'dd3ee7e2-a4ca-4293-856a-af3bfe8abc87': 'News Content',
      '640f2225-c657-47d7-8302-cf57f47c9f9e': 'Real Estate',
      '34d168b1-6548-47af-9e9c-aae9c4d155db': 'Web3'
    };

    const authorId = 'b1d36f22-88c1-4b0d-b08b-3bce1166494a'; // Anna Patel
    const adminId = '12f264f9-dfad-436d-b95d-de7322d83acd'; // Master Admin

    const videoArticlesByCategory = {
      'cd516d20-32c2-4050-9cd2-48ac765e4d93': [ // Consumer Categories
        {
          title: 'The Rise of Sustainable Consumer Products',
          subtitle: 'How eco-friendly brands are reshaping consumer behavior',
          content: `<p>The consumer goods industry is undergoing a dramatic transformation as sustainability becomes the new normal. Brands across all sectors are racing to meet consumer demand for environmentally responsible products, creating a new paradigm in consumer behavior.</p>

<p>From biodegradable packaging to carbon-neutral manufacturing, companies are investing billions in sustainable practices. This shift is not just about marketing—it's about fundamentally changing how products are made, distributed, and consumed.</p>

<p>Key trends include:</p>
<ul>
<li>Biodegradable materials replacing traditional plastics</li>
<li>Circular economy models reducing waste</li>
<li>Transparent supply chains building consumer trust</li>
<li>Digital product passports tracking environmental impact</li>
</ul>

<p>Consumers are increasingly willing to pay premium prices for sustainable products, with 67% of millennials and Gen Z reporting they would switch brands for better environmental practices.</p>`,
          youtubeUrl: 'https://www.youtube.com/watch?v=example1',
          duration: 450,
          tags: ['sustainability', 'consumer', 'eco-friendly', 'brands'],
          excerpt: 'Sustainable consumer products are revolutionizing the industry as brands meet growing demand for environmentally responsible goods.',
          featuredImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop&crop=center'
        },
        {
          title: 'Consumer Tech Trends 2025: What\'s Next?',
          subtitle: 'Emerging technologies shaping the future of consumer electronics',
          content: `<p>The consumer technology landscape is evolving at unprecedented speed, with innovations in AI, IoT, and quantum computing set to transform how we interact with devices. From smart homes to wearable health monitors, the boundaries between digital and physical worlds are blurring.</p>

<p>Major developments include:</p>
<ul>
<li>AI-powered personal assistants becoming truly intelligent</li>
<li>Quantum sensors enabling unprecedented measurement precision</li>
<li>Neural interfaces for seamless human-device interaction</li>
<li>Sustainable electronics with biodegradable components</li>
</ul>

<p>The global consumer tech market is projected to reach $2.5 trillion by 2026, driven by increasing demand for connected, intelligent, and sustainable devices.</p>`,
          youtubeUrl: 'https://www.youtube.com/watch?v=example2',
          duration: 380,
          tags: ['technology', 'consumer', 'innovation', 'AI'],
          excerpt: 'Consumer technology is advancing rapidly with AI, IoT, and quantum computing reshaping how we interact with devices.',
          featuredImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center'
        }
      ],
      'e58a62f3-fcbe-4581-910c-5d898c48d1e7': [ // Finance
        {
          title: 'Digital Banking Revolution: Fintech vs Traditional Banks',
          subtitle: 'How technology is reshaping the financial services industry',
          content: `<p>The financial services industry is experiencing unprecedented disruption as fintech companies challenge traditional banking models. Digital-first banks, mobile payment solutions, and AI-driven financial advice are fundamentally changing how consumers manage their money.</p>

<p>Key innovations include:</p>
<ul>
<li>Real-time payment systems replacing traditional transfers</li>
<li>AI-powered credit scoring for faster loan approvals</li>
<li>Blockchain-based securities trading platforms</li>
<li>Personalized financial planning through robo-advisors</li>
</ul>

<p>Traditional banks are responding by accelerating their digital transformation, investing billions in technology upgrades and strategic partnerships with fintech startups.</p>`,
          youtubeUrl: 'https://www.youtube.com/watch?v=example3',
          duration: 420,
          tags: ['finance', 'banking', 'fintech', 'digital'],
          excerpt: 'Fintech companies are revolutionizing banking with digital solutions that challenge traditional financial institutions.',
          featuredImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop&crop=center'
        }
      ],
      'eda6dc94-b02a-48d9-96f2-7b97cda10a54': [ // Geographic Coverage
        {
          title: 'Global Economic Shifts: Asia-Pacific Takes Center Stage',
          subtitle: 'Regional economic dynamics reshaping global trade patterns',
          content: `<p>The Asia-Pacific region is emerging as the world's economic powerhouse, with unprecedented growth rates and strategic importance in global trade. Countries across the region are implementing ambitious development plans that are reshaping international economic relationships.</p>

<p>Major developments include:</p>
<ul>
<li>China's Belt and Road Initiative connecting global markets</li>
<li>India's digital transformation accelerating economic growth</li>
<li>Southeast Asian nations forming strategic economic partnerships</li>
<li>Pacific Island nations developing blue economy strategies</li>
</ul>

<p>The region's combined GDP now represents over 60% of global economic output, making it the primary driver of worldwide growth and innovation.</p>`,
          youtubeUrl: 'https://www.youtube.com/watch?v=example4',
          duration: 480,
          tags: ['economy', 'asia-pacific', 'global', 'trade'],
          excerpt: 'Asia-Pacific region is becoming the global economic powerhouse with unprecedented growth and strategic importance.',
          featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center'
        }
      ],
      'c32e44e0-7f7f-4cff-8aae-f59ac3b60383': [ // Hospitality
        {
          title: 'Luxury Hospitality: Redefining Guest Experiences',
          subtitle: 'How luxury hotels are creating unforgettable guest journeys',
          content: `<p>The luxury hospitality industry is undergoing a renaissance, with hotels and resorts investing in cutting-edge technology and personalized experiences to create truly memorable guest journeys. From AI-powered concierge services to immersive wellness retreats, the definition of luxury is being redefined.</p>

<p>Innovative approaches include:</p>
<ul>
<li>AI-powered personalization predicting guest preferences</li>
<li>Immersive technology creating virtual reality experiences</li>
<li>Sustainable luxury balancing opulence with environmental responsibility</li>
<li>Cultural immersion programs connecting guests with local heritage</li>
</ul>

<p>The luxury hospitality market is projected to reach $1.2 trillion by 2027, driven by increasing demand for authentic, personalized, and sustainable experiences.</p>`,
          youtubeUrl: 'https://www.youtube.com/watch?v=example5',
          duration: 360,
          tags: ['hospitality', 'luxury', 'hotels', 'experience'],
          excerpt: 'Luxury hospitality is being redefined through technology and personalization, creating unforgettable guest experiences.',
          featuredImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop&crop=center'
        }
      ],
      '8bd977f0-2fbb-4a7b-b5e1-4ffb6d87fe62': [ // Industries
        {
          title: 'Industry 4.0: Smart Manufacturing Revolution',
          subtitle: 'How digital transformation is reshaping industrial production',
          content: `<p>Industry 4.0 is revolutionizing manufacturing through the integration of digital technologies, creating smart factories that are more efficient, flexible, and sustainable. The convergence of IoT, AI, and advanced robotics is fundamentally changing how goods are produced worldwide.</p>

<p>Key technologies driving this revolution:</p>
<ul>
<li>IoT sensors enabling real-time production monitoring</li>
<li>AI-driven predictive maintenance reducing downtime</li>
<li>Digital twins for virtual prototyping and testing</li>
<li>Collaborative robots working alongside human operators</li>
</ul>

<p>Companies adopting Industry 4.0 technologies are seeing productivity increases of up to 40% and significant reductions in operational costs.</p>`,
          youtubeUrl: 'https://www.youtube.com/watch?v=example6',
          duration: 400,
          tags: ['industry', 'manufacturing', 'technology', 'automation'],
          excerpt: 'Industry 4.0 is revolutionizing manufacturing with smart technologies that increase efficiency and reduce costs.',
          featuredImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop&crop=center'
        }
      ],
      '640f2225-c657-47d7-8302-cf57f47c9f9e': [ // Real Estate
        {
          title: 'Smart Cities: The Future of Urban Living',
          subtitle: 'How technology is transforming urban development and real estate',
          content: `<p>Smart city initiatives are reshaping urban landscapes worldwide, integrating advanced technologies to create more sustainable, efficient, and livable cities. From intelligent transportation systems to energy-efficient buildings, technology is transforming how we design and manage urban environments.</p>

<p>Major smart city developments include:</p>
<ul>
<li>IoT-enabled infrastructure for real-time city monitoring</li>
<li>Autonomous transportation systems reducing traffic congestion</li>
<li>Smart energy grids optimizing power consumption</li>
<li>Data-driven urban planning for better resource allocation</li>
</ul>

<p>Cities implementing smart technologies are seeing improvements in air quality, reduced energy consumption, and enhanced quality of life for residents.</p>`,
          youtubeUrl: 'https://www.youtube.com/watch?v=example7',
          duration: 440,
          tags: ['real-estate', 'smart-cities', 'urban', 'technology'],
          excerpt: 'Smart city technologies are transforming urban development, creating more sustainable and efficient cities.',
          featuredImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&h=400&fit=crop&crop=center'
        }
      ],
      '34d168b1-6548-47af-9e9c-aae9c4d155db': [ // Web3
        {
          title: 'Web3 Revolution: Decentralized Future of the Internet',
          subtitle: 'How blockchain and decentralized technologies are reshaping the digital landscape',
          content: `<p>Web3 represents the next evolution of the internet, built on decentralized technologies that prioritize user ownership, privacy, and censorship resistance. Blockchain, decentralized finance, and NFTs are just the beginning of this fundamental shift in how we interact with digital services.</p>

<p>Key components of Web3 include:</p>
<ul>
<li>Decentralized identity systems for user sovereignty</li>
<li>Blockchain-based social networks and content platforms</li>
<li>Decentralized autonomous organizations (DAOs) for governance</li>
<li>Tokenized economies creating new incentive structures</li>
</ul>

<p>The Web3 ecosystem is projected to reach $13.5 trillion by 2027, fundamentally changing how we think about digital ownership and online interactions.</p>`,
          youtubeUrl: 'https://www.youtube.com/watch?v=example8',
          duration: 460,
          tags: ['web3', 'blockchain', 'decentralized', 'internet'],
          excerpt: 'Web3 is revolutionizing the internet with decentralized technologies that prioritize user ownership and privacy.',
          featuredImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop&crop=center'
        }
      ]
    };

    let totalArticlesAdded = 0;

    for (const [categoryId, articles] of Object.entries(videoArticlesByCategory)) {
      const categoryName = categoryMap[categoryId];
      console.log(`\n📂 Processing category: ${categoryName}`);

      for (const article of articles) {
        // Check if video article already exists
        const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const existingArticle = await pool.query(`
          SELECT id, title, slug
          FROM "VideoArticles"
          WHERE slug = $1
        `, [slug]);

        if (existingArticle.rows.length > 0) {
          console.log(`  ✅ Video article "${article.title}" already exists, skipping...`);
          continue;
        }

        // Insert video article
        const insertQuery = `
          INSERT INTO "VideoArticles" (
            id, title, slug, subtitle, content, excerpt, description, "featuredImage", "imageCaption", "imageAlt", gallery,
            "youtubeUrl", "videoType", duration, "thumbnailUrl", status, "workflowStage", "categoryId", "subcategoryId", "authorId",
            "coAuthors", "authorBioOverride", featured, "heroSlider", trending, pinned, "allowComments", "readingTime",
            "metaTitle", "metaDescription", keywords, tags, "publishDate", scheduled_publish_date, "viewCount", "likeCount", "shareCount",
            "assignedTo", "nextAction", priority, "createdBy", "updatedBy", nationality, age, gender, ethnicity, residency,
            industry, position, "imageDisplayMode", links, "socialEmbeds", "externalLinkFollow", "captchaVerified", "guidelinesAccepted",
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            $1, $2, $3, $4, $5, $6, $7, NULL, NULL, '[]',
            $8, $9, $10, $11, 'published', 'published', $12, NULL, $13,
            '[]', NULL, false, false, false, false, true, $14,
            $15, $16, $17, $18, NOW(), NULL, 0, 0, 0,
            NULL, NULL, 'normal', $19, NULL, NULL, NULL, NULL, NULL, NULL,
            NULL, NULL, 'single', '[]', '[]', true, false, false,
            NOW(), NOW()
          ) RETURNING id, title, slug
        `;

        const values = [
          article.title,
          slug,
          article.subtitle,
          article.content,
          article.excerpt,
          article.excerpt, // description
          article.featuredImage,
          article.youtubeUrl,
          'youtube',
          article.duration,
          `https://img.youtube.com/vi/${getYouTubeVideoId(article.youtubeUrl)}/maxresdefault.jpg`, // thumbnailUrl
          categoryId,
          authorId,
          Math.ceil(article.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200), // readingTime
          article.title, // metaTitle
          article.excerpt, // metaDescription
          JSON.stringify(['video', ...article.tags]), // keywords
          JSON.stringify(article.tags), // tags
          adminId
        ];

        const result = await pool.query(insertQuery, values);

        console.log(`  ✅ Added: "${result.rows[0].title}"`);
        console.log(`     Slug: ${result.rows[0].slug}`);
        console.log(`     ID: ${result.rows[0].id}`);
        totalArticlesAdded++;
      }
    }

    console.log(`\n🎉 Successfully added ${totalArticlesAdded} video articles across all categories!`);

    // Show summary
    const summaryResult = await pool.query(`
      SELECT c.name as category_name, COUNT(va.id) as video_count
      FROM "Categories" c
      LEFT JOIN "VideoArticles" va ON c.id = va."categoryId"
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);

    console.log('\n📊 Video Articles Summary by Category:');
    summaryResult.rows.forEach(row => {
      console.log(`  ${row.category_name}: ${row.video_count} video articles`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

function getYouTubeVideoId(url) {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return 'example';
}

addVideoArticlesToAllCategories();