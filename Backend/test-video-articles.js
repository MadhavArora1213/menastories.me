const { VideoArticle } = require('./models');

async function testVideoArticles() {
  try {
    const articles = await VideoArticle.findAll({
      attributes: ['id', 'title', 'slug'],
      limit: 5
    });

    console.log('Video Articles:');
    articles.forEach(a => {
      console.log('- ' + a.title + ' (slug: ' + a.slug + ')');
    });

    if (articles.length > 0) {
      console.log('\nTesting comment functionality with slug:', articles[0].slug);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testVideoArticles();