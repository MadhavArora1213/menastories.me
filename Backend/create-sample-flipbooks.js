require('dotenv').config();
const { FlipbookMagazine } = require('./models');
const path = require('path');
const fs = require('fs');

async function createSampleFlipbooks() {
  try {
    console.log('Creating sample flipbook data...');

    // Sample flipbook data
    const sampleFlipbooks = [
      {
        title: 'Business Leadership Insights',
        slug: 'business-leadership-insights',
        description: 'Essential strategies and insights for modern business leaders',
        excerpt: 'Learn from successful entrepreneurs and industry leaders',
        category: 'business',
        magazineType: 'monthly',
        accessType: 'free',
        totalPages: 32,
        fileSize: 3072000, // 3MB
        processingStatus: 'completed',
        isPublished: true,
        publishedAt: new Date(),
        createdBy: '00000000-0000-0000-0000-000000000000' // System admin ID
      }
    ];

    // Create sample flipbooks using Sequelize
    for (const flipbookData of sampleFlipbooks) {
      const flipbook = await FlipbookMagazine.create(flipbookData);
      console.log(`✅ Created flipbook: ${flipbook.title} (ID: ${flipbook.id})`);
    }

    console.log('🎉 Sample flipbooks created successfully!');

  } catch (error) {
    console.error('Error creating sample flipbooks:', error);
  } finally {
    process.exit(0);
  }
}

createSampleFlipbooks();