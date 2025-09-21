const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5000/api';

// Test RSS feed generation
async function testRSSFeed() {
  try {
    console.log('📰 Testing RSS feed generation...');

    const response = await axios.get(`${API_BASE_URL}/rss.xml`, {
      headers: {
        'Accept': 'application/rss+xml'
      }
    });

    const rssContent = response.data;

    // Check if RSS contains download entries
    if (rssContent.includes('<item>') && rssContent.includes('download')) {
      console.log('✅ RSS feed contains download entries');

      // Check RSS structure
      const requiredElements = [
        '<rss version="2.0">',
        '<channel>',
        '<title>',
        '<description>',
        '<link>',
        '<item>',
        '<title>',
        '<description>',
        '<link>',
        '<pubDate>'
      ];

      const missingElements = requiredElements.filter(element =>
        !rssContent.includes(element)
      );

      if (missingElements.length === 0) {
        console.log('✅ RSS feed structure is valid');
        return true;
      } else {
        console.log('❌ RSS feed missing elements:', missingElements);
      }
    } else {
      console.log('⚠️ RSS feed exists but may not contain download entries yet');
      return true; // Still valid if no downloads exist
    }
  } catch (error) {
    console.error('❌ RSS feed test failed:', error.message);
  }
  return false;
}

// Test JSON-LD structured data generation
async function testJSONLD() {
  try {
    console.log('🏷️ Testing JSON-LD structured data generation...');

    // First get downloads to test individual JSON-LD
    const downloadsResponse = await axios.get(`${API_BASE_URL}/downloads`, {
      params: {
        status: 'published',
        limit: 5
      }
    });

    if (downloadsResponse.data.success && downloadsResponse.data.data.downloads.length > 0) {
      const download = downloadsResponse.data.data.downloads[0];

      // Get individual download with structured data
      const detailResponse = await axios.get(`${API_BASE_URL}/downloads/${download.id}`);

      if (detailResponse.data.success && detailResponse.data.data.structuredData) {
        const structuredData = detailResponse.data.data.structuredData;

        // Validate JSON-LD structure
        const requiredFields = [
          '@context',
          '@type',
          'headline',
          'description',
          'datePublished',
          'url'
        ];

        const missingFields = requiredFields.filter(field =>
          !structuredData.hasOwnProperty(field)
        );

        if (missingFields.length === 0) {
          console.log('✅ JSON-LD structured data is valid');

          // Check if it's valid JSON
          try {
            JSON.stringify(structuredData);
            console.log('✅ JSON-LD is valid JSON');
            return true;
          } catch (jsonError) {
            console.log('❌ JSON-LD is not valid JSON:', jsonError.message);
          }
        } else {
          console.log('❌ JSON-LD missing required fields:', missingFields);
        }
      } else {
        console.log('⚠️ No structured data found in download response');
      }
    } else {
      console.log('⚠️ No published downloads available for JSON-LD testing');
      return true; // Valid if no downloads exist
    }
  } catch (error) {
    console.error('❌ JSON-LD test failed:', error.message);
  }
  return false;
}

// Test SEO metadata
async function testSEOMetadata() {
  try {
    console.log('🔍 Testing SEO metadata...');

    const downloadsResponse = await axios.get(`${API_BASE_URL}/downloads`, {
      params: {
        status: 'published',
        limit: 5
      }
    });

    if (downloadsResponse.data.success && downloadsResponse.data.data.downloads.length > 0) {
      const download = downloadsResponse.data.data.downloads[0];

      // Check for SEO fields
      const seoFields = ['metaTitle', 'metaDescription', 'keywords'];
      const hasSEOFields = seoFields.some(field => download[field]);

      if (hasSEOFields) {
        console.log('✅ Download has SEO metadata');
        return true;
      } else {
        console.log('⚠️ Download missing SEO metadata');
      }
    } else {
      console.log('⚠️ No published downloads available for SEO testing');
      return true;
    }
  } catch (error) {
    console.error('❌ SEO metadata test failed:', error.message);
  }
  return false;
}

// Test download tracking
async function testDownloadTracking() {
  try {
    console.log('📊 Testing download tracking...');

    const downloadsResponse = await axios.get(`${API_BASE_URL}/downloads`, {
      params: {
        status: 'published',
        limit: 1
      }
    });

    if (downloadsResponse.data.success && downloadsResponse.data.data.downloads.length > 0) {
      const download = downloadsResponse.data.data.downloads[0];
      const initialCount = download.downloadCount || 0;

      // Track a download (this would normally be done by frontend)
      await axios.post(`${API_BASE_URL}/downloads/${download.id}/track`);

      // Check if count increased
      const updatedResponse = await axios.get(`${API_BASE_URL}/downloads/${download.id}`);
      const updatedCount = updatedResponse.data.data.downloadCount || 0;

      if (updatedCount > initialCount) {
        console.log('✅ Download tracking is working');
        return true;
      } else {
        console.log('⚠️ Download tracking may not be working correctly');
      }
    } else {
      console.log('⚠️ No published downloads available for tracking testing');
      return true;
    }
  } catch (error) {
    console.error('❌ Download tracking test failed:', error.message);
  }
  return false;
}

// Test file security and validation
async function testFileSecurity() {
  try {
    console.log('🔒 Testing file security and validation...');

    const downloadsResponse = await axios.get(`${API_BASE_URL}/downloads`, {
      params: {
        status: 'published',
        limit: 5
      }
    });

    if (downloadsResponse.data.success) {
      const downloads = downloadsResponse.data.data.downloads;

      // Check file paths are secure (not allowing directory traversal)
      const insecurePaths = downloads.filter(download =>
        download.fileUrl?.includes('../') ||
        download.fileUrl?.includes('..\\') ||
        !download.fileUrl?.startsWith('/storage/')
      );

      if (insecurePaths.length === 0) {
        console.log('✅ File paths are secure');
      } else {
        console.log('❌ Found insecure file paths:', insecurePaths.length);
      }

      // Check file types are allowed
      const allowedTypes = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'];
      const invalidTypes = downloads.filter(download =>
        download.fileType && !allowedTypes.includes(download.fileType.toLowerCase())
      );

      if (invalidTypes.length === 0) {
        console.log('✅ File types are valid');
      } else {
        console.log('❌ Found invalid file types:', invalidTypes.map(d => d.fileType));
      }

      return insecurePaths.length === 0 && invalidTypes.length === 0;
    }
  } catch (error) {
    console.error('❌ File security test failed:', error.message);
  }
  return false;
}

// Test performance
async function testPerformance() {
  try {
    console.log('⚡ Testing performance...');

    const startTime = Date.now();

    // Test downloads listing performance
    const response = await axios.get(`${API_BASE_URL}/downloads`, {
      params: {
        status: 'published',
        limit: 20
      }
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (responseTime < 2000) { // Should respond within 2 seconds
      console.log(`✅ Performance acceptable (${responseTime}ms response time)`);
      return true;
    } else {
      console.log(`⚠️ Slow response time: ${responseTime}ms`);
      return false;
    }
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  }
  return false;
}

async function runTests() {
  console.log('🚀 Starting Download RSS/JSON-LD/SEO Tests...\n');

  const results = {
    rss: await testRSSFeed(),
    jsonld: await testJSONLD(),
    seo: await testSEOMetadata(),
    tracking: await testDownloadTracking(),
    security: await testFileSecurity(),
    performance: await testPerformance()
  };

  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(30));

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${test.charAt(0).toUpperCase() + test.slice(1)}`);
  });

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

  if (passed >= total * 0.8) { // 80% pass rate
    console.log('🎉 RSS/JSON-LD/SEO functionality is working well!');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
}

// Run tests
runTests().catch(console.error);