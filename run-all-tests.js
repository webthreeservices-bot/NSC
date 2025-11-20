#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Orchestrates all test suites for the NSC Bot Platform
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test configuration
const testSuites = [
  {
    name: 'Unit Tests',
    command: 'npm',
    args: ['test', '--', '--testPathPattern=tests/unit'],
    critical: true,
  },
  {
    name: 'Integration Tests',
    command: 'npm',
    args: ['test', '--', '--testPathPattern=tests/integration'],
    critical: true,
  },
  {
    name: 'E2E Tests - User Journey',
    command: 'npx',
    args: ['playwright', 'test', 'tests/e2e/user-journey.spec.ts'],
    critical: true,
  },
  {
    name: 'E2E Tests - Admin Panel',
    command: 'npx',
    args: ['playwright', 'test', 'tests/e2e/admin-panel.spec.ts'],
    critical: true,
  },
  {
    name: 'API Integration Tests',
    command: 'npx',
    args: ['playwright', 'test', 'tests/integration/api.spec.ts'],
    critical: true,
  },
];

// Test results
const results = {
  passed: [],
  failed: [],
  skipped: [],
  startTime: Date.now(),
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(80));
  log(message, colors.bright + colors.cyan);
  console.log('='.repeat(80) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

// Run a single test suite
function runTestSuite(suite) {
  return new Promise((resolve) => {
    logInfo(`Running: ${suite.name}`);
    
    const startTime = Date.now();
    const process = spawn(suite.command, suite.args, {
      stdio: 'inherit',
      shell: true,
    });

    process.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (code === 0) {
        logSuccess(`${suite.name} passed (${duration}s)`);
        results.passed.push({ name: suite.name, duration });
        resolve({ success: true, suite });
      } else {
        logError(`${suite.name} failed (${duration}s)`);
        results.failed.push({ name: suite.name, duration, code });
        resolve({ success: false, suite });
      }
    });

    process.on('error', (error) => {
      logError(`Error running ${suite.name}: ${error.message}`);
      results.failed.push({ name: suite.name, error: error.message });
      resolve({ success: false, suite });
    });
  });
}

// Run all test suites
async function runAllTests() {
  logHeader('NSC Bot Platform - Comprehensive Test Suite');
  
  logInfo('Starting test execution...\n');

  for (const suite of testSuites) {
    const result = await runTestSuite(suite);
    
    // If critical test fails, optionally stop execution
    if (!result.success && suite.critical && process.env.FAIL_FAST === 'true') {
      logWarning('Critical test failed. Stopping execution (FAIL_FAST=true)');
      break;
    }
  }

  // Generate summary
  generateSummary();
}

// Generate test summary
function generateSummary() {
  const totalDuration = ((Date.now() - results.startTime) / 1000).toFixed(2);
  
  logHeader('Test Summary');

  // Passed tests
  if (results.passed.length > 0) {
    logSuccess(`\nPassed Tests (${results.passed.length}):`);
    results.passed.forEach(test => {
      console.log(`  ✓ ${test.name} (${test.duration}s)`);
    });
  }

  // Failed tests
  if (results.failed.length > 0) {
    logError(`\nFailed Tests (${results.failed.length}):`);
    results.failed.forEach(test => {
      console.log(`  ✗ ${test.name} (${test.duration || 'N/A'}s)`);
      if (test.code) console.log(`    Exit code: ${test.code}`);
      if (test.error) console.log(`    Error: ${test.error}`);
    });
  }

  // Overall statistics
  console.log('\n' + '-'.repeat(80));
  logInfo(`Total Tests: ${testSuites.length}`);
  logSuccess(`Passed: ${results.passed.length}`);
  logError(`Failed: ${results.failed.length}`);
  logInfo(`Total Duration: ${totalDuration}s`);
  console.log('-'.repeat(80) + '\n');

  // Coverage information
  if (fs.existsSync(path.join(__dirname, 'coverage'))) {
    logInfo('Coverage report available at: coverage/index.html');
  }

  // Playwright report
  if (fs.existsSync(path.join(__dirname, 'playwright-report'))) {
    logInfo('Playwright report available at: playwright-report/index.html');
  }

  // Exit with appropriate code
  const exitCode = results.failed.length > 0 ? 1 : 0;
  
  if (exitCode === 0) {
    logSuccess('\n🎉 All tests passed!');
  } else {
    logError('\n❌ Some tests failed. Please review the errors above.');
  }

  // Save results to file
  saveResults();

  process.exit(exitCode);
}

// Save results to JSON file
function saveResults() {
  const resultsFile = path.join(__dirname, 'test-results', 'summary.json');
  const resultsDir = path.dirname(resultsFile);

  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: testSuites.length,
    passed: results.passed.length,
    failed: results.failed.length,
    duration: ((Date.now() - results.startTime) / 1000).toFixed(2),
    details: {
      passed: results.passed,
      failed: results.failed,
    },
  };

  fs.writeFileSync(resultsFile, JSON.stringify(summary, null, 2));
  logInfo(`\nTest results saved to: ${resultsFile}`);
}

// Handle process termination
process.on('SIGINT', () => {
  logWarning('\n\nTest execution interrupted by user');
  generateSummary();
});

process.on('SIGTERM', () => {
  logWarning('\n\nTest execution terminated');
  generateSummary();
});

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  failFast: args.includes('--fail-fast'),
  verbose: args.includes('--verbose'),
  coverage: args.includes('--coverage'),
};

if (options.failFast) {
  process.env.FAIL_FAST = 'true';
}

if (options.coverage) {
  // Add coverage flags to jest tests
  testSuites.forEach(suite => {
    if (suite.command === 'npm' && suite.args[0] === 'test') {
      suite.args.push('--coverage');
    }
  });
}

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
NSC Bot Platform - Test Runner

Usage: node run-all-tests.js [options]

Options:
  --fail-fast    Stop execution on first critical test failure
  --verbose      Show detailed output
  --coverage     Generate coverage reports
  --help, -h     Show this help message

Examples:
  node run-all-tests.js
  node run-all-tests.js --fail-fast
  node run-all-tests.js --coverage
  `);
  process.exit(0);
}

// Start test execution
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
