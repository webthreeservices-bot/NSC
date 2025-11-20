# Testing Documentation

## Overview

This document provides comprehensive information about testing the NSC Bot Platform, including setup, execution, and best practices.

## Table of Contents

1. [Test Structure](#test-structure)
2. [Setup](#setup)
3. [Running Tests](#running-tests)
4. [Test Types](#test-types)
5. [Writing Tests](#writing-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

## Test Structure

```
tests/
├── unit/                      # Unit tests
│   ├── auth.test.ts          # Authentication tests
│   ├── database.test.ts      # Database operation tests
│   ├── payment.test.ts       # Payment processing tests
│   └── ...
├── integration/               # Integration tests
│   ├── api.spec.ts           # API integration tests
│   └── calculateReferralEarnings.integration.spec.ts
├── e2e/                       # End-to-end tests
│   ├── user-journey.spec.ts  # User flow tests
│   └── admin-panel.spec.ts   # Admin panel tests
└── setup.ts                   # Test setup configuration
```

## Setup

### Prerequisites

- Node.js 18.17.0 or higher
- PostgreSQL database (for integration tests)
- All dependencies installed: `npm install`

### Environment Variables

Create a `.env.test` file for test environment:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/test_db

# Authentication
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=1h

# API
BASE_URL=http://localhost:3000

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=AdminPassword123!
```

### Database Setup

```bash
# Create test database
createdb test_db

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed:test
```

## Running Tests

### All Tests

```bash
# Run all test suites
node run-all-tests.js

# Run with coverage
node run-all-tests.js --coverage

# Run with fail-fast mode
node run-all-tests.js --fail-fast
```

### Unit Tests

```bash
# Run all unit tests
npm test

# Run specific unit test file
npm test -- tests/unit/auth.test.ts

# Run in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Run all integration tests
npm test -- --testPathPattern=tests/integration

# Run specific integration test
npm test -- tests/integration/api.spec.ts
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific E2E test
npm run test:e2e -- user-journey.spec.ts

# Run with specific browser
npm run test:e2e -- --project=chromium

# Debug mode
npm run test:debug
```

### Specific Test Suites

```bash
# Authentication tests
npm run test:auth

# Dashboard tests
npm run test:dashboard

# Admin panel tests
npm run test:admin

# API tests
npm run test:api

# Mobile tests
npm run test:mobile

# Performance tests
npm run test:performance
```

### Quick Tests

```bash
# Quick smoke tests
npm run test:smoke

# Quick test with specific focus
npm run test:quick:auth
npm run test:quick:dashboard
npm run test:quick:admin
npm run test:quick:api
```

## Test Types

### 1. Unit Tests (Jest)

**Purpose**: Test individual functions and modules in isolation

**Location**: `tests/unit/`

**Example**:
```typescript
import { describe, it, expect } from '@jest/globals';

describe('Authentication', () => {
  it('should hash password correctly', async () => {
    const password = 'TestPassword123!';
    const hashed = await hashPassword(password);
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(password);
  });
});
```

**Coverage Goals**: 80%+ for critical functions

### 2. Integration Tests (Jest + Playwright)

**Purpose**: Test interactions between different modules and external services

**Location**: `tests/integration/`

**Example**:
```typescript
import { test, expect } from '@playwright/test';

test('should create payment via API', async ({ request }) => {
  const response = await request.post('/api/payments/create', {
    headers: { Authorization: `Bearer ${token}` },
    data: { packageId: 'pkg-001', currency: 'USDT' },
  });
  
  expect(response.status()).toBe(201);
});
```

**Coverage Goals**: 70%+ for API endpoints

### 3. End-to-End Tests (Playwright)

**Purpose**: Test complete user workflows from UI

**Location**: `tests/e2e/`

**Example**:
```typescript
import { test, expect } from '@playwright/test';

test('complete registration flow', async ({ page }) => {
  await page.goto('/auth/register');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/\/dashboard/);
});
```

**Coverage Goals**: 100% for critical user paths

## Writing Tests

### Best Practices

1. **Descriptive Names**: Use clear, descriptive test names
   ```typescript
   // Good
   test('should reject invalid email format during registration')
   
   // Bad
   test('email test')
   ```

2. **Arrange-Act-Assert Pattern**:
   ```typescript
   test('should calculate total with fee', () => {
     // Arrange
     const amount = 100;
     const fee = 2.5;
     
     // Act
     const total = calculateTotal(amount, fee);
     
     // Assert
     expect(total).toBe(102.5);
   });
   ```

3. **Independent Tests**: Each test should be independent
   ```typescript
   // Use beforeEach for setup
   beforeEach(async () => {
     await cleanDatabase();
     await seedTestData();
   });
   ```

4. **Mock External Dependencies**:
   ```typescript
   jest.mock('nodemailer');
   jest.mock('./lib/blockchain');
   ```

5. **Test Edge Cases**:
   ```typescript
   test('should handle empty input', () => {
     expect(processData('')).toThrow();
   });
   
   test('should handle null input', () => {
     expect(processData(null)).toThrow();
   });
   ```

### Test Data Management

**Use Factories**:
```typescript
function createTestUser(overrides = {}) {
  return {
    email: 'test@example.com',
    password: 'TestPassword123!',
    username: 'testuser',
    ...overrides,
  };
}

// Usage
const user = createTestUser({ email: 'custom@example.com' });
```

**Use Fixtures**:
```typescript
// tests/fixtures/users.ts
export const testUsers = {
  regular: {
    email: 'user@example.com',
    password: 'UserPassword123!',
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
  },
};
```

### Async Testing

```typescript
// Using async/await
test('should fetch user data', async () => {
  const user = await fetchUser('user-123');
  expect(user.email).toBe('test@example.com');
});

// Using promises
test('should create user', () => {
  return createUser(userData).then(user => {
    expect(user.id).toBeDefined();
  });
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm run test:e2e"
    }
  }
}
```

## Test Reports

### Jest Coverage Report

```bash
npm test -- --coverage
```

View at: `coverage/lcov-report/index.html`

### Playwright HTML Report

```bash
npm run test:report
```

View at: `playwright-report/index.html`

### Test Summary

After running all tests:
```bash
node run-all-tests.js
```

View summary at: `test-results/summary.json`

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem**: Tests fail with "Connection refused"

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
sudo service postgresql start

# Verify connection string in .env.test
```

#### 2. Playwright Browser Issues

**Problem**: "Browser not found"

**Solution**:
```bash
# Install Playwright browsers
npx playwright install

# Install system dependencies
npx playwright install-deps
```

#### 3. Port Already in Use

**Problem**: "Port 3000 is already in use"

**Solution**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
BASE_URL=http://localhost:3001 npm run test:e2e
```

#### 4. Timeout Errors

**Problem**: Tests timeout

**Solution**:
```typescript
// Increase timeout for specific test
test('slow operation', async () => {
  // test code
}, 60000); // 60 seconds

// Or globally in playwright.config.ts
timeout: 60 * 1000
```

#### 5. Flaky Tests

**Problem**: Tests pass/fail randomly

**Solution**:
- Add proper waits: `await page.waitForSelector()`
- Use retry logic: `retries: 2` in config
- Ensure test isolation
- Check for race conditions

### Debug Mode

```bash
# Jest debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright debug
npm run test:debug

# Playwright UI mode
npx playwright test --ui
```

### Verbose Output

```bash
# Jest verbose
npm test -- --verbose

# Playwright verbose
npm run test:e2e -- --reporter=list
```

## Performance Testing

### Lighthouse CI

```bash
# Run performance tests
npm run test:performance
```

### Load Testing

```bash
# Install k6
brew install k6  # macOS
choco install k6  # Windows

# Run load test
k6 run tests/load/api-load-test.js
```

## Accessibility Testing

```bash
# Run accessibility tests
npm run test:a11y

# Or with axe-core in E2E tests
await expect(page).toPassAxeTests();
```

## Security Testing

```bash
# Run security audit
npm audit

# Run OWASP dependency check
npm run security:check
```

## Continuous Testing

```bash
# Run tests continuously
npm run test:continuous

# Run with all browsers
npm run test:continuous:all

# Run in headed mode
npm run test:continuous:headed
```

## Test Metrics

### Key Metrics to Track

1. **Test Coverage**: Aim for 75%+ overall
2. **Test Execution Time**: Keep under 10 minutes
3. **Flaky Test Rate**: Keep under 5%
4. **Test Pass Rate**: Aim for 95%+

### Monitoring

```bash
# Generate test metrics
node scripts/test-metrics.js

# View historical trends
cat test-results/metrics-history.json
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test Automation Patterns](https://martinfowler.com/articles/practical-test-pyramid.html)

## Support

For issues or questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above
