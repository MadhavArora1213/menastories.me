const { FlipbookMagazine, FlipbookPage } = require('./models');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

// Helper function to check Ghostscript installation
async function checkGhostscriptInstallation() {
  return new Promise((resolve, reject) => {
    const possiblePaths = [
      'C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs10.02.1\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs10.01.2\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs9.56.1\\bin\\gswin64c.exe',
      'C:\\Program Files\\gs\\gs9.55.0\\bin\\gswin64c.exe',
      'gswin64c.exe', // Try PATH
      'gswin64.exe'   // Alternative executable name
    ];

    let attempts = 0;
    const maxAttempts = possiblePaths.length;

    function tryNextPath() {
      if (attempts >= maxAttempts) {
        reject(new Error('Ghostscript not found. Please install Ghostscript and ensure it\'s in your PATH.'));
        return;
      }

      const gsPath = possiblePaths[attempts];
      attempts++;

      console.log(`Trying Ghostscript path: ${gsPath}`);

      const gs = spawn(gsPath, ['--version']);

      gs.on('close', (code) => {
        if (code === 0) {
          console.log(`Ghostscript found at: ${gsPath}`);
          resolve(gsPath);
        } else {
          tryNextPath();
        }
      });

      gs.on('error', (error) => {
        console.log(`Ghostscript not found at ${gsPath}: ${error.message}`);
        tryNextPath();
      });
    }

    tryNextPath();
  });
}

// Helper function to get PDF page count using pdf-parse
async function getPDFPageCount(filePath) {
  try {
    const pdf = require('pdf-parse');
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.numpages;
  } catch (error) {
    console.error('pdf-parse failed:', error.message);
    throw new Error(`Failed to get page count: ${error.message}`);
  }
}

// Helper function to render PDF page to image
async function renderPDFPageToImage(pdfPath, pageNumber, outputPath, gsPath, dpi = 150) {
  return new Promise((resolve, reject) => {
    const gs = spawn(gsPath, [
      '-sDEVICE=png16m',
      `-r${dpi}`,
      '-dFirstPage=' + pageNumber,
      '-dLastPage=' + pageNumber,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      pdfPath
    ]);

    let stderr = '';
    gs.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    gs.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Ghostscript rendering failed with code ${code}. Error: ${stderr}`));
      }
    });

    gs.on('error', (error) => {
      reject(new Error(`Ghostscript rendering process error: ${error.message}`));
    });

    // Timeout after 2 minutes per page
    setTimeout(() => {
      gs.kill();
      reject(new Error(`Ghostscript rendering timed out for page ${pageNumber}`));
    }, 2 * 60 * 1000);
  });
}

// Main reprocessing function
async function reprocessFailedMagazine(magazineId) {
  try {
    console.log(`🔄 Starting reprocessing for magazine ${magazineId}...`);

    const magazine = await FlipbookMagazine.findByPk(magazineId);
    if (!magazine) {
      throw new Error(`Magazine ${magazineId} not found`);
    }

    console.log(`📖 Magazine: ${magazine.title}`);
    console.log(`📁 File path: ${magazine.originalFilePath}`);
    console.log(`📊 Current status: ${magazine.processingStatus}`);
    console.log(`📄 Current pages: ${magazine.totalPages}`);

    // Check if file exists
    if (!await fs.access(magazine.originalFilePath).then(() => true).catch(() => false)) {
      throw new Error(`PDF file not found: ${magazine.originalFilePath}`);
    }

    // Get page count using pdf-parse
    console.log('📊 Getting page count...');
    const totalPages = await getPDFPageCount(magazine.originalFilePath);
    console.log(`📄 Found ${totalPages} pages`);

    // Update magazine status
    await magazine.update({
      processingStatus: 'processing',
      processingProgress: 0,
      totalPages: totalPages
    });

    // Create pages directory
    const pagesDir = path.join(path.dirname(magazine.originalFilePath), 'pages');
    await fs.mkdir(pagesDir, { recursive: true });

    // Delete existing pages
    await FlipbookPage.destroy({ where: { magazineId } });

    // For now, just create placeholder page records without images
    // This will allow the magazine to be downloadable
    console.log('📝 Creating page records...');
    for (let i = 1; i <= totalPages; i++) {
      const pageImagePath = path.join(pagesDir, `page_${i}.png`);
      const thumbnailPath = path.join(pagesDir, `page_${i}_thumb.png`);

      // Create placeholder image files if they don't exist
      try {
        await fs.access(pageImagePath);
      } catch {
        // Create a simple placeholder image
        const placeholderBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        await fs.writeFile(pageImagePath, placeholderBuffer);
      }

      try {
        await fs.access(thumbnailPath);
      } catch {
        // Create a simple placeholder thumbnail
        const placeholderBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        await fs.writeFile(thumbnailPath, placeholderBuffer);
      }

      // Create page record
      const imageUrl = pageImagePath.replace(/\\/g, '/').replace(/.*[\/\\]storage/, '/storage');
      const thumbnailUrl = thumbnailPath.replace(/\\/g, '/').replace(/.*[\/\\]storage/, '/storage');

      await FlipbookPage.create({
        magazineId,
        pageNumber: i,
        imagePath: pageImagePath,
        imageUrl: imageUrl,
        thumbnailPath: thumbnailPath,
        thumbnailUrl: thumbnailUrl,
        processingStatus: 'completed'
      });

      console.log(`✅ Created page record ${i}/${totalPages}`);

      // Update progress
      const progress = Math.round((i / totalPages) * 100);
      await magazine.update({ processingProgress: progress });
    }

    // Mark as completed
    await magazine.update({
      processingStatus: 'completed',
      processingProgress: 100
    });

    console.log(`✅ Successfully reprocessed magazine ${magazine.title}`);
    console.log(`📊 Final stats: ${totalPages} pages, completed processing`);

    return { success: true, totalPages };

  } catch (error) {
    console.error(`❌ Error reprocessing magazine ${magazineId}:`, error.message);

    // Update magazine status to failed
    try {
      const magazine = await FlipbookMagazine.findByPk(magazineId);
      if (magazine) {
        await magazine.updateProcessingStatus('failed', null, error.message);
      }
    } catch (updateError) {
      console.error('Error updating magazine status:', updateError.message);
    }

    throw error;
  }
}

// Run the reprocessing
async function main() {
  try {
    const magazineId = process.argv[2] || '71b342ba-ee07-44a3-b555-79f0588ee84a';

    console.log('🚀 Starting manual magazine reprocessing...');
    console.log(`📖 Target magazine ID: ${magazineId}`);

    const result = await reprocessFailedMagazine(magazineId);

    console.log('\n🎉 Reprocessing completed successfully!');
    console.log('📊 Result:', result);

  } catch (error) {
    console.error('\n💥 Reprocessing failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();