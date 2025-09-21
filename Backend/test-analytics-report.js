const axios = require('axios');

async function testAnalyticsReport() {
  try {
    console.log('Testing analytics report generation...');

    // First test with JSON format to see the data structure
    console.log('Testing JSON format first...');
    const jsonResponse = await axios.post('http://localhost:5000/api/analytics/custom-reports', {
      name: "Test Analytics Report",
      description: "Comprehensive analytics report with sample data",
      reportType: "comprehensive",
      dateRange: {
        startDate: "2025-08-19",
        endDate: "2025-09-18"
      },
      metrics: ["page_views", "sessions", "engagement", "content_performance"],
      format: "json"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('JSON Response status:', jsonResponse.status);
    console.log('JSON Response data:', JSON.stringify(jsonResponse.data, null, 2));

    // Now test PDF format
    console.log('Testing PDF format...');
    const pdfResponse = await axios.post('http://localhost:5000/api/analytics/custom-reports', {
      name: "Test Analytics Report",
      description: "Comprehensive analytics report with sample data",
      reportType: "comprehensive",
      dateRange: {
        startDate: "2025-08-19",
        endDate: "2025-09-18"
      },
      metrics: ["page_views", "sessions", "engagement", "content_performance"],
      format: "pdf"
    }, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('PDF Response status:', pdfResponse.status);
    console.log('PDF Response data length:', pdfResponse.data.length);

    // Save the PDF to a file
    const fs = require('fs');
    fs.writeFileSync('test_report.pdf', pdfResponse.data);
    console.log('PDF report saved as test_report.pdf');

  } catch (error) {
    console.error('Error testing analytics report:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testAnalyticsReport();