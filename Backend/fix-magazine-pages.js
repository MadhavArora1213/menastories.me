const { FlipbookMagazine } = require('./models');
const path = require('path');
const fs = require('fs').promises;

async function fixMagazineWithFile(magazineId, pdfFilePath) {
  try {
    console.log(`Fixing magazine ${magazineId} with file: ${pdfFilePath}`);

    // Check if file exists
    try {
      await fs.access(pdfFilePath);
    } catch (error) {
      throw new Error(`PDF file not found: ${pdfFilePath}`);
    }

    // Get magazine
    const magazine = await FlipbookMagazine.findByPk(magazineId);
    if (!magazine) {
      throw new Error(`Magazine not found: ${magazineId}`);
    }

    // Extract page count
    let totalPages = 0;
    try {
      const pdf = require('pdf-parse');
      const dataBuffer = await fs.readFile(pdfFilePath);
      const data = await pdf(dataBuffer);
      totalPages = data.numpages;
      console.log(`Extracted ${totalPages} pages from PDF`);
    } catch (error) {
      throw new Error(`Failed to extract page count: ${error.message}`);
    }

    // Update magazine
    await magazine.update({
      originalFilePath: pdfFilePath,
      totalPages: totalPages,
      processingStatus: 'completed',
      processingProgress: 100
    });

    console.log(`✅ Successfully updated ${magazine.title}: ${totalPages} pages`);
    return { success: true, title: magazine.title, pages: totalPages };

  } catch (error) {
    console.error(`❌ Error fixing magazine ${magazineId}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Usage example:
// fixMagazineWithFile('8c2f5d40-a3b0-485c-859b-de9615b4c43b', '/path/to/byteverse-budget-plan.pdf');

module.exports = { fixMagazineWithFile };