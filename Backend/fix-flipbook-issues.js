const { FlipbookMagazine } = require('./models');
const path = require('path');
const fs = require('fs').promises;

async function fixFlipbookIssues() {
  try {
    console.log('Starting flipbook issue fix process...');

    // Step 1: Find magazines with missing file paths but existing files
    const magazinesWithoutPaths = await FlipbookMagazine.findAll({
      where: {
        originalFilePath: null,
        processingStatus: 'failed'
      },
      attributes: ['id', 'title', 'slug', 'createdAt']
    });

    console.log(`Found ${magazinesWithoutPaths.length} magazines with missing file paths`);

    // Get list of PDF files in storage
    const storageDir = path.join(__dirname, 'storage', 'flipbooks');
    const files = await fs.readdir(storageDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    console.log(`Found ${pdfFiles.length} PDF files in storage`);

    // Step 2: Try to match magazines to files based on creation time
    for (const magazine of magazinesWithoutPaths) {
      console.log(`\nProcessing: ${magazine.title}`);

      // Look for files created around the magazine's creation time
      const magazineTime = new Date(magazine.createdAt).getTime();
      const timeTolerance = 24 * 60 * 60 * 1000; // 24 hours tolerance

      let bestMatch = null;
      let smallestTimeDiff = Infinity;

      for (const pdfFile of pdfFiles) {
        try {
          const filePath = path.join(storageDir, pdfFile);
          const stats = await fs.stat(filePath);
          const fileTime = stats.mtime.getTime();
          const timeDiff = Math.abs(fileTime - magazineTime);

          if (timeDiff < timeTolerance && timeDiff < smallestTimeDiff) {
            smallestTimeDiff = timeDiff;
            bestMatch = pdfFile;
          }
        } catch (error) {
          console.error(`Error checking file ${pdfFile}:`, error.message);
        }
      }

      if (bestMatch) {
        const fullPath = path.join(storageDir, bestMatch);
        console.log(`Found potential match: ${bestMatch} (${Math.round(smallestTimeDiff / 1000 / 60)} minutes difference)`);

        // Update the magazine with the file path
        await magazine.update({
          originalFilePath: fullPath,
          processingStatus: 'pending' // Reset to pending so it can be reprocessed
        });

        console.log(`Updated ${magazine.title} with file path: ${fullPath}`);
      } else {
        console.log(`No suitable file found for ${magazine.title}`);
      }
    }

    // Step 3: Now run reprocessing for magazines that have file paths
    const magazinesToReprocess = await FlipbookMagazine.findAll({
      where: {
        originalFilePath: { [require('sequelize').Op.ne]: null },
        processingStatus: { [require('sequelize').Op.in]: ['pending', 'failed'] }
      }
    });

    console.log(`\nReprocessing ${magazinesToReprocess.length} magazines...`);

    for (const magazine of magazinesToReprocess) {
      try {
        console.log(`Reprocessing: ${magazine.title}`);

        // Check if file exists
        try {
          await fs.access(magazine.originalFilePath);
        } catch (error) {
          console.log(`File not found: ${magazine.originalFilePath}`);
          continue;
        }

        // Extract page count
        let totalPages = 0;

        try {
          const pdf = require('pdf-parse');
          const dataBuffer = await fs.readFile(magazine.originalFilePath);
          const data = await pdf(dataBuffer);
          totalPages = data.numpages;
          console.log(`Extracted ${totalPages} pages using pdf-parse`);
        } catch (pdfParseError) {
          console.warn(`pdf-parse failed: ${pdfParseError.message}`);
          // Try Ghostscript fallback
          try {
            const { spawn } = require('child_process');
            const gs = spawn('gs', [
              '-q',
              '-dNODISPLAY',
              '-c', `(${magazine.originalFilePath}) (r) file runpdfbegin pdfpagecount = quit`
            ]);

            let output = '';
            gs.stdout.on('data', (data) => {
              output += data.toString();
            });

            await new Promise((resolve, reject) => {
              gs.on('close', (code) => {
                if (code === 0) {
                  const match = output.match(/(\d+)/);
                  if (match) {
                    totalPages = parseInt(match[1]);
                    console.log(`Extracted ${totalPages} pages using Ghostscript`);
                  }
                  resolve();
                } else {
                  reject(new Error(`Ghostscript failed with code ${code}`));
                }
              });
              gs.on('error', reject);
            });
          } catch (gsError) {
            console.error(`Both pdf-parse and Ghostscript failed: ${gsError.message}`);
            continue;
          }
        }

        if (totalPages > 0) {
          await magazine.update({
            totalPages,
            processingStatus: 'completed',
            processingProgress: 100
          });
          console.log(`✅ Updated ${magazine.title}: ${totalPages} pages`);
        } else {
          console.log(`❌ Still 0 pages for ${magazine.title}`);
        }

      } catch (error) {
        console.error(`Error reprocessing ${magazine.title}:`, error.message);
      }
    }

    // Final summary
    const finalMagazines = await FlipbookMagazine.findAll({
      attributes: ['id', 'title', 'totalPages', 'processingStatus']
    });

    console.log('\n=== FINAL SUMMARY ===');
    finalMagazines.forEach(magazine => {
      console.log(`${magazine.title}: ${magazine.totalPages} pages (${magazine.processingStatus})`);
    });

  } catch (error) {
    console.error('Error in fix process:', error);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const sequelize = require('./config/db');

  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully');
      return fixFlipbookIssues();
    })
    .then(() => {
      console.log('\nFix process completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = { fixFlipbookIssues };