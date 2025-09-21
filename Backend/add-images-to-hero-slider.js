const { Article } = require('./models');

(async () => {
  try {
    console.log('Adding featured images to hero slider articles...');

    // Get all hero slider articles without images
    const heroSliderArticles = await Article.findAll({
      where: {
        heroSlider: true,
        status: 'published',
        featuredImage: null
      },
      attributes: ['id', 'title', 'slug', 'featuredImage']
    });

    console.log(`Found ${heroSliderArticles.length} hero slider articles without images`);

    if (heroSliderArticles.length === 0) {
      console.log('All hero slider articles already have images!');
      return;
    }

    // Sample images for different categories
    const sampleImages = {
      'Technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'Business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'Healthcare': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'Finance': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'Industries': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'Web3': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'default': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
    };

    // Update each article with a featured image based on its category
    for (const article of heroSliderArticles) {
      // Try to extract category from title or use default
      let category = 'default';
      const title = article.title.toLowerCase();

      if (title.includes('cryptocurrency') || title.includes('blockchain') || title.includes('web3')) {
        category = 'Web3';
      } else if (title.includes('artificial intelligence') || title.includes('ai') || title.includes('healthcare')) {
        category = 'Healthcare';
      } else if (title.includes('business') || title.includes('finance') || title.includes('market')) {
        category = 'Business';
      } else if (title.includes('technology') || title.includes('tech') || title.includes('innovation')) {
        category = 'Technology';
      } else if (title.includes('energy') || title.includes('renewable') || title.includes('sustainable')) {
        category = 'Industries';
      }

      const imageUrl = sampleImages[category] || sampleImages.default;

      await Article.update(
        { featuredImage: imageUrl },
        { where: { id: article.id } }
      );

      console.log(`✅ Updated "${article.title}" with image for category: ${category}`);
    }

    console.log('\n🎉 Successfully added featured images to all hero slider articles!');
    console.log('You can now refresh your website to see the real hero slider content.');

  } catch (error) {
    console.error('Error updating hero slider articles:', error);
  }
  process.exit(0);
})();