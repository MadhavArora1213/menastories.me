const { sequelize } = require('../config/db');
const { Media, MediaFolder } = require('../models');

async function seedSimpleMediaData() {
  try {
    console.log('🌱 Seeding simple media data...');

    // Create sample folders first
    const folders = [
      {
        id: 'b683d55c-61b0-40ab-b963-2422ea549535',
        name: 'Breaking News',
        slug: 'breaking-news',
        description: 'Images and videos for breaking news stories',
        color: '#DC2626',
        icon: 'newspaper',
        isPublic: true,
        accessLevel: 'public',
        sortOrder: 0,
        status: 'active',
        path: 'breaking-news',
        depth: 0
      },
      {
        id: 'f0d968c3-a1ea-4b63-b3ac-4d426f6b015f',
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Celebrity photos, event coverage, and entertainment media',
        color: '#7C3AED',
        icon: 'star',
        isPublic: true,
        accessLevel: 'public',
        sortOrder: 0,
        status: 'active',
        path: 'entertainment',
        depth: 0
      }
    ];

    for (const folder of folders) {
      await MediaFolder.upsert(folder);
    }

    console.log('✅ Created sample folders');

    // Create simple media entries with only basic columns
    const mediaItems = [
      {
        id: '53610b33-b6ce-4126-b52a-1190863835e5',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        originalFilename: 'breaking-news-dubai-skyline.jpg',
        displayName: 'Dubai Skyline Breaking News',
        size: 2456789,
        format: 'jpg',
        width: 1920,
        height: 1080,
        folder: 'breaking-news',
        caption: 'Dubai skyline during major economic announcement',
        altText: 'Dubai city skyline with modern skyscrapers at sunset',
        status: 'active'
      },
      {
        id: 'b0812bf8-55ec-4f87-995d-f38f5e6f1bb1',
        url: 'https://res.cloudinary.com/demo/image/upload/woman.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        originalFilename: 'celebrity-red-carpet-gala.jpg',
        displayName: 'Celebrity Red Carpet Moment',
        size: 1893456,
        format: 'jpg',
        width: 1600,
        height: 2400,
        folder: 'entertainment',
        caption: 'Stunning red carpet appearance at Dubai International Film Festival',
        altText: 'Celebrity in elegant gown on red carpet',
        status: 'active'
      },
      {
        id: '233ee74b-f140-4c88-8935-8f371a22f9ce',
        url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        originalFilename: 'press-conference-live.mp4',
        displayName: 'Press Conference Live Coverage',
        size: 15678945,
        format: 'mp4',
        width: 1920,
        height: 1080,
        duration: 180.5,
        folder: 'breaking-news',
        caption: 'Live press conference coverage from Dubai Government',
        altText: 'Video of government officials at press conference',
        status: 'active'
      }
    ];

    for (const media of mediaItems) {
      await Media.upsert(media);
    }

    console.log('✅ Created sample media files');

    // Get final count
    const mediaCount = await Media.count();
    const folderCount = await MediaFolder.count();

    console.log(`🎉 Seeding completed!`);
    console.log(`📊 Created ${mediaCount} media files in ${folderCount} folders`);

  } catch (error) {
    console.error('❌ Error seeding media data:', error);
    throw error;
  }
}

// Run the seeding
seedSimpleMediaData()
  .then(() => {
    console.log('✅ Simple media data seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });