const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

async function repairPDF(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const gs = spawn('gs', [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/prepress',
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath
    ]);

    let stderr = '';
    gs.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    gs.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Ghostscript repair failed: ${stderr}`));
      }
    });

    gs.on('error', (error) => {
      reject(new Error(`Ghostscript process error: ${error.message}`));
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      gs.kill();
      reject(new Error('PDF repair timed out'));
    }, 2 * 60 * 1000);
  });
}

async function repairAllPDFs() {
  try {
    console.log('Starting PDF repair process...');

    const storageDir = path.join(__dirname, 'storage', 'flipbooks');
    const files = await fs.readdir(storageDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    console.log(`Found ${pdfFiles.length} PDF files to repair`);

    for (const pdfFile of pdfFiles) {
      try {
        const inputPath = path.join(storageDir, pdfFile);
        const outputPath = path.join(storageDir, pdfFile.replace('.pdf', '_repaired.pdf'));

        console.log(`\nRepairing: ${pdfFile}`);

        // Check if file exists and get its size
        const stats = await fs.stat(inputPath);
        console.log(`Original size: ${Math.round(stats.size / 1024)} KB`);

        // Repair the PDF
        await repairPDF(inputPath, outputPath);

        // Check the repaired file
        const repairedStats = await fs.stat(outputPath);
        console.log(`Repaired size: ${Math.round(repairedStats.size / 1024)} KB`);

        // Replace original with repaired version
        await fs.rename(outputPath, inputPath);
        console.log(`✅ Successfully repaired ${pdfFile}`);

      } catch (error) {
        console.error(`❌ Failed to repair ${pdfFile}:`, error.message);
      }
    }

    console.log('\nPDF repair process completed');

  } catch (error) {
    console.error('Error in PDF repair process:', error);
  }
}

// Run if called directly
if (require.main === module) {
  repairAllPDFs()
    .then(() => {
      console.log('\nRepair process finished');
      process.exit(0);
    })
    .catch(error => {
      console.error('Repair process failed:', error);
      process.exit(1);
    });
}

module.exports = { repairAllPDFs };