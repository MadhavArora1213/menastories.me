require('dotenv').config();
const taxonomyService = require('./services/taxonomyService');

async function checkTaxonomyData() {
  try {
    console.log('🔄 Loading taxonomy data from Excel file...');

    // Load taxonomy data from Excel
    const taxonomyData = await taxonomyService.loadTaxonomyData();

    console.log('✅ Taxonomy data loaded successfully');

    // Count categories and subcategories
    let totalCategories = 0;
    let totalSubcategories = 0;

    console.log('\n📊 Analyzing taxonomy data:');

    // Check each sheet
    for (const [sheetName, data] of Object.entries(taxonomyData)) {
      console.log(`\n📋 Sheet: ${sheetName}`);
      console.log(`   Records: ${data.length}`);

      if (sheetName.toLowerCase().includes('industr')) {
        totalCategories += data.length;
        console.log(`   ➕ Added to categories total`);
      }

      if (sheetName.toLowerCase().includes('subsector') || sheetName.toLowerCase().includes('subcategor')) {
        totalSubcategories += data.length;
        console.log(`   ➕ Added to subcategories total`);
      }

      // Show sample data
      if (data.length > 0) {
        console.log('   Sample records:');
        const sampleSize = Math.min(3, data.length);
        for (let i = 0; i < sampleSize; i++) {
          const record = data[i];
          const keys = Object.keys(record);
          console.log(`     ${i + 1}. ${keys.slice(0, 3).map(key => `${key}: ${record[key]}`).join(', ')}`);
        }
        if (data.length > 3) {
          console.log(`     ... and ${data.length - 3} more records`);
        }
      }
    }

    console.log('\n📈 SUMMARY:');
    console.log(`Categories (industries): ${totalCategories}`);
    console.log(`Subcategories (subsectors): ${totalSubcategories}`);

    if (totalCategories === 8 && totalSubcategories === 1666) {
      console.log('✅ Perfect! You have exactly 8 categories and 1666 subcategories as expected.');
    } else {
      console.log('⚠️  The counts do not match your expected values (8 categories, 1666 subcategories).');
      console.log('   This might be because:');
      console.log('   - The Excel file contains different data');
      console.log('   - The data is structured differently');
      console.log('   - Some sheets might not be counted as categories/subcategories');
    }

    // Check specific sheets that might contain the data
    console.log('\n🔍 Detailed analysis:');

    const industrySheets = Object.keys(taxonomyData).filter(key =>
      key.toLowerCase().includes('industr') || key.toLowerCase().includes('categor')
    );
    const subsectorSheets = Object.keys(taxonomyData).filter(key =>
      key.toLowerCase().includes('subsector') || key.toLowerCase().includes('subcategor')
    );

    console.log(`Industry/Category sheets found: ${industrySheets.join(', ')}`);
    console.log(`Subsector/Subcategory sheets found: ${subsectorSheets.join(', ')}`);

  } catch (error) {
    console.error('❌ Error checking taxonomy data:', error);
    console.error('Error details:', error.message);
  }
}

// Run the check
if (require.main === module) {
  checkTaxonomyData().catch(console.error);
}

module.exports = { checkTaxonomyData };