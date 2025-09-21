const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function optimizePDF(inputPath, outputPath) {
  try {
    // Read the PDF file
    const pdfBytes = await fs.readFile(inputPath);

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get all pages
    const pages = pdfDoc.getPages();

    // Compress images and optimize content
    for (const page of pages) {
      // You can add page-level optimizations here if needed
      // For now, we'll rely on pdf-lib's built-in compression
    }

    // Save the PDF with compression
    const optimizedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
      updateFieldAppearances: false
    });

    // Write the optimized PDF to output path
    await fs.writeFile(outputPath, optimizedPdfBytes);

  } catch (error) {
    throw new Error(`PDF optimization failed: ${error.message}`);
  }
}

async function optimizeSpecificPDF(inputPath, outputPath) {
  try {
    console.log('Starting PDF optimization process...');

    // Check if input file exists
    try {
      await fs.access(inputPath);
      console.log('✅ Input file exists');
    } catch (error) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Get original file size
    const originalStats = await fs.stat(inputPath);
    console.log(`Original size: ${Math.round(originalStats.size / 1024)} KB`);

    // Optimize the PDF
    console.log('Optimizing PDF...');
    await optimizePDF(inputPath, outputPath);

    // Get optimized file size
    const optimizedStats = await fs.stat(outputPath);
    console.log(`Optimized size: ${Math.round(optimizedStats.size / 1024)} KB`);

    const reduction = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(2);
    console.log(`Size reduction: ${reduction}%`);

    console.log('✅ PDF optimization completed successfully');

  } catch (error) {
    console.error('Error in PDF optimization:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: node optimize-pdf.js <inputPath> <outputPath>');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  optimizeSpecificPDF(inputPath, outputPath)
    .then(() => {
      console.log('\nOptimization process finished');
      process.exit(0);
    })
    .catch(error => {
      console.error('Optimization process failed:', error);
      process.exit(1);
    });
}

module.exports = { optimizeSpecificPDF };