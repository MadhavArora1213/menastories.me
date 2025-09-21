const { Media, MediaFolder, sequelize } = require('../models');
const { Op } = require('sequelize');

const seedMinimalMediaData = async () => {
  try {
    console.log('Starting minimal media data seeding...');

    // Create some basic folders first
    const folders = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'General',
        slug: 'general',
        description: 'General media files',
        color: '#3B82F6',
        depth: 0,
        path: 'general',
        status: 'active',
        createdBy: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Articles',
        slug: 'articles',
        description: 'Media files for articles',
        color: '#10B981',
        depth: 0,
        path: 'articles',
        status: 'active',
        createdBy: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Gallery',
        slug: 'gallery',
        description: 'Gallery images',
        color: '#F59E0B',
        depth: 0,
        path: 'gallery',
        status: 'active',
        createdBy: null
      }
    ];

    for (const folder of folders) {
      await MediaFolder.upsert(folder);
    }

    console.log('Folders created successfully');

    // Create some dummy media files
    const mediaFiles = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        url: 'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Sample+Image+1',
        thumbnailUrl: 'https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Sample+Image+1',
        publicId: 'sample_image_1',
        type: 'image',
        mimeType: 'image/jpeg',
        originalFilename: 'sample_image_1.jpg',
        displayName: 'Sample Image 1',
        size: 1024000, // 1MB
        format: 'jpg',
        width: 800,
        height: 600,
        folder: 'general',
        folderId: '550e8400-e29b-41d4-a716-446655440001',
        caption: 'This is a sample image for testing purposes',
        altText: 'Sample image 1 placeholder',
        description: 'A placeholder image used for testing the media management system',
        tags: ['sample', 'placeholder', 'test'],
        isPrivate: false,
        allowDownload: true,
        status: 'active',
        viewCount: 0,
        downloadCount: 0,
        uploadedBy: null
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        url: 'https://via.placeholder.com/800x600/10B981/FFFFFF?text=Sample+Image+2',
        thumbnailUrl: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Sample+Image+2',
        publicId: 'sample_image_2',
        type: 'image',
        mimeType: 'image/jpeg',
        originalFilename: 'sample_image_2.jpg',
        displayName: 'Sample Image 2',
        size: 2048000, // 2MB
        format: 'jpg',
        width: 800,
        height: 600,
        folder: 'articles',
        folderId: '550e8400-e29b-41d4-a716-446655440002',
        caption: 'Another sample image for article content',
        altText: 'Sample image 2 placeholder',
        description: 'A second placeholder image for testing article media integration',
        tags: ['sample', 'article', 'content'],
        isPrivate: false,
        allowDownload: true,
        status: 'active',
        viewCount: 0,
        downloadCount: 0,
        uploadedBy: null
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440003',
        url: 'https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=Sample+Image+3',
        thumbnailUrl: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Sample+Image+3',
        publicId: 'sample_image_3',
        type: 'image',
        mimeType: 'image/jpeg',
        originalFilename: 'sample_image_3.jpg',
        displayName: 'Sample Image 3',
        size: 1536000, // 1.5MB
        format: 'jpg',
        width: 800,
        height: 600,
        folder: 'gallery',
        folderId: '550e8400-e29b-41d4-a716-446655440003',
        caption: 'Gallery image for visual content',
        altText: 'Sample image 3 placeholder',
        description: 'A gallery image placeholder for testing media gallery functionality',
        tags: ['sample', 'gallery', 'visual'],
        isPrivate: false,
        allowDownload: true,
        status: 'active',
        viewCount: 0,
        downloadCount: 0,
        uploadedBy: null
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440004',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnailUrl: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Sample+Video',
        publicId: 'sample_video_1',
        type: 'video',
        mimeType: 'video/mp4',
        originalFilename: 'sample_video_1.mp4',
        displayName: 'Sample Video 1',
        size: 1048576, // 1MB
        format: 'mp4',
        width: 1280,
        height: 720,
        duration: 30.5,
        folder: 'general',
        folderId: '550e8400-e29b-41d4-a716-446655440001',
        caption: 'A sample video for testing video functionality',
        altText: 'Sample video placeholder',
        description: 'A placeholder video file for testing video playback and management',
        tags: ['sample', 'video', 'test'],
        isPrivate: false,
        allowDownload: true,
        status: 'active',
        viewCount: 0,
        downloadCount: 0,
        uploadedBy: null
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440005',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        thumbnailUrl: 'https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=Sample+Audio',
        publicId: 'sample_audio_1',
        type: 'audio',
        mimeType: 'audio/wav',
        originalFilename: 'sample_audio_1.wav',
        displayName: 'Sample Audio 1',
        size: 512000, // 512KB
        format: 'wav',
        duration: 5.2,
        folder: 'general',
        folderId: '550e8400-e29b-41d4-a716-446655440001',
        caption: 'A sample audio file for testing audio functionality',
        altText: 'Sample audio placeholder',
        description: 'A placeholder audio file for testing audio playback and management',
        tags: ['sample', 'audio', 'sound'],
        isPrivate: false,
        allowDownload: true,
        status: 'active',
        viewCount: 0,
        downloadCount: 0,
        uploadedBy: null
      }
    ];

    for (const media of mediaFiles) {
      await Media.upsert(media);
    }

    console.log('Media files created successfully');

    // Verify the data was created
    const mediaCount = await Media.count();
    const folderCount = await MediaFolder.count();

    console.log(`Seeding completed successfully!`);
    console.log(`Created ${mediaCount} media files and ${folderCount} folders`);

  } catch (error) {
    console.error('Error seeding minimal media data:', error);
    throw error;
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection established successfully.');
      return seedMinimalMediaData();
    })
    .then(() => {
      console.log('Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedMinimalMediaData;