const { Client } = require('pg');
const slugify = require('slugify');
const crypto = require('crypto');
require('dotenv').config();

const seedSampleArticles = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  });

  try {
    await client.connect();
    console.log('🌱 Seeding sample articles...');

    // Get existing data
    const categoriesResult = await client.query('SELECT id, name FROM "Categories" WHERE status = $1', ['active']);
    const authorsResult = await client.query('SELECT id, name FROM "Authors" WHERE "isActive" = $1', [true]);
    const adminsResult = await client.query('SELECT id, username FROM "Admins" WHERE "isActive" = $1', [true]);

    const categories = categoriesResult.rows;
    const authors = authorsResult.rows;
    const admins = adminsResult.rows;

    if (categories.length === 0 || authors.length === 0 || admins.length === 0) {
      console.log('❌ Missing required data. Please seed categories, authors, and admins first.');
      return;
    }

    const sampleArticles = [
       {
         title: 'The Future of Technology in 2025',
         subtitle: 'Exploring emerging trends and innovations',
         content: `<h2>Introduction</h2>
         <p>The technology landscape is rapidly evolving, with new innovations emerging at an unprecedented pace. From artificial intelligence to quantum computing, the future holds incredible possibilities.</p>

         <h2>Key Trends</h2>
         <ul>
         <li>Artificial Intelligence and Machine Learning</li>
         <li>Quantum Computing Breakthroughs</li>
         <li>5G and Beyond</li>
         <li>Internet of Things (IoT)</li>
         </ul>

         <h2>Conclusion</h2>
         <p>As we look ahead to 2025, it's clear that technology will continue to transform our world in ways we can only begin to imagine.</p>`,
         excerpt: 'An in-depth look at the technological advancements shaping our future and their potential impact on society.',
         description: 'Comprehensive analysis of emerging technology trends',
         categoryId: categories[0].id,
         authorId: authors[0].id,
         featured: true,
         heroSlider: true,
         trending: true,
         allowComments: true,
         metaTitle: 'Future of Technology 2025 - Emerging Trends',
         metaDescription: 'Discover the latest technology trends and innovations that will shape our world in 2025 and beyond.',
         keywords: ['technology', 'innovation', 'future', 'AI', 'quantum computing'],
         status: 'published',
         createdBy: admins[0].id,
         updatedBy: admins[0].id
       },
      {
        title: 'Sustainable Living: A Guide to Eco-Friendly Practices',
        subtitle: 'Making small changes for a big impact',
        content: `<h2>Why Sustainability Matters</h2>
        <p>Sustainability is no longer just a buzzword—it's essential for the health of our planet and future generations.</p>

        <h2>Daily Practices</h2>
        <p>Small changes in our daily routines can make a significant difference in reducing our environmental impact.</p>

        <h2>Community Action</h2>
        <p>Individual efforts are important, but collective action is what drives real change.</p>`,
        excerpt: 'Learn practical steps to incorporate sustainable practices into your daily life and contribute to environmental conservation.',
        description: 'Guide to sustainable living practices',
        categoryId: categories[0].id,
        authorId: authors[1].id,
        featured: false,
        heroSlider: false,
        trending: true,
        allowComments: true,
        metaTitle: 'Sustainable Living Guide - Eco-Friendly Practices',
        metaDescription: 'Learn practical steps to live sustainably and reduce your environmental impact.',
        keywords: ['sustainability', 'environment', 'eco-friendly', 'green living'],
        status: 'published',
        createdBy: admins[0].id,
        updatedBy: admins[0].id
      },
      {
        title: 'The Art of Digital Photography',
        subtitle: 'Mastering composition and lighting',
        content: `<h2>Understanding Composition</h2>
        <p>Composition is the foundation of great photography. Learn the rules and when to break them.</p>

        <h2>Lighting Techniques</h2>
        <p>Light is everything in photography. Master different lighting conditions for stunning results.</p>

        <h2>Post-Processing</h2>
        <p>Learn how to enhance your photos without over-editing them.</p>`,
        excerpt: 'Master the fundamentals of digital photography including composition, lighting, and post-processing techniques.',
        description: 'Complete guide to digital photography',
        categoryId: categories[0].id,
        authorId: authors[2].id,
        featured: false,
        heroSlider: false,
        trending: false,
        allowComments: true,
        metaTitle: 'Digital Photography Guide - Composition and Lighting',
        metaDescription: 'Master digital photography with expert tips on composition, lighting, and post-processing.',
        keywords: ['photography', 'digital', 'composition', 'lighting', 'camera'],
        status: 'draft',
        createdBy: admins[0].id,
        updatedBy: admins[0].id
      }
    ];

    for (const articleData of sampleArticles) {
      try {
        // Generate slug
        let slug = slugify(articleData.title, { lower: true, strict: true });

        // Check for duplicate slugs
        const existingSlugResult = await client.query('SELECT id FROM "Articles" WHERE slug = $1', [slug]);
        if (existingSlugResult.rows.length > 0) {
          slug = `${slug}-${Date.now()}`;
        }

        // Calculate reading time
        const wordCount = articleData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        // Generate excerpt if not provided
        let excerpt = articleData.excerpt;
        if (!excerpt && articleData.content) {
          excerpt = articleData.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
        }

        // Prepare INSERT query
        const insertQuery = `
          INSERT INTO "Articles" (
            id, title, slug, subtitle, content, excerpt, description,
            "categoryId", "authorId", featured, "heroSlider", trending,
            "allowComments", "metaTitle", "metaDescription", keywords,
            status, "createdBy", "updatedBy", "readingTime",
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
          )
        `;

        const values = [
          articleData.title,
          slug,
          articleData.subtitle,
          articleData.content,
          excerpt,
          articleData.description,
          articleData.categoryId,
          articleData.authorId,
          articleData.featured,
          articleData.heroSlider,
          articleData.trending,
          articleData.allowComments,
          articleData.metaTitle,
          articleData.metaDescription,
          JSON.stringify(articleData.keywords),
          articleData.status,
          articleData.createdBy,
          articleData.updatedBy,
          readingTime,
          new Date(),
          new Date()
        ];

        await client.query(insertQuery, values);
        console.log(`✅ Created article: ${articleData.title}`);
      } catch (error) {
        console.log(`⚠️  Article "${articleData.title}" may already exist:`, error.message);
      }
    }

    console.log('🎉 Sample articles seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding sample articles:', error);
  } finally {
    await client.end();
  }
};

// Execute if run directly
if (require.main === module) {
  seedSampleArticles()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}

module.exports = seedSampleArticles;