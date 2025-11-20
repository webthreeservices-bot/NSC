#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Script
 * Tests all critical API endpoints to ensure they work correctly
 */

const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Make HTTP request
 */
async function makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
  const url = new URL(endpoint, BASE_URL);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test endpoint and report result
 */
async function testEndpoint(name, endpoint, expectedStatus = 200, method = 'GET', data = null, headers = {}) {
  try {
    const response = await makeRequest(endpoint, method, data, headers);
    const success = response.status === expectedStatus;

    if (success) {
      console.log(`${colors.green}✓${colors.reset} ${name} - ${colors.cyan}${endpoint}${colors.reset} (${response.status})`);
      return { success: true, endpoint, response };
    } else {
      console.log(`${colors.red}✗${colors.reset} ${name} - ${colors.cyan}${endpoint}${colors.reset} (Expected: ${expectedStatus}, Got: ${response.status})`);
      console.log(`  ${colors.yellow}Response:${colors.reset}`, JSON.stringify(response.data).substring(0, 200));
      return { success: false, endpoint, response };
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name} - ${colors.cyan}${endpoint}${colors.reset}`);
    console.log(`  ${colors.red}Error:${colors.reset} ${error.message}`);
    return { success: false, endpoint, error: error.message };
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`\n${colors.blue}================================================${colors.reset}`);
  console.log(`${colors.blue}API Endpoint Testing - ${BASE_URL}${colors.reset}`);
  console.log(`${colors.blue}================================================${colors.reset}\n`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    categories: {}
  };

  // Helper to run category tests
  async function testCategory(category, tests) {
    console.log(`\n${colors.cyan}━━━ ${category} ━━━${colors.reset}\n`);
    results.categories[category] = { total: 0, passed: 0, failed: 0 };

    for (const test of tests) {
      const result = await testEndpoint(
        test.name,
        test.endpoint,
        test.expectedStatus || 200,
        test.method || 'GET',
        test.data || null,
        test.headers || {}
      );

      results.total++;
      results.categories[category].total++;

      if (result.success) {
        results.passed++;
        results.categories[category].passed++;
      } else {
        results.failed++;
        results.categories[category].failed++;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 1. Health & System Endpoints
  await testCategory('Health & System', [
    { name: 'Health Check', endpoint: '/api/health' },
    { name: 'CSRF Token', endpoint: '/api/auth/csrf-token' }
  ]);

  // 2. Public Authentication Endpoints (should work without auth)
  await testCategory('Public Auth Endpoints', [
    { name: 'Register (no data)', endpoint: '/api/auth/register', method: 'POST', expectedStatus: 400 },
    { name: 'Login (no data)', endpoint: '/api/auth/login', method: 'POST', expectedStatus: 400 },
    { name: 'Forgot Password (no data)', endpoint: '/api/auth/forgot-password', method: 'POST', expectedStatus: 400 }
  ]);

  // 3. Protected User Endpoints (should return 401 without auth)
  await testCategory('Protected User Endpoints', [
    { name: 'User Profile', endpoint: '/api/user/profile', expectedStatus: 401 },
    { name: 'User Referrals', endpoint: '/api/user/referrals', expectedStatus: 401 },
    { name: 'User KYC Status', endpoint: '/api/user/kyc', expectedStatus: 401 }
  ]);

  // 4. Package Endpoints
  await testCategory('Package Endpoints', [
    { name: 'List Package Types', endpoint: '/api/admin/package-types', expectedStatus: 401 },
    { name: 'My Packages', endpoint: '/api/packages/my-packages', expectedStatus: 401 },
    { name: 'Package Stats', endpoint: '/api/packages/stats', expectedStatus: 401 }
  ]);

  // 5. Transaction Endpoints
  await testCategory('Transaction Endpoints', [
    { name: 'Transaction History', endpoint: '/api/transactions/history', expectedStatus: 401 },
    { name: 'Transactions', endpoint: '/api/transactions', expectedStatus: 401 }
  ]);

  // 6. Earnings & Referral Endpoints
  await testCategory('Earnings & Referrals', [
    { name: 'Earnings Summary', endpoint: '/api/earnings/summary', expectedStatus: 401 },
    { name: 'Earnings History', endpoint: '/api/earnings/history', expectedStatus: 401 },
    { name: 'Referral Stats', endpoint: '/api/referrals/stats', expectedStatus: 401 },
    { name: 'Direct Referrals', endpoint: '/api/referrals/direct', expectedStatus: 401 }
  ]);

  // 7. Withdrawal Endpoints
  await testCategory('Withdrawal Endpoints', [
    { name: 'Withdrawal History', endpoint: '/api/withdrawals/history', expectedStatus: 401 },
    { name: 'Check Eligibility', endpoint: '/api/withdrawals/check-eligibility', expectedStatus: 401 }
  ]);

  // 8. Payment Endpoints
  await testCategory('Payment Endpoints', [
    { name: 'My Payment Requests', endpoint: '/api/payments/my-requests', expectedStatus: 401 }
  ]);

  // 9. Bot Endpoints
  await testCategory('Bot Endpoints', [
    { name: 'My Bots', endpoint: '/api/bots/my-bots', expectedStatus: 401 },
    { name: 'Check Eligibility', endpoint: '/api/bots/check-eligibility', expectedStatus: 401 }
  ]);

  // 10. Admin Endpoints (should return 401 without admin auth)
  await testCategory('Admin Endpoints', [
    { name: 'Admin Stats', endpoint: '/api/admin/stats', expectedStatus: 401 },
    { name: 'Admin Users', endpoint: '/api/admin/users', expectedStatus: 401 },
    { name: 'Admin Withdrawals', endpoint: '/api/admin/withdrawals', expectedStatus: 401 },
    { name: 'Admin Packages', endpoint: '/api/admin/packages', expectedStatus: 401 },
    { name: 'Financial Stats', endpoint: '/api/admin/financial-stats', expectedStatus: 401 }
  ]);

  // Print Summary
  console.log(`\n${colors.blue}================================================${colors.reset}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.blue}================================================${colors.reset}\n`);

  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

  // Category breakdown
  console.log(`${colors.cyan}Category Breakdown:${colors.reset}\n`);
  for (const [category, stats] of Object.entries(results.categories)) {
    const rate = ((stats.passed / stats.total) * 100).toFixed(0);
    const status = stats.failed === 0 ? colors.green : colors.yellow;
    console.log(`  ${status}${category}${colors.reset}: ${stats.passed}/${stats.total} (${rate}%)`);
  }

  console.log('\n');

  // Return exit code based on results
  return results.failed === 0 ? 0 : 1;
}

// Run tests if server is available
async function checkServerAvailability() {
  try {
    console.log(`${colors.yellow}Checking if server is running at ${BASE_URL}...${colors.reset}`);
    await makeRequest('/api/health');
    console.log(`${colors.green}✓ Server is running${colors.reset}\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Server is not running${colors.reset}`);
    console.log(`${colors.yellow}Please start the server with: npm run dev${colors.reset}\n`);
    return false;
  }
}

// Main execution
(async () => {
  const isServerRunning = await checkServerAvailability();

  if (!isServerRunning) {
    console.log(`${colors.yellow}Skipping tests - server not available${colors.reset}\n`);
    process.exit(1);
  }

  const exitCode = await runTests();
  process.exit(exitCode);
})();
