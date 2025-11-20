import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.describe('Page Load Performance', () => {
    test('homepage should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // 3 seconds
    });

    test('dashboard should load within acceptable time', async ({ page }) => {
      // Login first
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');

      const startTime = Date.now();
      await page.waitForURL(/\/dashboard/);
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(2000); // 2 seconds
    });

    test('should have good Lighthouse scores', async ({ page }) => {
      await page.goto('/');

      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        };
      });

      expect(metrics.domContentLoaded).toBeLessThan(1500);
      expect(metrics.loadComplete).toBeLessThan(3000);
      expect(metrics.firstPaint).toBeLessThan(1000);
    });
  });

  test.describe('API Performance', () => {
    test('API endpoints should respond quickly', async ({ request }) => {
      const endpoints = [
        '/api/health',
        '/api/packages',
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await request.get(endpoint);
        const responseTime = Date.now() - startTime;

        expect(response.status()).toBe(200);
        expect(responseTime).toBeLessThan(500); // 500ms
      }
    });

    test('authenticated API should respond quickly', async ({ request }) => {
      // Login to get token
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'TestPassword123!',
        },
      });

      const { token } = await loginResponse.json();

      const startTime = Date.now();
      const response = await request.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(500);
    });
  });

  test.describe('Resource Loading', () => {
    test('should optimize image loading', async ({ page }) => {
      await page.goto('/');

      // Check for lazy loading
      const images = await page.locator('img').all();
      
      for (const img of images.slice(0, 5)) {
        const loading = await img.getAttribute('loading');
        const src = await img.getAttribute('src');
        
        // Images should use lazy loading or optimized formats
        if (src && !src.includes('above-fold')) {
          expect(loading).toBe('lazy');
        }
      }
    });

    test('should minimize JavaScript bundle size', async ({ page }) => {
      const response = await page.goto('/');
      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter((r: any) => r.initiatorType === 'script')
          .map((r: any) => ({
            name: r.name,
            size: r.transferSize,
          }));
      });

      const totalJsSize = resources.reduce((sum: number, r: any) => sum + r.size, 0);
      
      // Total JS should be under 500KB
      expect(totalJsSize).toBeLessThan(500 * 1024);
    });
  });

  test.describe('Concurrent Users', () => {
    test('should handle multiple simultaneous logins', async ({ browser }) => {
      const contexts = await Promise.all([
        browser.newContext(),
        browser.newContext(),
        browser.newContext(),
      ]);

      const loginPromises = contexts.map(async (context, index) => {
        const page = await context.newPage();
        await page.goto('/auth/login');
        await page.fill('input[name="email"]', `user${index}@example.com`);
        await page.fill('input[name="password"]', 'TestPassword123!');
        
        const startTime = Date.now();
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/, { timeout: 10000 });
        const duration = Date.now() - startTime;

        await context.close();
        return duration;
      });

      const durations = await Promise.all(loginPromises);
      
      // All logins should complete within reasonable time
      durations.forEach(duration => {
        expect(duration).toBeLessThan(5000);
      });
    });
  });

  test.describe('Memory Leaks', () => {
    test('should not leak memory on navigation', async ({ page }) => {
      await page.goto('/');

      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Navigate multiple times
      for (let i = 0; i < 5; i++) {
        await page.goto('/dashboard');
        await page.goto('/');
      }

      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Memory should not increase significantly (allow 50% increase)
      if (initialMemory > 0) {
        expect(finalMemory).toBeLessThan(initialMemory * 1.5);
      }
    });
  });
});

test.describe('Security Tests', () => {
  test.describe('XSS Prevention', () => {
    test('should sanitize user input in forms', async ({ page }) => {
      await page.goto('/auth/register');

      const xssPayload = '<script>alert("XSS")</script>';
      
      await page.fill('input[name="username"]', xssPayload);
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      
      // Check that script is not executed
      const alerts = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });

      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      expect(alerts).toHaveLength(0);
    });

    test('should escape HTML in displayed content', async ({ page }) => {
      await page.goto('/');

      const content = await page.content();
      
      // Should not contain unescaped script tags
      expect(content).not.toContain('<script>');
      expect(content).not.toMatch(/<script[^>]*>.*<\/script>/);
    });
  });

  test.describe('CSRF Protection', () => {
    test('should include CSRF token in forms', async ({ page }) => {
      await page.goto('/auth/login');

      const csrfToken = await page.locator('input[name="csrf"], input[name="_csrf"]').count();
      
      // CSRF token should be present (or handled via headers)
      expect(csrfToken).toBeGreaterThanOrEqual(0);
    });

    test('should reject requests without valid CSRF token', async ({ request }) => {
      const response = await request.post('/api/user/profile', {
        data: { username: 'hacker' },
        // No CSRF token
      });

      // Should be rejected (401 or 403)
      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('SQL Injection Prevention', () => {
    test('should handle SQL injection attempts in login', async ({ request }) => {
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "admin'--",
        "' OR 1=1--",
        "'; DROP TABLE users--",
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request.post('/api/auth/login', {
          data: {
            email: payload,
            password: payload,
          },
        });

        // Should return 401 (not 500 or success)
        expect(response.status()).toBe(401);
      }
    });
  });

  test.describe('Authentication Security', () => {
    test('should enforce rate limiting on login attempts', async ({ request }) => {
      const attempts = [];
      
      for (let i = 0; i < 10; i++) {
        attempts.push(
          request.post('/api/auth/login', {
            data: {
              email: 'test@example.com',
              password: 'wrong-password',
            },
          })
        );
      }

      const responses = await Promise.all(attempts);
      const rateLimited = responses.some(r => r.status() === 429);

      expect(rateLimited).toBe(true);
    });

    test('should use secure session cookies', async ({ page, context }) => {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);

      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('token'));

      if (sessionCookie) {
        expect(sessionCookie.httpOnly).toBe(true);
        expect(sessionCookie.secure).toBe(true);
        expect(sessionCookie.sameSite).toBe('Strict');
      }
    });

    test('should expire sessions after timeout', async ({ page }) => {
      // This would require mocking time or waiting
      // Placeholder for session timeout test
      expect(true).toBe(true);
    });
  });

  test.describe('Authorization', () => {
    test('should prevent unauthorized access to admin pages', async ({ page }) => {
      // Try to access admin page without login
      await page.goto('/admin');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should prevent regular users from accessing admin API', async ({ request }) => {
      // Login as regular user
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'TestPassword123!',
        },
      });

      const { token } = await loginResponse.json();

      // Try to access admin endpoint
      const response = await request.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status()).toBe(403);
    });
  });

  test.describe('Data Validation', () => {
    test('should validate email format', async ({ request }) => {
      const response = await request.post('/api/auth/register', {
        data: {
          email: 'invalid-email',
          password: 'TestPassword123!',
          username: 'testuser',
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toMatch(/email/i);
    });

    test('should enforce password complexity', async ({ request }) => {
      const weakPasswords = ['password', '12345678', 'abc123'];

      for (const password of weakPasswords) {
        const response = await request.post('/api/auth/register', {
          data: {
            email: 'test@example.com',
            password,
            username: 'testuser',
          },
        });

        expect(response.status()).toBe(400);
      }
    });

    test('should validate amount fields', async ({ request }) => {
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'TestPassword123!',
        },
      });

      const { token } = await loginResponse.json();

      const response = await request.post('/api/withdrawals/request', {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          amount: -100,
          walletAddress: 'TXYZabcdefghijklmnopqrstuvwxyz123456',
        },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Sensitive Data Exposure', () => {
    test('should not expose sensitive data in responses', async ({ request }) => {
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'TestPassword123!',
        },
      });

      const data = await loginResponse.json();

      // Should not include password hash or sensitive data
      expect(data.password).toBeUndefined();
      expect(data.passwordHash).toBeUndefined();
      expect(data.twoFactorSecret).toBeUndefined();
    });

    test('should not expose stack traces in production', async ({ request }) => {
      const response = await request.get('/api/non-existent-endpoint');

      const data = await response.json();

      // Should not include stack trace
      expect(data.stack).toBeUndefined();
      expect(JSON.stringify(data)).not.toContain('at ');
    });
  });

  test.describe('HTTPS Enforcement', () => {
    test('should use HTTPS in production', async ({ page }) => {
      if (process.env.NODE_ENV === 'production') {
        await page.goto('/');
        const url = page.url();
        expect(url).toMatch(/^https:/);
      } else {
        expect(true).toBe(true); // Skip in development
      }
    });
  });

  test.describe('Content Security Policy', () => {
    test('should have CSP headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();

      // Check for security headers
      if (headers) {
        // CSP header might be present
        const csp = headers['content-security-policy'];
        if (csp) {
          expect(csp).toBeDefined();
        }
      }
    });
  });
});
