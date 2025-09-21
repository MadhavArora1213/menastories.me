const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/upload';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
  const statusColor = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  console.log(`${colors.bold}${testName}:${colors.reset} ${statusColor}${status}${colors.reset}${details ? ` - ${details}` : ''}`);
}

// Create a simple test image (1x1 pixel PNG)
function createTestImage() {
  // This is a minimal 1x1 pixel PNG data URL converted to buffer
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
    0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, pngData);
  return testImagePath;
}

// Test local server connectivity
async function testLocalServer() {
  try {
    const response = await axios.get('http://localhost:5000/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function testEndpoint(url, method = 'GET', data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url,
      headers: data ? data.getHeaders() : {},
      data,
      timeout: 10000
    };

    const response = await axios(config);

    if (response.status === expectedStatus) {
      return { success: true, data: response.data, status: response.status };
    } else {
      return { success: false, error: `Unexpected status: ${response.status}`, status: response.status };
    }
  } catch (error) {
    if (error.response) {
      return { success: false, error: error.response.data, status: error.response.status };
    } else if (error.code === 'ECONNREFUSED') {
      return { success: false, error: 'Connection refused - server not running', status: 0 };
    } else {
      return { success: false, error: error.message, status: 0 };
    }
  }
}

async function runTests() {
  log('\n🧪 Starting Upload Routes Test Suite\n', colors.bold);

  // Test local server connectivity first
  log('🔍 Testing local server connectivity...', colors.bold);
  const serverConnected = await testLocalServer();
  if (!serverConnected) {
    logTest('Local Server', 'FAIL', 'Local server at localhost:5000 is not responding');
    log('⚠️  Please ensure the local server is running with: npm start', colors.yellow);
    log('🔧 You can still test some routes, but most will fail.', colors.yellow);
  } else {
    logTest('Local Server', 'PASS', 'Local server is responding');
  }

  // Create test image
  const testImagePath = createTestImage();
  log(`📸 Created test image: ${testImagePath}`, colors.blue);

  let uploadedImageFilename = null;
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function updateResults(success) {
    testResults.total++;
    if (success) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }
  }

  try {
    // Test 1: Test endpoint
    log('Test 1: Testing /api/upload/test endpoint', colors.bold);
    const testResult = await testEndpoint(`${BASE_URL}/test`);
    if (testResult.success && testResult.data.success) {
      logTest('Test Endpoint', 'PASS', testResult.data.message);
      updateResults(true);
    } else {
      logTest('Test Endpoint', 'FAIL', testResult.error);
      updateResults(false);
    }

    // Test 2: General image upload (without file - should fail)
    log('\nTest 2: Testing /api/upload/image without file', colors.bold);
    const noFileResult = await testEndpoint(`${BASE_URL}/image`, 'POST', null, 400);
    if (!noFileResult.success && noFileResult.error?.error === 'No image file provided') {
      logTest('Image Upload (No File)', 'PASS', 'Correctly rejected request without file');
      updateResults(true);
    } else {
      logTest('Image Upload (No File)', 'FAIL', noFileResult.error);
      updateResults(false);
    }

    // Test 3: General image upload (with file)
    log('\nTest 3: Testing /api/upload/image with file', colors.bold);
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));

    const uploadResult = await testEndpoint(`${BASE_URL}/image`, 'POST', formData);
    if (uploadResult.success && uploadResult.data.success) {
      logTest('Image Upload (With File)', 'PASS', `Uploaded: ${uploadResult.data.data?.filename}`);
      uploadedImageFilename = uploadResult.data.data?.filename;
      updateResults(true);
    } else {
      logTest('Image Upload (With File)', 'FAIL', uploadResult.error);
      updateResults(false);
    }

    // Test 4: Category image upload (without file - should fail)
    log('\nTest 4: Testing /api/upload/category/1/image without file', colors.bold);
    const categoryNoFileResult = await testEndpoint(`${BASE_URL}/category/1/image`, 'POST', null, 400);
    if (!categoryNoFileResult.success && categoryNoFileResult.error?.error === 'No image file provided') {
      logTest('Category Image Upload (No File)', 'PASS', 'Correctly rejected request without file');
      updateResults(true);
    } else {
      logTest('Category Image Upload (No File)', 'FAIL', categoryNoFileResult.error);
      updateResults(false);
    }

    // Test 5: Category image upload (with file)
    log('\nTest 5: Testing /api/upload/category/1/image with file', colors.bold);
    const categoryFormData = new FormData();
    categoryFormData.append('image', fs.createReadStream(testImagePath));

    const categoryUploadResult = await testEndpoint(`${BASE_URL}/category/1/image`, 'POST', categoryFormData);
    if (categoryUploadResult.success && categoryUploadResult.data.success) {
      logTest('Category Image Upload (With File)', 'PASS', `Uploaded: ${categoryUploadResult.data.data?.filename}`);
      updateResults(true);
    } else {
      logTest('Category Image Upload (With File)', 'FAIL', categoryUploadResult.error);
      updateResults(false);
    }

    // Test 6: Subcategory image upload (without file - should fail)
    log('\nTest 6: Testing /api/upload/subcategory/1/image without file', colors.bold);
    const subcategoryNoFileResult = await testEndpoint(`${BASE_URL}/subcategory/1/image`, 'POST', null, 400);
    if (!subcategoryNoFileResult.success && subcategoryNoFileResult.error?.error === 'No image file provided') {
      logTest('Subcategory Image Upload (No File)', 'PASS', 'Correctly rejected request without file');
      updateResults(true);
    } else {
      logTest('Subcategory Image Upload (No File)', 'FAIL', subcategoryNoFileResult.error);
      updateResults(false);
    }

    // Test 7: Subcategory image upload (with file)
    log('\nTest 7: Testing /api/upload/subcategory/1/image with file', colors.bold);
    const subcategoryFormData = new FormData();
    subcategoryFormData.append('image', fs.createReadStream(testImagePath));

    const subcategoryUploadResult = await testEndpoint(`${BASE_URL}/subcategory/1/image`, 'POST', subcategoryFormData);
    if (subcategoryUploadResult.success && subcategoryUploadResult.data.success) {
      logTest('Subcategory Image Upload (With File)', 'PASS', `Uploaded: ${subcategoryUploadResult.data.data?.filename}`);
      updateResults(true);
    } else {
      logTest('Subcategory Image Upload (With File)', 'FAIL', subcategoryUploadResult.error);
      updateResults(false);
    }

    // Test 8: Image metadata (if we have an uploaded image)
    if (uploadedImageFilename) {
      log('\nTest 8: Testing image metadata retrieval', colors.bold);
      const metadataResult = await testEndpoint(`${BASE_URL}/image/${uploadedImageFilename}/metadata`);
      if (metadataResult.success && metadataResult.data.success) {
        logTest('Image Metadata', 'PASS', 'Retrieved metadata successfully');
        updateResults(true);
      } else {
        logTest('Image Metadata', 'FAIL', metadataResult.error);
        updateResults(false);
      }

      // Test 9: Image deletion
      log('\nTest 9: Testing image deletion', colors.bold);
      const deleteResult = await testEndpoint(`${BASE_URL}/image/${uploadedImageFilename}`, 'DELETE');
      if (deleteResult.success && deleteResult.data.success) {
        logTest('Image Deletion', 'PASS', 'Image deleted successfully');
        updateResults(true);
      } else {
        logTest('Image Deletion', 'FAIL', deleteResult.error);
        updateResults(false);
      }
    } else {
      log('\nTest 8 & 9: Skipping metadata and deletion tests (no uploaded image)', colors.yellow);
      testResults.total += 2; // Count as failed since we couldn't test
      testResults.failed += 2;
    }

    // Test 10: Invalid endpoint
    log('\nTest 10: Testing invalid endpoint (should return 404)', colors.bold);
    const invalidResult = await testEndpoint(`${BASE_URL}/nonexistent`, 'GET', null, 404);
    if (!invalidResult.success && invalidResult.status === 404) {
      logTest('Invalid Endpoint', 'PASS', 'Correctly returned 404');
      updateResults(true);
    } else {
      logTest('Invalid Endpoint', 'FAIL', `Expected 404, got ${invalidResult.status}`);
      updateResults(false);
    }

  } catch (error) {
    log(`\n❌ Test suite failed with error: ${error.message}`, colors.red);
  } finally {
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      log(`\n🧹 Cleaned up test image: ${testImagePath}`, colors.blue);
    }
  }

  // Print summary
  log('\n📊 Test Results Summary:', colors.bold);
  log(`Total Tests: ${testResults.total}`, colors.blue);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? colors.red : colors.green);

  if (testResults.failed === 0) {
    log('\n🎉 All tests passed! Upload routes are working correctly.', colors.green);
  } else {
    log(`\n⚠️  ${testResults.failed} test(s) failed. Please check the server configuration.`, colors.red);
  }

  log('\n🏁 Test suite completed.\n', colors.bold);
}

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    log(`\n💥 Fatal error: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { runTests };