const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');

async function identifyPdfPages() {
  try {
    console.log('Analyzing all PDF files for page counts...');

    const storageDir = path.join(__dirname, 'storage', 'flipbooks');
    const files = await fs.readdir(storageDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    console.log(`Found ${pdfFiles.length} PDF files`);

    const results = [];

    for (const pdfFile of pdfFiles) {
      try {
        const filePath = path.join(storageDir, pdfFile);
        const stats = await fs.stat(filePath);

        let pageCount = 0;
        try {
          const dataBuffer = await fs.readFile(filePath);
          const data = await pdf(dataBuffer);
          pageCount = data.numpages;
        } catch (error) {
          console.log(`Error reading ${pdfFile}: ${error.message}`);
          continue;
        }

        results.push({
          filename: pdfFile,
          filePath: filePath,
          fileSize: stats.size,
          pages: pageCount,
          modified: stats.mtime
        });

        console.log(`${pdfFile}: ${pageCount} pages (${Math.round(stats.size / 1024)} KB)`);

      } catch (error) {
        console.error(`Error processing ${pdfFile}:`, error.message);
      }
    }

    // Sort by page count to find files with specific page numbers
    results.sort((a, b) => a.pages - b.pages);

    console.log('\n=== FILES BY PAGE COUNT ===');
    const pageGroups = {};
    results.forEach(result => {
      if (!pageGroups[result.pages]) {
        pageGroups[result.pages] = [];
      }
      pageGroups[result.pages].push(result.filename);
    });

    Object.keys(pageGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(pages => {
      console.log(`${pages} pages: ${pageGroups[pages].join(', ')}`);
    });

    // Look for files with 10 pages (matching the user's document)
    const tenPageFiles = results.filter(r => r.pages === 10);
    if (tenPageFiles.length > 0) {
      console.log('\n=== POTENTIAL MATCH FOR BYTEVERSE DOCUMENT (10 pages) ===');
      tenPageFiles.forEach(file => {
        console.log(`- ${file.filename} (${Math.round(file.fileSize / 1024)} KB, modified: ${file.modified.toISOString()})`);
      });
    }

    return results;

  } catch (error) {
    console.error('Error in identify process:', error);
    return [];
  }
}

// Run if called directly
if (require.main === module) {
  identifyPdfPages()
    .then(results => {
      console.log('\nAnalysis completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { identifyPdfPages };