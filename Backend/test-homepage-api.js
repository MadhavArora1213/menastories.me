const axios = require('axios');

(async () => {
  try {
    console.log('Testing /api/public/homepage endpoint...');

    const baseURL = 'http://localhost:5000';
    const response = await axios.get(`${baseURL}/api/public/homepage`);

    console.log('\n=== API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);

    if (response.data.heroSlider) {
      console.log('\n=== HERO SLIDER DATA ===');
      console.log('Hero Slider Articles Count:', response.data.heroSlider.length);

      response.data.heroSlider.forEach((article, index) => {
        console.log(`\n--- Article ${index + 1} ---`);
        console.log('ID:', article.id);
        console.log('Title:', article.title);
        console.log('Slug:', article.slug);
        console.log('Status:', article.status);
        console.log('Hero Slider:', article.heroSlider);
        console.log('Featured Image:', article.featuredImage || 'None');
        console.log('Category:', article.category?.name || 'None');
        console.log('Author:', article.primaryAuthor?.name || 'None');
        console.log('Publish Date:', article.publishDate);
      });
    } else {
      console.log('\n=== HERO SLIDER DATA ===');
      console.log('No hero slider data found in response');
    }

    // Also check trending and featured data
    if (response.data.trending) {
      console.log('\n=== TRENDING DATA ===');
      console.log('Trending Articles Count:', response.data.trending.length);
    }

    if (response.data.featured) {
      console.log('\n=== FEATURED DATA ===');
      console.log('Featured Articles Count:', response.data.featured.length);
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
  process.exit(0);
})();