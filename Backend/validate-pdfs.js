const fs = require('fs').promises;
const path = require('path');

async function validatePDFs() {
  try {
    console.log('Validating PDF files...');

    const storageDir = path.join(__dirname, 'storage', 'flipbooks');
    const files = await fs.readdir(storageDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    console.log(`Found ${pdfFiles.length} PDF files to validate`);

    for (const pdfFile of pdfFiles) {
      try {
        const filePath = path.join(storageDir, pdfFile);
        const stats = await fs.stat(filePath);

        console.log(`\n📄 Validating: ${pdfFile}`);
        console.log(`   Size: ${Math.round(stats.size / 1024)} KB`);

        // Read first few bytes to check PDF header
        const buffer = await fs.readFile(filePath);
        const header = buffer.slice(0, 8).toString();

        console.log(`   Header: ${header}`);

        // Check for PDF header
        if (!header.startsWith('%PDF-')) {
          console.log(`   ❌ Invalid PDF header`);
          continue;
        }

        // Check for PDF trailer
        const content = buffer.toString();
        const hasTrailer = content.includes('%%EOF');

        console.log(`   Trailer (%%EOF): ${hasTrailer ? '✅ Found' : '❌ Missing'}`);

        // Check file size (very small files might be corrupted)
        if (stats.size < 1000) {
          console.log(`   ⚠️  Very small file (${stats.size} bytes) - might be corrupted`);
        }

        // Try to extract basic info using pdf-parse
        try {
          const pdf = require('pdf-parse');
          const data = await pdf(buffer);
          console.log(`   📊 Pages: ${data.numpages}`);
          console.log(`   📝 Title: ${data.info?.Title || 'No title'}`);
          console.log(`   ✅ PDF structure appears valid`);
        } catch (pdfError) {
          console.log(`   ❌ PDF parsing error: ${pdfError.message}`);

          // Check for common PDF corruption indicators
          if (pdfError.message.includes('InvalidPDFException')) {
            console.log(`   🔧 Possible corruption detected`);
          }
        }

      } catch (error) {
        console.error(`   💥 Error validating ${pdfFile}:`, error.message);
      }
    }

  } catch (error) {
    console.error('Error in PDF validation:', error);
  }
}

// Run if called directly
if (require.main === module) {
  validatePDFs()
    .then(() => {
      console.log('\nPDF validation completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validatePDFs };