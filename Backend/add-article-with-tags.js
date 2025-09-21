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

async function addArticleWithTags() {
  try {
    console.log('🔄 Ensuring article with tags exists in news category...');

    const categoryId = 'dd3ee7e2-a4ca-4293-856a-af3bfe8abc87';
    const authorId = '229d04d7-c4e1-488e-a308-128213090a98';
    const adminId = 'dbad598f-0aed-4941-acc9-7d65eb77b03e';

    const tags = ['technology', 'innovation', 'ai'];

    // Check if article already exists
    const existingArticle = await pool.query(`
      SELECT id, title, slug, "featuredImage"
      FROM "Articles"
      WHERE slug = 'ai-revolution-machine-learning-transforming-industries'
    `);

    let articleId;
    if (existingArticle.rows.length > 0) {
      articleId = existingArticle.rows[0].id;
      console.log('✅ Article already exists, updating it...');

      // Update existing article with featured image if not set
      if (!existingArticle.rows[0].featuredImage) {
        await pool.query(`
          UPDATE "Articles"
          SET "featuredImage" = $1, tags = $2
          WHERE id = $3
        `, ['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center', JSON.stringify(tags), articleId]);
        console.log('✅ Updated existing article with featured image and tags');
      }
    } else {
      // Insert new article
      const insertQuery = `
        INSERT INTO "Articles" (
          id, title, slug, subtitle, content, excerpt, status, "categoryId", "authorId", "createdBy", tags, "publishDate", "createdAt", "updatedAt", "featuredImage"
        ) VALUES (
          gen_random_uuid(),
          'AI Revolution: How Machine Learning is Transforming Industries',
          'ai-revolution-machine-learning-transforming-industries',
          'Exploring the latest breakthroughs in artificial intelligence',
          '<p>The field of artificial intelligence continues to evolve at an unprecedented pace, with machine learning algorithms becoming increasingly sophisticated. Recent developments in neural networks and deep learning have opened new possibilities across various industries.</p><p>From healthcare to finance, AI is revolutionizing how businesses operate and deliver value to customers. Companies that embrace these technologies early are gaining significant competitive advantages.</p><p>The future of work is being reshaped as AI systems take on more complex tasks, allowing human workers to focus on creative and strategic activities that require emotional intelligence and innovation.</p>',
          'The AI revolution is transforming industries through advanced machine learning technologies, creating new opportunities and challenges for businesses worldwide.',
          'published',
          $1,
          $2,
          $3,
          $4,
          NOW(),
          NOW(),
          NOW(),
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center'
        ) RETURNING id, title, slug
      `;

      const result = await pool.query(insertQuery, [categoryId, authorId, adminId, JSON.stringify(tags)]);
      articleId = result.rows[0].id;

      console.log('✅ New article added successfully:');
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
      console.log(`   ID: ${articleId}`);
      console.log(`   Tags: ${tags.join(', ')}`);
    }

    // Now update one existing article to have similar tags
    const existingArticleId = '5dae20c2-b57c-46cb-8243-66d1eb8e46b9'; // The first one

    await pool.query(`
      UPDATE "Articles"
      SET tags = $1
      WHERE id = $2
    `, [JSON.stringify(['technology', 'partnership', 'ai']), existingArticleId]);

    console.log(`✅ Updated existing article ${existingArticleId} with similar tags: technology, partnership, ai`);

    console.log('\n🎉 Article ensured and existing article updated. The article will now appear in suggested articles when viewing articles with matching tags.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

addArticleWithTags();