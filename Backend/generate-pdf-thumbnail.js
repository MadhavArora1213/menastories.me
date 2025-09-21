const fs = require('fs').promises;
const path = require('path');
const pdf2img = require('pdf2img');

async function generatePDFThumbnail(inputPath, outputPath, options = {}) {
  try {
    console.log('Starting PDF thumbnail generation...');

    // Check if input file exists
    try {
      await fs.access(inputPath);
      console.log('✅ Input file exists');
    } catch (error) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    // Set pdf2img options
    pdf2img.setOptions({
      type: 'png',
      size: 1024,
      density: 150,
      outputdir: path.dirname(outputPath),
      outputname: path.basename(outputPath, path.extname(outputPath))
    });

    console.log('Converting first page to image...');

    // Convert PDF to image
    const result = await new Promise((resolve, reject) => {
      pdf2img.convert(inputPath, function(err, info) {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });

    if (result && result.message && result.message.indexOf('success') !== -1) {
      console.log('✅ PDF thumbnail generated successfully');
      console.log(`Output: ${outputPath}`);
      return outputPath;
    } else {
      throw new Error('Failed to generate thumbnail - conversion failed');
    }

  } catch (error) {
    console.error('Error in PDF thumbnail generation:', error.message);
    throw error;
  }
}

async function generateThumbnailForPDF(inputPath, outputPath) {
  try {
    const resultPath = await generatePDFThumbnail(inputPath, outputPath);
    console.log(`Thumbnail saved to: ${resultPath}`);
    return resultPath;
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: node generate-pdf-thumbnail.js <inputPath> <outputPath>');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  generateThumbnailForPDF(inputPath, outputPath)
    .then((resultPath) => {
      console.log('\nThumbnail generation finished');
      console.log(`Result: ${resultPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Thumbnail generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateThumbnailForPDF };