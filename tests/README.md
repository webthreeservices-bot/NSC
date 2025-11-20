# Tests Directory

This directory contains all test files for the NSC Bot Platform.

## 📁 Structure

```
tests/
├── unit/                           # Unit tests (Jest)
│   ├── auth.test.ts               # Authentication logic (23 tests)
│   ├── database.test.ts           # Database operations (30+ tests)
│   ├── payment.test.ts            # Payment processing (25+ tests)
│   └── utilities.test.ts          # Utility functions (50+ tests)
│
├── integration/                    # Integration tests (Playwright)
│   ├── api.spec.ts                # API endpoint tests (50+ tests)
│   └── calculateReferralEarnings.integration.spec.ts
│
├── e2e/                           # End-to-end tests (Playwright)
│   ├── user-journey.spec.ts       # User flows (40+ tests)
│   ├── admin-panel.spec.ts        # Admin operations (50+ tests)
│   └── performance-security.spec.ts # Performance & security (40+ tests)
│
└── setup.ts                       # Test setup configuration
```

## 🚀 Quick Start

### Run All Tests
```bash
# From project root
node run-all-tests.js
```

### Run Unit Tests
```bash
npm test
npm run test:watch          # Watch mode
npm test -- --coverage      # With coverage
```

### Run E2E Tests
```bash
npm run test:e2e
npm run test:e2e:headed     # See browser
npm run test:debug          # Debug mode
```

### Run Specific Tests
```bash
npm test -- tests/unit/auth.test.ts
npm run test:auth
npm run test:dashboard
npm run test:admin
```

## 📊 Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Unit Tests | 128+ | ✅ |
| Integration Tests | 50+ | ✅ |
| E2E Tests | 115+ | ✅ |
| Performance Tests | 15+ | ✅ |
| Security Tests | 25+ | ✅ |
| **Total** | **333+** | ✅ |

## 📝 Test Files Overview

### Unit Tests

#### auth.test.ts
Tests authentication and security functions:
- Password hashing/verification
- JWT token management
- Session handling
- Validation (email, password)
- 2FA token generation
- Rate limiting

#### database.test.ts
Tests database operations:
- CRUD operations
- Transactions
- Connection pooling
- Error handling
- Pagination
- Complex queries

#### payment.test.ts
Tests payment processing:
- Payment validation
- Transaction creation
- Status updates
- Fee calculations
- Refunds
- Currency conversion

#### utilities.test.ts
Tests utility functions:
- Date/string/number utilities
- Array/object utilities
- Validation utilities
- Async utilities
- Pagination

### Integration Tests

#### api.spec.ts
Tests all API endpoints:
- Authentication API
- User API
- Bot API
- Payment API
- Admin API
- Error handling

### E2E Tests

#### user-journey.spec.ts
Tests complete user flows:
- Registration
- Login
- Dashboard
- Bot activation
- Payments
- Withdrawals

#### admin-panel.spec.ts
Tests admin operations:
- User management
- Transaction management
- Approvals
- Settings
- Reports

#### performance-security.spec.ts
Tests performance and security:
- Page load times
- API performance
- XSS prevention
- CSRF protection
- SQL injection prevention

## 🎯 Writing New Tests

### Unit Test Template
```typescript
import { describe, it, expect } from '@jest/globals';

describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test';

test('user flow', async ({ page }) => {
  await page.goto('/page');
  await page.fill('input[name="field"]', 'value');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/success/);
});
```

## 🔍 Best Practices

1. **Clear Names**: Use descriptive test names
2. **Independence**: Each test should be independent
3. **AAA Pattern**: Arrange-Act-Assert
4. **Edge Cases**: Test boundary conditions
5. **Cleanup**: Clean up after tests
6. **Fast**: Keep unit tests fast (< 1s)
7. **Focused**: Test one thing per test

## 📚 Documentation

- **Full Guide**: [TESTING_DOCUMENTATION.md](../TESTING_DOCUMENTATION.md)
- **Quick Reference**: [TESTING_QUICK_REFERENCE.md](../TESTING_QUICK_REFERENCE.md)
- **Strategy**: [TESTING_STRATEGY.md](../TESTING_STRATEGY.md)
- **Summary**: [TESTING_IMPLEMENTATION_SUMMARY.md](../TESTING_IMPLEMENTATION_SUMMARY.md)

## 🐛 Debugging

```bash
# Jest debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright debug
npm run test:debug

# Playwright UI
npx playwright test --ui
```

## 📈 Coverage Reports

```bash
# Generate coverage
npm test -- --coverage

# View report
open coverage/lcov-report/index.html
```

## 🔧 Configuration

- **Jest**: `jest.config.js`
- **Playwright**: `playwright.config.ts`
- **Setup**: `tests/setup.ts`

## ✅ Pre-commit Checklist

Before committing:
- [ ] All tests pass
- [ ] New features have tests
- [ ] Coverage meets goals
- [ ] No console errors
- [ ] Tests are independent

## 🆘 Need Help?

1. Check [TESTING_QUICK_REFERENCE.md](../TESTING_QUICK_REFERENCE.md)
2. Review existing test examples
3. See troubleshooting in [TESTING_DOCUMENTATION.md](../TESTING_DOCUMENTATION.md)
4. Contact development team

---

**Last Updated**: 2025-11-20
**Total Tests**: 333+
**Status**: ✅ Production Ready
