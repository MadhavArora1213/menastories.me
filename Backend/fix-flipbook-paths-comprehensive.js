const { FlipbookMagazine } = require('./models');
const fs = require('fs').promises;
const path = require('path');

// Utility function to normalize file paths
function normalizeFilePath(filePath) {
  if (!filePath) return filePath;
  return filePath.replace(/\\/g, '/');
}

// Utility function to resolve file path with multiple strategies
async function resolveFilePath(storedPath) {
  if (!storedPath) return null;

  const normalizedPath = normalizeFilePath(storedPath);

  // Try the stored path first
  if (await fs.access(normalizedPath).then(() => true).catch(() => false)) {
    return normalizedPath;
  }

  // Try alternative paths
  const filename = path.basename(normalizedPath);
  const alternativePaths = [
    path.join(__dirname, 'storage', 'flipbooks', filename),
    path.join(process.cwd(), 'storage', 'flipbooks', filename),
    path.join('/var/www/html/Backend/storage/flipbooks', filename),
    path.join('/home/menastories/public_html/Backend/storage/flipbooks', filename),
    path.join(__dirname, '..', 'storage', 'flipbooks', filename),
    path.join(__dirname, '..', 'Backend', 'storage', 'flipbooks', filename)
  ];

  for (const altPath of alternativePaths) {
    const normalizedAltPath = normalizeFilePath(altPath);
    if (await fs.access(normalizedAltPath).then(() => true).catch(() => false)) {
      return normalizedAltPath;
    }
  }

  return null;
}

async function fixAllFlipbookPaths() {
  try {
    console.log('🔍 Starting comprehensive flipbook path fix...');

    // Get all magazines with file paths
    const magazines = await FlipbookMagazine.findAll({
      where: {
        originalFilePath: {
          [require('sequelize').Op.ne]: null
        }
      },
      attributes: ['id', 'title', 'originalFilePath', 'fileSize', 'createdAt']
    });

    console.log(`Found ${magazines.length} magazines with file paths to check`);

    let fixed = 0;
    let notFound = 0;
    let alreadyCorrect = 0;

    // Get all PDF files in storage
    const storageDir = path.join(__dirname, 'storage', 'flipbooks');
    const files = await fs.readdir(storageDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf') && file.startsWith('flipbook-'));

    console.log(`Found ${pdfFiles.length} PDF files in storage`);

    for (const magazine of magazines) {
      try {
        console.log(`\n📋 Checking magazine: ${magazine.title} (${magazine.id})`);

        const resolvedPath = await resolveFilePath(magazine.originalFilePath);

        if (resolvedPath && resolvedPath !== magazine.originalFilePath) {
          // Update the magazine with the correct path
          await magazine.update({
            originalFilePath: resolvedPath
          });

          console.log(`✅ Fixed path for ${magazine.title}:`);
          console.log(`   From: ${magazine.originalFilePath}`);
          console.log(`   To:   ${resolvedPath}`);
          fixed++;
        } else if (resolvedPath && resolvedPath === magazine.originalFilePath) {
          console.log(`✅ Path already correct for ${magazine.title}`);
          alreadyCorrect++;
        } else {
          console.log(`❌ File not found for ${magazine.title}: ${magazine.originalFilePath}`);
          notFound++;
        }

      } catch (error) {
        console.error(`❌ Error processing ${magazine.title}: ${error.message}`);
      }
    }

    console.log(`\n📊 Comprehensive Path Fix Summary:`);
    console.log(`- Total magazines checked: ${magazines.length}`);
    console.log(`- Paths already correct: ${alreadyCorrect}`);
    console.log(`- Paths fixed: ${fixed}`);
    console.log(`- Files not found: ${notFound}`);

    // Also fix any magazines with null file paths that might have files
    console.log(`\n🔍 Checking magazines without file paths...`);
    const magazinesWithoutPaths = await FlipbookMagazine.findAll({
      where: {
        originalFilePath: null
      },
      attributes: ['id', 'title', 'createdAt']
    });

    console.log(`Found ${magazinesWithoutPaths.length} magazines without file paths`);

    let matchedFiles = 0;
    for (const magazine of magazinesWithoutPaths) {
      // Try to find a matching file based on creation time
      const magazineTime = new Date(magazine.createdAt).getTime();

      for (const pdfFile of pdfFiles) {
        const timestampMatch = pdfFile.match(/flipbook-(\d+)-\d+\.pdf/);
        if (timestampMatch) {
          const fileTime = parseInt(timestampMatch[1]);
          const timeDiff = Math.abs(fileTime - magazineTime);

          // If timestamps are within 5 minutes, consider it a match
          if (timeDiff < 5 * 60 * 1000) {
            const filePath = path.join(storageDir, pdfFile);
            const normalizedPath = normalizeFilePath(filePath);

            await magazine.update({
              originalFilePath: normalizedPath
            });

            console.log(`✅ Matched ${magazine.title} with ${pdfFile}`);
            matchedFiles++;
            break;
          }
        }
      }
    }

    console.log(`\n📊 Final Summary:`);
    console.log(`- Magazines with paths fixed: ${fixed}`);
    console.log(`- Files matched to pathless magazines: ${matchedFiles}`);
    console.log(`- Total issues resolved: ${fixed + matchedFiles}`);

  } catch (error) {
    console.error('❌ Error in comprehensive path fix:', error);
  } finally {
    process.exit(0);
  }
}

fixAllFlipbookPaths();