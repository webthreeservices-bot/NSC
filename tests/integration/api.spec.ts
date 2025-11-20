import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  let authToken: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    // Get auth token for regular user
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'TestPassword123!',
      },
    });
    
    const loginData = await loginResponse.json();
    authToken = loginData.token;

    // Get auth token for admin
    const adminLoginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
      },
    });
    
    const adminData = await adminLoginResponse.json();
    adminToken = adminData.token;
  });

  test.describe('Authentication API', () => {
    test('POST /api/auth/register - should register new user', async ({ request }) => {
      const timestamp = Date.now();
      const response = await request.post('/api/auth/register', {
        data: {
          email: `test${timestamp}@example.com`,
          password: 'TestPassword123!',
          username: `testuser${timestamp}`,
        },
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.userId).toBeDefined();
    });

    test('POST /api/auth/register - should reject duplicate email', async ({ request }) => {
      const response = await request.post('/api/auth/register', {
        data: {
          email: 'test@example.com', // Existing email
          password: 'TestPassword123!',
          username: 'testuser',
        },
      });

      expect(response.status()).toBe(409);
      const data = await response.json();
      expect(data.error).toMatch(/already.*exists|duplicate/i);
    });

    test('POST /api/auth/login - should login with valid credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'TestPassword123!',
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
    });

    test('POST /api/auth/login - should reject invalid credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'WrongPassword',
        },
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.error).toMatch(/invalid.*credentials/i);
    });

    test('POST /api/auth/logout - should logout user', async ({ request }) => {
      const response = await request.post('/api/auth/logout', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
    });

    test('POST /api/auth/refresh - should refresh token', async ({ request }) => {
      const response = await request.post('/api/auth/refresh', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.token).toBeDefined();
    });
  });

  test.describe('User API', () => {
    test('GET /api/user/profile - should get user profile', async ({ request }) => {
      const response = await request.get('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.email).toBeDefined();
      expect(data.username).toBeDefined();
    });

    test('PUT /api/user/profile - should update user profile', async ({ request }) => {
      const response = await request.put('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          username: 'UpdatedUsername',
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('GET /api/user/balance - should get user balance', async ({ request }) => {
      const response = await request.get('/api/user/balance', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.balance).toBeDefined();
      expect(typeof data.balance).toBe('number');
    });

    test('GET /api/user/earnings - should get user earnings', async ({ request }) => {
      const response = await request.get('/api/user/earnings', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.totalEarnings).toBeDefined();
      expect(Array.isArray(data.earnings)).toBe(true);
    });
  });

  test.describe('Bot API', () => {
    test('GET /api/bots - should get user bots', async ({ request }) => {
      const response = await request.get('/api/bots', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.bots)).toBe(true);
    });

    test('POST /api/bots/activate - should activate bot', async ({ request }) => {
      const response = await request.post('/api/bots/activate', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          packageId: 'pkg-001',
          transactionId: 'txn-123',
        },
      });

      expect([200, 201, 400]).toContain(response.status());
    });

    test('GET /api/bots/:id/status - should get bot status', async ({ request }) => {
      const response = await request.get('/api/bots/bot-123/status', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 404]).toContain(response.status());
    });

    test('GET /api/bots/:id/earnings - should get bot earnings', async ({ request }) => {
      const response = await request.get('/api/bots/bot-123/earnings', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('Package API', () => {
    test('GET /api/packages - should get all packages', async ({ request }) => {
      const response = await request.get('/api/packages');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.packages)).toBe(true);
      expect(data.packages.length).toBeGreaterThan(0);
    });

    test('GET /api/packages/:id - should get package details', async ({ request }) => {
      const response = await request.get('/api/packages/pkg-001');

      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data.id).toBeDefined();
        expect(data.price).toBeDefined();
        expect(data.dailyReturn).toBeDefined();
      }
    });
  });

  test.describe('Payment API', () => {
    test('POST /api/payments/create - should create payment', async ({ request }) => {
      const response = await request.post('/api/payments/create', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          packageId: 'pkg-001',
          currency: 'USDT',
          amount: 100,
        },
      });

      expect([200, 201]).toContain(response.status());
      const data = await response.json();
      expect(data.paymentId).toBeDefined();
      expect(data.walletAddress).toBeDefined();
    });

    test('GET /api/payments/:id - should get payment details', async ({ request }) => {
      const response = await request.get('/api/payments/pay-123', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 404]).toContain(response.status());
    });

    test('POST /api/payments/verify - should verify payment', async ({ request }) => {
      const response = await request.post('/api/payments/verify', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          paymentId: 'pay-123',
          transactionHash: '0xabcdef123456',
        },
      });

      expect([200, 400, 404]).toContain(response.status());
    });
  });

  test.describe('Transaction API', () => {
    test('GET /api/transactions - should get user transactions', async ({ request }) => {
      const response = await request.get('/api/transactions', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.transactions)).toBe(true);
    });

    test('GET /api/transactions?page=1&limit=10 - should paginate transactions', async ({ request }) => {
      const response = await request.get('/api/transactions?page=1&limit=10', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.transactions.length).toBeLessThanOrEqual(10);
      expect(data.pagination).toBeDefined();
    });

    test('GET /api/transactions/:id - should get transaction details', async ({ request }) => {
      const response = await request.get('/api/transactions/txn-123', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('Referral API', () => {
    test('GET /api/referrals - should get referral data', async ({ request }) => {
      const response = await request.get('/api/referrals', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.referralCode).toBeDefined();
      expect(data.referralLink).toBeDefined();
    });

    test('GET /api/referrals/tree - should get referral tree', async ({ request }) => {
      const response = await request.get('/api/referrals/tree', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.tree)).toBe(true);
    });

    test('GET /api/referrals/earnings - should get referral earnings', async ({ request }) => {
      const response = await request.get('/api/referrals/earnings', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.totalEarnings).toBeDefined();
      expect(Array.isArray(data.earnings)).toBe(true);
    });

    test('POST /api/referrals/generate - should generate new referral code', async ({ request }) => {
      const response = await request.post('/api/referrals/generate', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 201]).toContain(response.status());
      const data = await response.json();
      expect(data.referralCode).toBeDefined();
    });
  });

  test.describe('Withdrawal API', () => {
    test('POST /api/withdrawals/request - should request withdrawal', async ({ request }) => {
      const response = await request.post('/api/withdrawals/request', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          amount: 100,
          walletAddress: 'TXYZabcdefghijklmnopqrstuvwxyz123456',
          currency: 'USDT',
        },
      });

      expect([200, 201, 400]).toContain(response.status());
    });

    test('GET /api/withdrawals - should get withdrawal history', async ({ request }) => {
      const response = await request.get('/api/withdrawals', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.withdrawals)).toBe(true);
    });

    test('GET /api/withdrawals/:id - should get withdrawal details', async ({ request }) => {
      const response = await request.get('/api/withdrawals/wd-123', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('Admin API', () => {
    test('GET /api/admin/users - should get all users (admin only)', async ({ request }) => {
      const response = await request.get('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.users)).toBe(true);
    });

    test('GET /api/admin/users - should reject non-admin access', async ({ request }) => {
      const response = await request.get('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(403);
    });

    test('GET /api/admin/stats - should get platform statistics', async ({ request }) => {
      const response = await request.get('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.totalUsers).toBeDefined();
      expect(data.totalTransactions).toBeDefined();
      expect(data.totalRevenue).toBeDefined();
    });

    test('PUT /api/admin/users/:id/status - should update user status', async ({ request }) => {
      const response = await request.put('/api/admin/users/user-123/status', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          status: 'suspended',
        },
      });

      expect([200, 404]).toContain(response.status());
    });

    test('POST /api/admin/withdrawals/:id/approve - should approve withdrawal', async ({ request }) => {
      const response = await request.post('/api/admin/withdrawals/wd-123/approve', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect([200, 404]).toContain(response.status());
    });

    test('POST /api/admin/withdrawals/:id/reject - should reject withdrawal', async ({ request }) => {
      const response = await request.post('/api/admin/withdrawals/wd-123/reject', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        data: {
          reason: 'Insufficient verification',
        },
      });

      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('Health Check API', () => {
    test('GET /api/health - should return health status', async ({ request }) => {
      const response = await request.get('/api/health');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });

    test('GET /api/health/db - should return database health', async ({ request }) => {
      const response = await request.get('/api/health/db');

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.database).toBeDefined();
    });
  });

  test.describe('Error Handling', () => {
    test('should return 404 for non-existent endpoint', async ({ request }) => {
      const response = await request.get('/api/non-existent-endpoint');

      expect(response.status()).toBe(404);
    });

    test('should return 401 for unauthorized access', async ({ request }) => {
      const response = await request.get('/api/user/profile');

      expect(response.status()).toBe(401);
    });

    test('should return 400 for invalid request body', async ({ request }) => {
      const response = await request.post('/api/auth/register', {
        data: {
          // Missing required fields
          email: 'test@example.com',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should handle rate limiting', async ({ request }) => {
      // Make multiple rapid requests
      const requests = Array(20).fill(null).map(() =>
        request.post('/api/auth/login', {
          data: {
            email: 'test@example.com',
            password: 'wrong',
          },
        })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status() === 429);

      // At least one request should be rate limited
      expect(rateLimited).toBe(true);
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
      expect(data.error).toMatch(/email|invalid/i);
    });

    test('should validate password strength', async ({ request }) => {
      const response = await request.post('/api/auth/register', {
        data: {
          email: 'test@example.com',
          password: 'weak',
          username: 'testuser',
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toMatch(/password/i);
    });

    test('should validate amount fields', async ({ request }) => {
      const response = await request.post('/api/withdrawals/request', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          amount: -100, // Negative amount
          walletAddress: 'TXYZabcdefghijklmnopqrstuvwxyz123456',
        },
      });

      expect(response.status()).toBe(400);
    });
  });
});
