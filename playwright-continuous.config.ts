import { defineConfig, devices } from '@playwright/test';

/**
 * Continuous Test Configuration for Fully Automated Testing
 * Runs all tests without stopping, provides comprehensive reporting
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000, // Reduced timeout for faster failure detection
  expect: {
    timeout: 10000, // Reduced expect timeout
  },
  
  // CRITICAL: Run tests sequentially to avoid conflicts
  fullyParallel: false,
  
  // Never fail on CI - continue running all tests
  forbidOnly: false,
  
  // IMPORTANT: No retries to avoid hanging on problematic tests
  retries: 0,
  
  // Single worker to ensure stability
  workers: 1,
  
  // Comprehensive reporting
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report-continuous',
      open: 'never' // Don't auto-open to avoid interruption
    }],
    ['line', { printSteps: true }],
    ['json', { outputFile: 'test-results/continuous-results.json' }],
    ['junit', { outputFile: 'test-results/continuous-junit.xml' }],
    ['./custom-reporter.js'] // Custom reporter for progress tracking
  ],
  
  outputDir: 'test-results/continuous',
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Capture everything for debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Optimized timeouts for API tests
    actionTimeout: 10000, // Reduced for faster failure detection
    navigationTimeout: 20000, // Reduced navigation timeout
    
    // Additional stability settings
    headless: true,
    ignoreHTTPSErrors: true,
    
    // Viewport for consistency
    viewport: { width: 1280, height: 720 },
  },

  // Test execution settings
  globalTimeout: 4 * 60 * 60 * 1000, // 4 hours max for all tests
  maxFailures: 0, // Don't stop on failures - run everything!
  
  projects: [
    // Setup project - runs first
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        actionTimeout: 30000,
        navigationTimeout: 60000,
      },
      timeout: 90 * 1000, // 90 seconds for setup
    },
    
    // Main test project - runs all tests
    {
      name: 'continuous-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      // Run all test files
      testMatch: [
        '**/auth.spec.ts',
        '**/dashboard.spec.ts', 
        '**/packages.spec.ts',
        '**/admin.spec.ts',
        '**/api.spec.ts',
        '**/mobile.spec.ts',
        '**/performance.spec.ts',
        '**/security.spec.ts',
        '**/integration.spec.ts',
        '**/business-logic-complete.spec.ts',
        '**/complete-admin.spec.ts',
        '**/complete-journey.spec.ts',
        '**/data-integrity.spec.ts',
        '**/security-complete.spec.ts',
        '**/ui-ux-complete.spec.ts',
        '**/browser-compatibility.spec.ts',
        '**/automated-suite.spec.ts',
        '**/test-suite-validation.spec.ts'
      ]
    },
    
    // Additional browser testing (optional)
    {
      name: 'continuous-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: ['**/auth.spec.ts', '**/dashboard.spec.ts'], // Core tests only
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Don't restart if already running
    timeout: 180 * 1000, // 3 minutes to start
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Global setup and teardown
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
});