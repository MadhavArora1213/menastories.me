const { Article } = require('./models');

(async () => {
  try {
    console.log('Checking for hero slider articles...');

    // Check heroSlider articles
    const heroSliderArticles = await Article.findAll({
      where: { heroSlider: true, status: 'published' },
      attributes: ['id', 'title', 'slug', 'heroSlider', 'status', 'featuredImage', 'publishDate'],
      limit: 5
    });

    console.log('\n=== HERO SLIDER ARTICLES ===');
    console.log('Found:', heroSliderArticles.length, 'articles');
    if (heroSliderArticles.length > 0) {
      heroSliderArticles.forEach(article => {
        console.log('-', article.title);
        console.log('  ID:', article.id);
        console.log('  Slug:', article.slug);
        console.log('  Status:', article.status);
        console.log('  Hero Slider:', article.heroSlider);
        console.log('  Featured Image:', article.featuredImage || 'None');
        console.log('  Publish Date:', article.publishDate);
        console.log('---');
      });
    } else {
      console.log('No articles found with heroSlider flag set to true');
    }

    // Check featured articles as alternative
    const featuredArticles = await Article.findAll({
      where: { featured: true, status: 'published' },
      attributes: ['id', 'title', 'slug', 'featured', 'status', 'featuredImage', 'publishDate'],
      limit: 5
    });

    console.log('\n=== FEATURED ARTICLES ===');
    console.log('Found:', featuredArticles.length, 'articles');
    if (featuredArticles.length > 0) {
      featuredArticles.forEach(article => {
        console.log('-', article.title);
        console.log('  ID:', article.id);
        console.log('  Slug:', article.slug);
        console.log('  Status:', article.status);
        console.log('  Featured:', article.featured);
        console.log('  Featured Image:', article.featuredImage || 'None');
        console.log('  Publish Date:', article.publishDate);
        console.log('---');
      });
    } else {
      console.log('No featured articles found');
    }

    // Check all published articles
    const allPublished = await Article.findAll({
      where: { status: 'published' },
      attributes: ['id', 'title', 'slug', 'status', 'featuredImage', 'publishDate'],
      limit: 10,
      order: [['publishDate', 'DESC']]
    });

    console.log('\n=== RECENT PUBLISHED ARTICLES ===');
    console.log('Found:', allPublished.length, 'recent articles');
    allPublished.forEach(article => {
      console.log('-', article.title);
      console.log('  ID:', article.id);
      console.log('  Slug:', article.slug);
      console.log('  Status:', article.status);
      console.log('  Featured Image:', article.featuredImage || 'None');
      console.log('  Publish Date:', article.publishDate);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
})();