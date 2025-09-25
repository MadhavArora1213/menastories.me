const { FlipbookMagazine } = require('./models');
const fs = require('fs').promises;
const path = require('path');

async function fixMagazineFilePaths() {
  try {
    console.log('🔍 Checking magazines without file paths...');

    // Get all magazines without file paths
    const magazinesWithoutFiles = await FlipbookMagazine.findAll({
      where: {
        originalFilePath: null
      },
      attributes: ['id', 'title', 'createdAt']
    });

    console.log(`Found ${magazinesWithoutFiles.length} magazines without file paths`);

    // Get all PDF files in storage
    const storageDir = path.join(__dirname, 'storage', 'flipbooks');
    const files = await fs.readdir(storageDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf') && file.startsWith('flipbook-'));

    console.log(`Found ${pdfFiles.length} PDF files in storage`);

    let fixed = 0;

    // Get file stats for all PDF files
    const filesWithStats = [];
    for (const pdfFile of pdfFiles) {
      const filePath = path.join(storageDir, pdfFile);
      try {
        const stats = await fs.stat(filePath);
        const timestampMatch = pdfFile.match(/flipbook-(\d+)-\d+\.pdf/);
        const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : 0;

        filesWithStats.push({
          file: pdfFile,
          path: filePath,
          timestamp,
          size: stats.size,
          created: stats.birthtime
        });
      } catch (error) {
        console.log(`❌ File not accessible: ${pdfFile}`);
      }
    }

    // Sort files by creation time (oldest first)
    filesWithStats.sort((a, b) => a.timestamp - b.timestamp);

    // Sort magazines by creation time (oldest first)
    magazinesWithoutFiles.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    console.log(`\n📋 Matching ${magazinesWithoutFiles.length} magazines with ${filesWithStats.length} available files...`);

    // Try to match magazines with files based on creation time proximity
    for (let i = 0; i < Math.min(magazinesWithoutFiles.length, filesWithStats.length); i++) {
      const magazine = magazinesWithoutFiles[i];
      const file = filesWithStats[i];

      try {
        // Update the magazine record
        await magazine.update({
          originalFilePath: file.path,
          fileSize: file.size
        });

        console.log(`✅ Fixed ${magazine.title}: ${file.file}`);
        fixed++;
      } catch (error) {
        console.log(`❌ Error updating ${magazine.title}: ${error.message}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Magazines without files: ${magazinesWithoutFiles.length}`);
    console.log(`- PDF files in storage: ${pdfFiles.length}`);
    console.log(`- Successfully fixed: ${fixed}`);

  } catch (error) {
    console.error('❌ Error fixing magazine file paths:', error);
  }
}

fixMagazineFilePaths();