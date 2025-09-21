const { Media, MediaFolder, MediaUsage, User } = require('../models');
const sequelize = require('../config/db');

const seedMediaData = async () => {
  try {
    await sequelize.sync();

    console.log('Seeding media data...');

    // Get existing users for realistic data
    const users = await User.findAll({ limit: 3 });

    // Create sample media folders
    const folders = [
      {
        name: 'Breaking News',
        slug: 'breaking-news',
        description: 'Images and videos for breaking news stories',
        color: '#DC2626',
        icon: 'newspaper',
        path: 'breaking-news',
        depth: 0,
        createdBy: users[0]?.id || null
      },
      {
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Celebrity photos, event coverage, and entertainment media',
        color: '#7C3AED',
        icon: 'star',
        path: 'entertainment',
        depth: 0,
        createdBy: users[1]?.id || null
      },
      {
        name: 'Fashion Week',
        slug: 'fashion-week',
        description: 'Fashion shows, runway photos, and style content',
        color: '#EC4899',
        icon: 'sparkles',
        path: 'fashion-week',
        depth: 0,
        createdBy: users[2]?.id || null
      },
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech product photos, startup events, and innovation coverage',
        color: '#0EA5E9',
        icon: 'computer',
        path: 'technology',
        depth: 0,
        createdBy: users[0]?.id || null
      }
    ];

    const createdFolders = await MediaFolder.bulkCreate(folders, { ignoreDuplicates: true });
    console.log('✓ Created sample media folders');

    // Create sample media files
    const mediaFiles = [
      // Breaking News Images
      {
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_300/sample.jpg',
        optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/sample.jpg',
        publicId: 'sample_breaking_news_1',
        type: 'image',
        mimeType: 'image/jpeg',
        originalFilename: 'breaking-news-dubai-skyline.jpg',
        displayName: 'Dubai Skyline Breaking News',
        size: 2456789,
        format: 'jpg',
        width: 1920,
        height: 1080,
        folderId: createdFolders[0]?.id,
        folder: 'breaking-news',
        caption: 'Dubai skyline during major economic announcement',
        altText: 'Dubai city skyline with modern skyscrapers at sunset',
        description: 'High-resolution image of Dubai\'s iconic skyline used for breaking economic news coverage',
        copyright: '© 2024 Magazine Media',
        license: 'all_rights_reserved',
        seoTitle: 'Dubai Skyline Economic News Photo',
        seoDescription: 'Professional photograph of Dubai skyline for breaking news coverage',
        keywords: ['dubai', 'skyline', 'economic', 'news', 'uae'],
        cdnUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        isOptimized: true,
        optimizationLevel: 8,
        status: 'active',
        isPublic: true,
        uploadedBy: users[0]?.id || null,
        viewCount: 156,
        downloadCount: 23
      },
      {
        url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/demo/video/upload/so_0,eo_1,c_fill,w_300,h_300/dog.jpg',
        publicId: 'breaking_news_video_1',
        type: 'video',
        mimeType: 'video/mp4',
        originalFilename: 'press-conference-live.mp4',
        displayName: 'Press Conference Live Coverage',
        size: 15678945,
        format: 'mp4',
        width: 1920,
        height: 1080,
        duration: 180.5,
        bitrate: 2500,
        frameRate: 30.0,
        folderId: createdFolders[0]?.id,
        folder: 'breaking-news',
        caption: 'Live press conference coverage from Dubai Government',
        altText: 'Video of government officials at press conference',
        description: 'Full press conference video covering new policy announcements',
        copyright: '© 2024 Magazine Media',
        license: 'all_rights_reserved',
        cdnUrl: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        status: 'active',
        isPublic: true,
        uploadedBy: users[1]?.id || null,
        viewCount: 89,
        downloadCount: 5
      },

      // Entertainment Images
      {
        url: 'https://res.cloudinary.com/demo/image/upload/woman.jpg',
        thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_300/woman.jpg',
        optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/woman.jpg',
        publicId: 'entertainment_celebrity_1',
        type: 'image',
        mimeType: 'image/jpeg',
        originalFilename: 'celebrity-red-carpet-gala.jpg',
        displayName: 'Celebrity Red Carpet Moment',
        size: 1893456,
        format: 'jpg',
        width: 1600,
        height: 2400,
        folderId: createdFolders[1]?.id,
        folder: 'entertainment',
        caption: 'Stunning red carpet appearance at Dubai International Film Festival',
        altText: 'Celebrity in elegant gown on red carpet',
        description: 'Exclusive red carpet photography from DIFF 2024',
        copyright: '© 2024 Magazine Media',
        license: 'all_rights_reserved',
        seoTitle: 'DIFF 2024 Red Carpet Celebrity Photo',
        seoDescription: 'Exclusive celebrity photography from Dubai International Film Festival',
        keywords: ['celebrity', 'red carpet', 'film festival', 'dubai', 'fashion'],
        cdnUrl: 'https://res.cloudinary.com/demo/image/upload/woman.jpg',
        isOptimized: true,
        optimizationLevel: 9,
        status: 'active',
        isPublic: true,
        uploadedBy: users[2]?.id || null,
        viewCount: 324,
        downloadCount: 45
      },

      // Fashion Week Images
      {
        url: 'https://res.cloudinary.com/demo/image/upload/shoes.jpg',
        thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_300/shoes.jpg',
        optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/shoes.jpg',
        publicId: 'fashion_week_runway_1',
        type: 'image',
        mimeType: 'image/jpeg',
        originalFilename: 'arab-fashion-week-runway.jpg',
        displayName: 'Arab Fashion Week Runway Show',
        size: 2134567,
        format: 'jpg',
        width: 1920,
        height: 1280,
        folderId: createdFolders[2]?.id,
        folder: 'fashion-week',
        caption: 'Model showcasing latest collection at Arab Fashion Week',
        altText: 'Fashion model on runway wearing designer shoes',
        description: 'High-fashion runway photography from Arab Fashion Week 2024',
        copyright: '© 2024 Magazine Media',
        license: 'creative_commons',
        licenseDetails: { type: 'CC BY-SA 4.0' },
        seoTitle: 'Arab Fashion Week 2024 Runway Photography',
        seoDescription: 'Professional runway photography from Arab Fashion Week',
        keywords: ['fashion', 'runway', 'arab fashion week', 'model', 'designer'],
        cdnUrl: 'https://res.cloudinary.com/demo/image/upload/shoes.jpg',
        isOptimized: true,
        optimizationLevel: 7,
        status: 'active',
        isPublic: true,
        uploadedBy: users[0]?.id || null,
        viewCount: 198,
        downloadCount: 34
      },

      // Technology Images
      {
        url: 'https://res.cloudinary.com/demo/image/upload/laptop.jpg',
        thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_300/laptop.jpg',
        optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/laptop.jpg',
        publicId: 'technology_startup_1',
        type: 'image',
        mimeType: 'image/jpeg',
        originalFilename: 'dubai-tech-startup-office.jpg',
        displayName: 'Dubai Tech Startup Office',
        size: 1756789,
        format: 'jpg',
        width: 1920,
        height: 1080,
        folderId: createdFolders[3]?.id,
        folder: 'technology',
        caption: 'Modern workspace at leading Dubai tech startup',
        altText: 'Modern office with laptops and technology equipment',
        description: 'Inside look at Dubai\'s thriving tech startup ecosystem',
        copyright: '© 2024 Magazine Media',
        license: 'all_rights_reserved',
        seoTitle: 'Dubai Tech Startup Office Interior',
        seoDescription: 'Professional photography of Dubai technology startup workspace',
        keywords: ['technology', 'startup', 'dubai', 'office', 'workspace'],
        cdnUrl: 'https://res.cloudinary.com/demo/image/upload/laptop.jpg',
        isOptimized: true,
        optimizationLevel: 8,
        status: 'active',
        isPublic: true,
        uploadedBy: users[1]?.id || null,
        viewCount: 267,
        downloadCount: 18
      },

      // Audio File
      {
        url: 'https://res.cloudinary.com/demo/video/upload/sample_audio.mp3',
        publicId: 'podcast_interview_1',
        type: 'audio',
        mimeType: 'audio/mpeg',
        originalFilename: 'ceo-interview-podcast.mp3',
        displayName: 'CEO Interview Podcast',
        size: 8945678,
        format: 'mp3',
        duration: 1800.0, // 30 minutes
        bitrate: 128,
        folderId: createdFolders[3]?.id,
        folder: 'technology',
        caption: 'Exclusive interview with Dubai tech startup CEO',
        altText: 'Audio interview with technology entrepreneur',
        description: 'In-depth podcast interview discussing startup journey and future of tech in Dubai',
        copyright: '© 2024 Magazine Media',
        license: 'all_rights_reserved',
        cdnUrl: 'https://res.cloudinary.com/demo/video/upload/sample_audio.mp3',
        status: 'active',
        isPublic: true,
        uploadedBy: users[2]?.id || null,
        viewCount: 78,
        downloadCount: 12
      },

      // Document File
      {
        url: 'https://res.cloudinary.com/demo/document/upload/sample.pdf',
        publicId: 'press_release_1',
        type: 'document',
        mimeType: 'application/pdf',
        originalFilename: 'dubai-economic-report-2024.pdf',
        displayName: 'Dubai Economic Report 2024',
        size: 3456789,
        format: 'pdf',
        folderId: createdFolders[0]?.id,
        folder: 'breaking-news',
        caption: 'Official Dubai Economic Development Report 2024',
        altText: 'PDF document of Dubai economic report',
        description: 'Comprehensive economic analysis and projections for Dubai 2024',
        copyright: '© 2024 Dubai Government',
        license: 'public_domain',
        seoTitle: 'Dubai Economic Development Report 2024 PDF',
        seoDescription: 'Official government report on Dubai economic development',
        keywords: ['dubai', 'economic', 'report', 'development', 'government'],
        cdnUrl: 'https://res.cloudinary.com/demo/document/upload/sample.pdf',
        status: 'active',
        isPublic: true,
        uploadedBy: users[0]?.id || null,
        viewCount: 445,
        downloadCount: 89
      }
    ];

    const createdMedia = await Media.bulkCreate(mediaFiles, { ignoreDuplicates: true });
    console.log('✓ Created sample media files');

    // Create sample media usage tracking
    const mediaUsage = [
      {
        mediaId: createdMedia[0]?.id,
        contentType: 'article',
        contentId: 'article-1-uuid',
        usageType: 'featured_image',
        position: null,
        context: {
          articleTitle: 'Dubai Announces Major Economic Reforms',
          publishedAt: '2024-08-27'
        },
        createdBy: users[0]?.id || null,
        isActive: true
      },
      {
        mediaId: createdMedia[1]?.id,
        contentType: 'article',
        contentId: 'article-1-uuid',
        usageType: 'inline_image',
        position: 2,
        context: {
          articleTitle: 'Dubai Announces Major Economic Reforms',
          publishedAt: '2024-08-27'
        },
        createdBy: users[0]?.id || null,
        isActive: true
      },
      {
        mediaId: createdMedia[2]?.id,
        contentType: 'article',
        contentId: 'article-2-uuid',
        usageType: 'featured_image',
        position: null,
        context: {
          articleTitle: 'DIFF 2024: Celebrating Middle Eastern Cinema',
          publishedAt: '2024-08-26'
        },
        createdBy: users[1]?.id || null,
        isActive: true
      },
      {
        mediaId: createdMedia[3]?.id,
        contentType: 'gallery',
        contentId: 'gallery-1-uuid',
        usageType: 'gallery_item',
        position: 1,
        context: {
          galleryTitle: 'Arab Fashion Week 2024 Highlights',
          publishedAt: '2024-08-25'
        },
        createdBy: users[2]?.id || null,
        isActive: true
      },
      {
        mediaId: createdMedia[4]?.id,
        contentType: 'article',
        contentId: 'article-3-uuid',
        usageType: 'featured_image',
        position: null,
        context: {
          articleTitle: 'Dubai\'s Tech Startup Ecosystem Thrives',
          publishedAt: '2024-08-24'
        },
        createdBy: users[1]?.id || null,
        isActive: true
      },
      {
        mediaId: createdMedia[5]?.id,
        contentType: 'article',
        contentId: 'article-3-uuid',
        usageType: 'attachment',
        position: null,
        context: {
          articleTitle: 'Dubai\'s Tech Startup Ecosystem Thrives',
          publishedAt: '2024-08-24'
        },
        createdBy: users[1]?.id || null,
        isActive: true
      },
      {
        mediaId: createdMedia[6]?.id,
        contentType: 'newsletter',
        contentId: 'newsletter-1-uuid',
        usageType: 'attachment',
        position: null,
        context: {
          newsletterTitle: 'Dubai Economic Weekly Digest',
          sentAt: '2024-08-23'
        },
        createdBy: users[0]?.id || null,
        isActive: true
      }
    ];

    await MediaUsage.bulkCreate(mediaUsage, { ignoreDuplicates: true });
    console.log('✓ Created sample media usage tracking');

    console.log('Media data seeding completed successfully!');
    
    // Log summary
    const folderCount = await MediaFolder.count();
    const mediaCount = await Media.count();
    const usageCount = await MediaUsage.count();
    
    console.log(`\nSummary:`);
    console.log(`- Media folders: ${folderCount}`);
    console.log(`- Media files: ${mediaCount}`);
    console.log(`- Usage tracking records: ${usageCount}`);

    // Log storage stats
    const totalSize = await Media.sum('size') || 0;
    console.log(`- Total storage used: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('Error seeding media data:', error);
  }
};

// Run if called directly
if (require.main === module) {
  seedMediaData().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seedMediaData;