# Testing Quick Reference Guide

## 🚀 Quick Commands

### Run All Tests
```bash
node run-all-tests.js                    # Run complete test suite
node run-all-tests.js --coverage         # With coverage reports
node run-all-tests.js --fail-fast        # Stop on first failure
```

### Unit Tests
```bash
npm test                                  # Run all unit tests
npm run test:watch                        # Watch mode
npm test -- tests/unit/auth.test.ts      # Specific file
npm test -- --coverage                    # With coverage
```

### Integration Tests
```bash
npm test -- --testPathPattern=integration
npm test -- tests/integration/api.spec.ts
```

### E2E Tests
```bash
npm run test:e2e                         # All E2E tests
npm run test:e2e:headed                  # See browser
npm run test:auth                        # Auth tests only
npm run test:dashboard                   # Dashboard tests
npm run test:admin                       # Admin tests
npm run test:api                         # API tests
npm run test:debug                       # Debug mode
```

### Quick Tests
```bash
npm run test:smoke                       # Critical paths only
npm run test:quick:auth                  # Quick auth check
npm run test:quick:dashboard             # Quick dashboard check
npm run test:quick:admin                 # Quick admin check
```

## 📊 View Reports

```bash
npm run test:report                      # Playwright HTML report
open coverage/lcov-report/index.html     # Coverage report
cat test-results/summary.json            # Test summary
```

## 🔍 Test File Locations

```
tests/
├── unit/
│   ├── auth.test.ts              # Authentication tests
│   ├── database.test.ts          # Database tests
│   ├── payment.test.ts           # Payment tests
│   └── utilities.test.ts         # Utility tests
├── integration/
│   └── api.spec.ts               # API integration tests
└── e2e/
    ├── user-journey.spec.ts      # User flow tests
    ├── admin-panel.spec.ts       # Admin tests
    └── performance-security.spec.ts  # Performance & security
```

## 🎯 Common Test Patterns

### Unit Test
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

### API Test
```typescript
import { test, expect } from '@playwright/test';

test('API endpoint', async ({ request }) => {
  const response = await request.get('/api/endpoint');
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data.field).toBeDefined();
});
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test';

test('user flow', async ({ page }) => {
  await page.goto('/page');
  await page.fill('input[name="field"]', 'value');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/success/);
});
```

## 🐛 Debugging

```bash
# Jest debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright debug
npm run test:debug

# Playwright UI mode
npx playwright test --ui

# Verbose output
npm test -- --verbose
npm run test:e2e -- --reporter=list
```

## ⚡ Performance Tips

1. **Run tests in parallel** (default for E2E)
2. **Use test.describe.parallel** for independent tests
3. **Mock external services** in unit tests
4. **Use fixtures** for test data
5. **Clean up after tests** to prevent interference

## 🔒 Security Test Checklist

- [ ] XSS prevention
- [ ] CSRF protection
- [ ] SQL injection prevention
- [ ] Authentication security
- [ ] Authorization checks
- [ ] Input validation
- [ ] Sensitive data protection
- [ ] Rate limiting

## 📈 Coverage Goals

| Type | Goal | Current |
|------|------|---------|
| Overall | 75%+ | TBD |
| Unit | 80%+ | TBD |
| Integration | 70%+ | TBD |
| E2E Critical | 100% | TBD |

## 🚨 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL
pg_isready

# Start PostgreSQL
sudo service postgresql start
```

### Browser Not Found
```bash
npx playwright install
npx playwright install-deps
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Timeout Errors
```typescript
// Increase timeout
test('slow test', async () => {
  // test code
}, 60000); // 60 seconds
```

## 📝 Test Writing Checklist

- [ ] Clear, descriptive test name
- [ ] Follows Arrange-Act-Assert pattern
- [ ] Independent from other tests
- [ ] Tests one thing
- [ ] Includes edge cases
- [ ] Has proper assertions
- [ ] Cleans up resources
- [ ] Uses appropriate mocks

## 🔄 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: node run-all-tests.js --coverage
      - uses: codecov/codecov-action@v3
```

## 📚 Documentation

- **Full Guide**: TESTING_DOCUMENTATION.md
- **Strategy**: TESTING_STRATEGY.md
- **Summary**: TESTING_IMPLEMENTATION_SUMMARY.md

## 🎓 Best Practices

1. **Write tests first** (TDD when possible)
2. **Keep tests simple** and focused
3. **Use descriptive names** for clarity
4. **Mock external dependencies** appropriately
5. **Test edge cases** and error conditions
6. **Maintain test independence**
7. **Keep tests fast** (unit tests < 1s)
8. **Review test failures** immediately
9. **Update tests** with code changes
10. **Monitor coverage** trends

## 🆘 Need Help?

1. Check TESTING_DOCUMENTATION.md
2. Review existing test examples
3. Check troubleshooting section
4. Contact development team

---

**Last Updated**: 2025-11-20
**Version**: 1.0.0
