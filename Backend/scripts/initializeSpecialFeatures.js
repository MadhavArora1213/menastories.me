const { Tag, SpecialFeature } = require('../models');
const sequelize = require('../config/db');

const initializeSpecialFeatures = async () => {
  try {
    console.log('Initializing special features...');
    
    // Create database tables if they don't exist
    await sequelize.sync();
    
    // Create default special feature tags
    const specialFeatureTags = [
      { name: "Today's Trending", slug: "todays-trending", type: "trending" },
      { name: "Weekly Viral", slug: "weekly-viral", type: "trending" },
      { name: "Most Shared", slug: "most-shared", type: "trending" },
      { name: "Most Commented", slug: "most-commented", type: "trending" },
      { name: "Editor's Picks", slug: "editors-picks", type: "trending" },
      
      { name: "Photo Gallery", slug: "photo-gallery", type: "multimedia" },
      { name: "Video Interview", slug: "video-interview", type: "multimedia" },
      { name: "Podcast Episode", slug: "podcast-episode", type: "multimedia" },
      { name: "Live Stream", slug: "live-stream", type: "multimedia" },
      { name: "360° Content", slug: "360-content", type: "multimedia" },
      
      { name: "Poll", slug: "poll", type: "interactive" },
      { name: "Survey", slug: "survey", type: "interactive" },
      { name: "Reader Submission", slug: "reader-submission", type: "interactive" },
      { name: "User Generated", slug: "user-generated", type: "interactive" },
      
      { name: "Upcoming Event", slug: "upcoming-event", type: "event" },
      { name: "Event Coverage", slug: "event-coverage", type: "event" },
      { name: "Live Update", slug: "live-update", type: "event" }
    ];
    
    // Create tags in database
    for (const tagData of specialFeatureTags) {
      await Tag.findOrCreate({
        where: { slug: tagData.slug },
        defaults: tagData
      });
    }
    
    // Create special feature sections
    const specialFeatures = [
      {
        name: "Today's Trending",
        slug: "todays-trending",
        type: "trending",
        displayOrder: 1,
        settings: { timeFrame: "day" }
      },
      {
        name: "This Week's Viral",
        slug: "this-weeks-viral",
        type: "trending",
        displayOrder: 2,
        settings: { timeFrame: "week" }
      },
      {
        name: "Editor's Picks",
        slug: "editors-picks",
        type: "trending",
        displayOrder: 3,
        settings: { manualCuration: true }
      },
      {
        name: "Video Interviews",
        slug: "video-interviews",
        type: "multimedia",
        displayOrder: 1,
        settings: { mediaType: "video" }
      },
      {
        name: "Photo Galleries",
        slug: "photo-galleries",
        type: "multimedia",
        displayOrder: 2,
        settings: { mediaType: "gallery" }
      },
      {
        name: "Podcast Episodes",
        slug: "podcast-episodes",
        type: "multimedia",
        displayOrder: 3,
        settings: { mediaType: "podcast" }
      },
      {
        name: "Current Polls",
        slug: "current-polls",
        type: "interactive",
        displayOrder: 1,
        settings: { interactionType: "poll" }
      },
      {
        name: "Upcoming Events",
        slug: "upcoming-events",
        type: "event",
        displayOrder: 1,
        settings: { upcomingDays: 30 }
      }
    ];
    
    // Create feature sections in database
    for (const featureData of specialFeatures) {
      await SpecialFeature.findOrCreate({
        where: { slug: featureData.slug },
        defaults: featureData
      });
    }
    
    console.log('Special features initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing special features:', error);
    process.exit(1);
  }
};

initializeSpecialFeatures();