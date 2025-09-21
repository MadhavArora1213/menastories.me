const { Tag } = require('../models');

// Define the exact 140 approved tags from the add-140-tags.js script
const approvedTags = [
  // PEOPLE & PROFILES (20 tags)
  'celebrity-profile', 'influencer-life', 'business-leaders', 'entrepreneurs',
  'changemakers', 'rising-stars', 'thought-leaders', 'global-icons',
  'local-heroes', 'inspiring-stories', 'youth-leaders', 'media-personalities',
  'role-models', 'women-leaders', 'industry-innovators', 'philanthropists',
  'cultural-icons', 'power-couples', 'sports-legends', 'political-figures',

  // ENTERTAINMENT (20 tags)
  'bollywood', 'hollywood', 'tollywood', 'movie-reviews', 'film-trailers',
  'celebrity-interviews', 'tv-series', 'web-series', 'streaming-platforms',
  'music-artists', 'album-releases', 'award-shows', 'red-carpet', 'box-office',
  'behind-the-scenes', 'film-festivals', 'dance-shows', 'comedy-specials',
  'theatre-plays', 'fan-culture',

  // LIFESTYLE (20 tags)
  'fashion-trends', 'runway-shows', 'street-style', 'beauty-tips',
  'skincare-tips', 'makeup-tutorials', 'wellness', 'fitness-goals',
  'healthy-diets', 'food-recipes', 'gourmet-food', 'travel-destinations',
  'budget-travel', 'luxury-travel', 'home-decor', 'interior-design',
  'relationships', 'dating-advice', 'parenting-guide', 'family-life',

  // CULTURE & SOCIETY (20 tags)
  'art-exhibitions', 'modern-art', 'photography', 'books', 'literature',
  'poetry', 'authors', 'cultural-events', 'heritage', 'traditions',
  'social-issues', 'activism', 'pop-culture', 'memes', 'youth-culture',
  'digital-trends', 'online-communities', 'festivals', 'cinema-history',
  'cultural-diversity',

  // BUSINESS & LEADERSHIP (20 tags)
  'startups', 'unicorns', 'women-in-business', 'corporate-news', 'leadership',
  'ceo-insights', 'industry-trends', 'economic-trends', 'stock-market',
  'investments', 'personal-finance', 'money-management', 'entrepreneurship',
  'business-strategy', 'innovation', 'career-growth', 'workplace-culture',
  'hr-trends', 'global-business', 'financial-planning',

  // REGIONAL FOCUS (20 tags)
  'uae-news', 'dubai-events', 'abu-dhabi', 'sharjah-culture', 'ras-al-khaimah',
  'uae-tourism', 'local-business', 'real-estate', 'government-updates',
  'economic-zone', 'cultural-festivals', 'expo-dubai', 'national-day',
  'uae-heritage', 'food-festivals', 'tourism-attractions', 'community-heroes',
  'emirates-leaders', 'uae-sports', 'technology-in-uae',

  // SPECIAL SECTIONS (20 tags)
  'power-list', 'top-doctors', '30-under-30', '40-under-40', 'women-leaders',
  'rising-entrepreneurs', 'social-impact', 'change-agents', 'most-influential',
  'business-awards', 'annual-awards', 'healthcare-leaders', 'innovators',
  'game-changers', 'sustainability-leaders', 'cultural-icons', 'philanthropy-awards',
  'thought-leaders', 'youth-awards', 'legacy-builders'
];

const cleanupExtraTags = async () => {
  try {
    console.log('🧹 Starting cleanup of extra tags...');
    console.log(`📋 Approved tags count: ${approvedTags.length}`);

    // Get all tags from database
    const allTags = await Tag.findAll({
      attributes: ['id', 'name', 'slug', 'category']
    });

    console.log(`📊 Total tags in database: ${allTags.length}`);

    // Find tags to delete (not in approved list)
    const tagsToDelete = allTags.filter(tag => !approvedTags.includes(tag.slug));

    console.log(`🗑️  Tags to delete: ${tagsToDelete.length}`);

    if (tagsToDelete.length === 0) {
      console.log('✅ No extra tags found. Database is clean!');
      return;
    }

    // Show tags that will be deleted
    console.log('\n📝 Tags to be deleted:');
    tagsToDelete.forEach((tag, index) => {
      console.log(`   ${index + 1}. ${tag.name} (${tag.slug}) - ${tag.category || 'No category'}`);
    });

    // Delete extra tags
    console.log('\n🗑️  Deleting extra tags...');
    let deletedCount = 0;

    for (const tag of tagsToDelete) {
      try {
        await Tag.destroy({
          where: { id: tag.id }
        });
        console.log(`   ✅ Deleted: ${tag.name} (${tag.slug})`);
        deletedCount++;
      } catch (deleteError) {
        console.log(`   ❌ Failed to delete: ${tag.name} (${tag.slug}) - ${deleteError.message}`);
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`📊 Tags deleted: ${deletedCount}`);

    // Verify final count
    const remainingTags = await Tag.findAll();
    console.log(`📈 Remaining tags: ${remainingTags.length}`);

    // Group by category
    const categoryCounts = {};
    for (const tag of remainingTags) {
      const catName = tag.category || 'Uncategorized';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    }

    console.log(`\n📋 Final tags by category:`);
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   • ${cat}: ${count} tags`);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
};

// Run the cleanup
cleanupExtraTags()
  .then(() => {
    console.log('\n✅ Tag cleanup process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Tag cleanup failed:', error);
    process.exit(1);
  });