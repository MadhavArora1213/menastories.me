const { validateCategory } = require('./middleware/validators');
const { validationResult } = require('express-validator');

// Mock request object
const createMockReq = (body) => ({
  body
});

// Mock response object
const createMockRes = () => ({
  status: () => ({}),
  json: () => ({})
});

// Test cases
const testCases = [
  {
    name: 'Valid category with empty parentId',
    body: {
      name: 'Test Category',
      description: 'Test description',
      design: 'design1',
      status: 'active',
      parentId: ''
    },
    expectedValid: true
  },
  {
    name: 'Valid category with null parentId',
    body: {
      name: 'Test Category',
      description: 'Test description',
      design: 'design1',
      status: 'active',
      parentId: null
    },
    expectedValid: true
  },
  {
    name: 'Valid category without parentId',
    body: {
      name: 'Test Category',
      description: 'Test description',
      design: 'design1',
      status: 'active'
    },
    expectedValid: true
  },
  {
    name: 'Valid category with valid UUID parentId',
    body: {
      name: 'Test Category',
      description: 'Test description',
      design: 'design1',
      status: 'active',
      parentId: '550e8400-e29b-41d4-a716-446655440000'
    },
    expectedValid: true
  },
  {
    name: 'Invalid category with invalid parentId',
    body: {
      name: 'Test Category',
      description: 'Test description',
      design: 'design1',
      status: 'active',
      parentId: 'invalid-uuid'
    },
    expectedValid: false
  }
];

async function runValidationTests() {
  console.log('🧪 Testing Category Validation...\n');

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);

    const req = createMockReq(testCase.body);
    const res = createMockRes();

    // Run all validation middlewares
    for (const validator of validateCategory) {
      await validator(req, res, () => {});
    }

    const errors = validationResult(req);
    const isValid = errors.isEmpty();

    if (isValid === testCase.expectedValid) {
      console.log(`✅ PASS`);
    } else {
      console.log(`❌ FAIL - Expected ${testCase.expectedValid ? 'valid' : 'invalid'}, got ${isValid ? 'valid' : 'invalid'}`);
      if (!isValid) {
        console.log('   Errors:', errors.array());
      }
    }
    console.log('');
  }

  console.log('🎉 Validation tests completed!');
}

// Run tests
runValidationTests().catch(console.error);