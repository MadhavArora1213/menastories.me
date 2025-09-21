const { FlipbookMagazine, FlipbookPage } = require('./models');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

async function regenerateFlipbookImages() {
  try {
    console.log('Starting flipbook image regeneration process...');

    // Step 1: Get all magazines that need reprocessing
    const magazines = await FlipbookMagazine.findAll({
      where: {
        processingStatus: 'completed',
        originalFilePath: {
          [require('sequelize').Op.ne]: null
        }
      },
      attributes: ['id', 'title', 'slug', 'totalPages', 'originalFilePath']
    });

    console.log(`Found ${magazines.length} magazines to reprocess`);

    for (const magazine of magazines) {
      try {
        console.log(`\nProcessing: ${magazine.title} (${magazine.id})`);

        // Check if PDF file exists
        try {
          await fs.access(magazine.originalFilePath);
          console.log(`✅ PDF file exists: ${magazine.originalFilePath}`);
        } catch (error) {
          console.log(`❌ PDF file not found: ${magazine.originalFilePath}`);
          continue;
        }

        // Step 2: Clear existing page records with null image paths
        const existingPages = await FlipbookPage.findAll({
          where: { magazineId: magazine.id }
        });

        console.log(`Found ${existingPages.length} existing page records`);

        // Delete pages with null image paths
        const nullImagePages = existingPages.filter(page => !page.imagePath);
        if (nullImagePages.length > 0) {
          await FlipbookPage.destroy({
            where: {
              magazineId: magazine.id,
              imagePath: null
            }
          });
          console.log(`🗑️ Deleted ${nullImagePages.length} page records with null image paths`);
        }

        // Step 3: Re-extract page count
        let totalPages = 0;
        try {
          const pdf = require('pdf-parse');
          const dataBuffer = await fs.readFile(magazine.originalFilePath);
          const data = await pdf(dataBuffer);
          totalPages = data.numpages;
          console.log(`📊 Extracted ${totalPages} pages using pdf-parse`);
        } catch (pdfParseError) {
          console.warn(`pdf-parse failed: ${pdfParseError.message}`);
          // Fallback to Ghostscript
          try {
            const gs = spawn('C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe', [
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
                    console.log(`📊 Extracted ${totalPages} pages using Ghostscript`);
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

        if (totalPages === 0) {
          console.log(`❌ No pages detected in PDF`);
          continue;
        }

        // Update magazine with correct page count
        await magazine.update({ totalPages });
        console.log(`📝 Updated magazine with ${totalPages} pages`);

        // Step 4: Create pages directory
        const pagesDir = path.join(path.dirname(magazine.originalFilePath), 'pages');
        await fs.mkdir(pagesDir, { recursive: true });
        console.log(`📁 Created pages directory: ${pagesDir}`);

        // Step 5: Generate page images
        console.log(`🎨 Generating page images...`);
        for (let i = 1; i <= totalPages; i++) {
          const pageImagePath = path.join(pagesDir, `page_${i}.png`);
          const thumbnailPath = path.join(pagesDir, `page_${i}_thumb.png`);

          try {
            // Check if page already exists
            try {
              await fs.access(pageImagePath);
              console.log(`⏭️ Page ${i} already exists, skipping`);
              continue;
            } catch {
              // Page doesn't exist, create it
            }

            // Generate full-size page image
            await new Promise((resolve, reject) => {
              const gs = spawn('C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe', [
                '-sDEVICE=png16m',
                '-r150',
                `-dFirstPage=${i}`,
                `-dLastPage=${i}`,
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                `-sOutputFile=${pageImagePath}`,
                magazine.originalFilePath
              ]);

              gs.on('close', (code) => {
                if (code === 0) {
                  resolve();
                } else {
                  reject(new Error(`Ghostscript failed for page ${i}`));
                }
              });

              gs.on('error', reject);
            });

            // Generate thumbnail
            await new Promise((resolve, reject) => {
              const gs = spawn('C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe', [
                '-sDEVICE=png16m',
                '-r72',
                `-dFirstPage=${i}`,
                `-dLastPage=${i}`,
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                `-sOutputFile=${thumbnailPath}`,
                magazine.originalFilePath
              ]);

              gs.on('close', (code) => {
                if (code === 0) {
                  resolve();
                } else {
                  reject(new Error(`Ghostscript failed for thumbnail ${i}`));
                }
              });

              gs.on('error', reject);
            });

            // Create page record in database
            const imageUrl = `/api/storage${pageImagePath.replace(/\\/g, '/').replace(/.*\/storage/, '')}`;
            const thumbnailUrl = `/api/storage${thumbnailPath.replace(/\\/g, '/').replace(/.*\/storage/, '')}`;

            await FlipbookPage.create({
              magazineId: magazine.id,
              pageNumber: i,
              imagePath: pageImagePath,
              imageUrl: imageUrl,
              thumbnailPath: thumbnailPath,
              thumbnailUrl: thumbnailUrl,
              processingStatus: 'completed'
            });

            console.log(`✅ Created page ${i}/${totalPages}`);

          } catch (pageError) {
            console.error(`❌ Failed to create page ${i}:`, pageError.message);
          }
        }

        console.log(`🎉 Successfully processed ${magazine.title}`);

      } catch (error) {
        console.error(`💥 Error processing ${magazine.title}:`, error.message);
      }
    }

    // Final summary
    const finalMagazines = await FlipbookMagazine.findAll({
      include: [
        {
          model: FlipbookPage,
          as: 'pages',
          required: false
        }
      ]
    });

    console.log('\n=== FINAL SUMMARY ===');
    finalMagazines.forEach(magazine => {
      const pageCount = magazine.pages ? magazine.pages.length : 0;
      console.log(`${magazine.title}: ${pageCount}/${magazine.totalPages} pages`);
    });

  } catch (error) {
    console.error('Error in regeneration process:', error);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const sequelize = require('./config/db');

  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully');
      return regenerateFlipbookImages();
    })
    .then(() => {
      console.log('\n🎉 Image regeneration completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = { regenerateFlipbookImages };