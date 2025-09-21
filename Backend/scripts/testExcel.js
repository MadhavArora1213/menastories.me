const XLSX = require('xlsx');
const path = require('path');

const excelFilePath = path.join(__dirname, '../../Magazine_Website/Events list for Website reference for Madhav.xlsx');

try {
  console.log('Reading Excel file:', excelFilePath);

  // Read the Excel file
  const workbook = XLSX.readFile(excelFilePath);

  // Get the first worksheet
  const sheetName = workbook.SheetNames[0];
  console.log('First sheet name:', sheetName);

  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1, // Use first row as headers
    defval: null, // Default value for empty cells
    blankrows: false // Skip blank rows
  });

  console.log('Total rows:', jsonData.length);
  console.log('Headers (first row):', jsonData[0]);
  console.log('First data row:', jsonData[1]);
  console.log('Second data row:', jsonData[2]);

  // Check if headers contain the expected column names
  const headers = jsonData[0];
  const expectedHeaders = ['Event Name', 'Starting Date', 'End Date'];

  console.log('\nChecking for expected headers:');
  expectedHeaders.forEach(expected => {
    const found = headers.some(header =>
      header && header.toString().toLowerCase().includes(expected.toLowerCase())
    );
    console.log(`${expected}: ${found ? 'FOUND' : 'NOT FOUND'}`);
  });

} catch (error) {
  console.error('Error reading Excel file:', error.message);
}