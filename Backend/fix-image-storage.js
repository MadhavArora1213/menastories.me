const fs = require('fs');
const path = require('path');

async function fixImageStorage() {
  try {
    console.log('🔍 Starting image storage fix...');

    const uploadsDir = path.join(__dirname, 'uploads');
    const storageImagesDir = path.join(__dirname, 'storage', 'images');

    // Ensure storage/images directory exists
    if (!fs.existsSync(storageImagesDir)) {
      fs.mkdirSync(storageImagesDir, { recursive: true });
      console.log('✅ Created storage/images directory');
    }

    // Get list of files in uploads directory
    const uploadFiles = fs.readdirSync(uploadsDir).filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    console.log(`📁 Found ${uploadFiles.length} image files in uploads directory`);

    // Get list of files in storage/images directory
    const storageFiles = fs.readdirSync(storageImagesDir).filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    console.log(`📁 Found ${storageFiles.length} image files in storage/images directory`);

    // Move files from uploads to storage/images if they don't exist there
    let movedCount = 0;
    for (const file of uploadFiles) {
      const sourcePath = path.join(uploadsDir, file);
      const destPath = path.join(storageImagesDir, file);

      if (!storageFiles.includes(file)) {
        console.log(`📂 Moving ${file} from uploads to storage/images`);
        fs.copyFileSync(sourcePath, destPath);
        movedCount++;
      }
    }

    console.log(`✅ Moved ${movedCount} image files to storage/images`);

    // Check for any featured_image files that might be missing
    const featuredImageFiles = storageFiles.filter(file =>
      file.startsWith('featured_image-')
    );

    console.log(`🖼️ Found ${featuredImageFiles.length} featured image files in storage`);

    // List all image files for reference
    console.log('\n📋 All image files in storage/images:');
    storageFiles.forEach(file => {
      const filePath = path.join(storageImagesDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${file} (${Math.round(stats.size / 1024)}KB)`);
    });

    console.log('\n✅ Image storage fix completed successfully');

  } catch (error) {
    console.error('❌ Error fixing image storage:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixImageStorage();