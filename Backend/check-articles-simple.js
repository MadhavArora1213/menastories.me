const { Article } = require('./models');

async function checkArticles() {
  try {
    const articles = await Article.findAll({
      attributes: ['id', 'title', 'slug', 'status'],
      limit: 5
    });

    console.log('Available articles:');
    articles.forEach(a => {
      console.log(`- ${a.title} (slug: ${a.slug}, status: ${a.status})`);
    });

    if (articles.length > 0) {
      console.log('\nFirst article slug:', articles[0].slug);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkArticles();