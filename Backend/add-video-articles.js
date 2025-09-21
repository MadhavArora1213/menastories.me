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

async function addVideoArticles() {
  try {
    console.log('🎬 Adding video articles to News Content category...');

    const categoryId = 'dd3ee7e2-a4ca-4293-856a-af3bfe8abc87'; // News Content
    const authorId = 'b1d36f22-88c1-4b0d-b08b-3bce1166494a'; // Anna Patel
    const adminId = '12f264f9-dfad-436d-b95d-de7322d83acd'; // Master Admin

    const videoArticles = [
      {
        title: 'Breaking: Global Climate Summit Reaches Historic Agreement',
        subtitle: 'World leaders unite on ambitious carbon reduction targets',
        content: `<p>In a groundbreaking development at the Global Climate Summit, world leaders from 195 countries have reached a historic agreement to combat climate change. The new accord, dubbed the "Paris 2.0" agreement, sets binding targets for carbon emissions reduction by 50% by 2030.</p>

<p>The summit, which concluded after three intense days of negotiations, saw unprecedented cooperation between developed and developing nations. Key highlights include:</p>

<ul>
<li>Mandatory carbon trading system implementation</li>
<li>$500 billion annual funding for developing countries</li>
<li>Strict monitoring and enforcement mechanisms</li>
<li>Technology transfer agreements for green energy</li>
</ul>

<p>Environmental experts are calling this the most significant climate agreement since the original Paris Accord. "This isn't just words on paper," said Dr. Maria Santos, lead negotiator for the European Union. "These are enforceable commitments that will fundamentally change how we approach climate action."</p>

<p>The agreement also includes provisions for extreme weather event response and biodiversity protection, marking a comprehensive approach to planetary health.</p>`,
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoType: 'youtube',
        duration: 420, // 7 minutes
        tags: ['climate', 'environment', 'global', 'summit', 'breaking'],
        excerpt: 'World leaders reach historic climate agreement with binding carbon reduction targets and unprecedented international cooperation.',
        featuredImage: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop&crop=center'
      },
      {
        title: 'Tech Giant Unveils Revolutionary AI Healthcare System',
        subtitle: 'New AI technology promises to transform medical diagnostics worldwide',
        content: `<p>In a major breakthrough for healthcare technology, a leading tech company has unveiled an revolutionary artificial intelligence system that can diagnose medical conditions with unprecedented accuracy. The new MedAI system has demonstrated 98.7% accuracy in clinical trials across multiple medical specialties.</p>

<p>The system, developed over five years with input from leading medical institutions worldwide, uses advanced machine learning algorithms trained on millions of medical images and patient records. Key features include:</p>

<ul>
<li>Real-time diagnostic assistance for physicians</li>
<li>Early detection of rare conditions</li>
<li>Integration with existing hospital systems</li>
<li>Continuous learning from new medical data</li>
</ul>

<p>Dr. James Chen, Chief Medical Officer at Stanford Medical Center, commented: "This technology doesn't replace doctors—it empowers them. We've seen cases where MedAI caught conditions that even experienced physicians initially missed."</p>

<p>The system is already being piloted in 50 hospitals across North America and Europe, with plans for global rollout within the next 18 months. Healthcare experts predict this could reduce diagnostic errors by up to 30% and significantly improve patient outcomes.</p>`,
        youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        videoType: 'youtube',
        duration: 380, // 6 minutes 20 seconds
        tags: ['technology', 'healthcare', 'AI', 'medical', 'innovation'],
        excerpt: 'Revolutionary AI healthcare system achieves 98.7% diagnostic accuracy in clinical trials, promising to transform medical care worldwide.',
        featuredImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop&crop=center'
      },
      {
        title: 'Space Mission Successfully Lands on Mars After 7-Month Journey',
        subtitle: 'Historic achievement opens new chapter in planetary exploration',
        content: `<p>After a seven-month journey spanning 480 million kilometers, the Mars Explorer spacecraft has successfully landed on the Red Planet, marking a historic achievement in space exploration. The landing, which took place at 2:47 AM UTC in the Jezero Crater region, represents the most complex robotic landing ever attempted.</p>

<p>The mission, launched by the International Space Consortium, carries advanced scientific instruments designed to study Mars' geology, search for signs of ancient life, and prepare for future human exploration. Key objectives include:</p>

<ul>
<li>Analysis of Martian soil and rock samples</li>
<li>Study of atmospheric composition and weather patterns</li>
<li>Search for biosignatures and organic compounds</li>
<li>Testing of in-situ resource utilization technologies</li>
</ul>

<p>Dr. Sarah Mitchell, Mission Director, stated: "This landing represents the culmination of decades of technological advancement and international cooperation. Every piece of data we collect will help us understand not just Mars, but our own planet's history."</p>

<p>The spacecraft is equipped with state-of-the-art cameras, spectrometers, and drilling equipment. Initial telemetry shows all systems are functioning perfectly, and the first scientific data is expected within the next 48 hours.</p>

<p>This successful landing brings humanity one step closer to establishing a permanent presence on Mars and unlocking the mysteries of our neighboring planet.</p>`,
        youtubeUrl: 'https://www.youtube.com/watch?v=ewL2oGZq3dg',
        videoType: 'youtube',
        duration: 520, // 8 minutes 40 seconds
        tags: ['space', 'mars', 'exploration', 'science', 'mission'],
        excerpt: 'Historic Mars landing achieved after 7-month journey, opening new frontiers in planetary exploration and scientific discovery.',
        featuredImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&h=400&fit=crop&crop=center'
      }
    ];

    for (const article of videoArticles) {
      // Check if video article already exists
      const existingArticle = await pool.query(`
        SELECT id, title, slug
        FROM "VideoArticles"
        WHERE slug = $1
      `, [article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')]);

      if (existingArticle.rows.length > 0) {
        console.log(`✅ Video article "${article.title}" already exists, skipping...`);
        continue;
      }

      // Generate slug
      const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      // Insert video article with all required fields in correct order (camelCase column names)
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
        article.videoType,
        article.duration,
        `https://img.youtube.com/vi/${getYouTubeVideoId(article.youtubeUrl)}/maxresdefault.jpg`, // thumbnailUrl
        categoryId,
        authorId,
        Math.ceil(article.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200), // readingTime
        article.title, // metaTitle
        article.excerpt, // metaDescription
        JSON.stringify(['news', 'video', ...article.tags]), // keywords
        JSON.stringify(article.tags), // tags
        adminId
      ];

      const result = await pool.query(insertQuery, values);

      console.log(`✅ Video article added successfully:`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Tags: ${article.tags.join(', ')}`);
      console.log('');
    }

    console.log('🎉 All video articles processed successfully!');

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
  return null;
}

addVideoArticles();