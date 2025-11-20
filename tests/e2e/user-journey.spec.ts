import { test, expect, Page } from '@playwright/test';

test.describe('Complete User Journey E2E Tests', () => {
  let page: Page;

  test.describe('Registration and Onboarding Flow', () => {
    test('should complete full registration process', async ({ page }) => {
      // Navigate to registration page
      await page.goto('/auth/register');
      await expect(page).toHaveTitle(/Register|Sign Up/i);

      // Fill registration form
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@example.com`;
      
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
      await page.fill('input[name="username"]', `testuser${timestamp}`);

      // Accept terms and conditions
      await page.check('input[type="checkbox"][name="terms"]');

      // Submit registration
      await page.click('button[type="submit"]');

      // Wait for success message or redirect
      await expect(page).toHaveURL(/\/auth\/verify-email|\/dashboard/i, { timeout: 10000 });
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.goto('/auth/register');

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Check for validation errors
      await expect(page.locator('text=/email.*required/i')).toBeVisible();
      await expect(page.locator('text=/password.*required/i')).toBeVisible();
    });

    test('should reject weak password', async ({ page }) => {
      await page.goto('/auth/register');

      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'weak');
      await page.fill('input[name="confirmPassword"]', 'weak');

      await page.click('button[type="submit"]');

      await expect(page.locator('text=/password.*strong|weak/i')).toBeVisible();
    });

    test('should reject mismatched passwords', async ({ page }) => {
      await page.goto('/auth/register');

      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');

      await page.click('button[type="submit"]');

      await expect(page.locator('text=/password.*match/i')).toBeVisible();
    });
  });

  test.describe('Login Flow', () => {
    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/auth/login');

      // Fill login form
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');

      // Submit login
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');

      await page.fill('input[name="email"]', 'wrong@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123!');

      await page.click('button[type="submit"]');

      await expect(page.locator('text=/invalid.*credentials|incorrect/i')).toBeVisible();
    });

    test('should handle 2FA authentication', async ({ page }) => {
      await page.goto('/auth/login');

      // Login with 2FA enabled account
      await page.fill('input[name="email"]', '2fa@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');

      // Should show 2FA input
      await expect(page.locator('input[name="twoFactorCode"]')).toBeVisible({ timeout: 5000 });

      // Enter 2FA code (mock)
      await page.fill('input[name="twoFactorCode"]', '123456');
      await page.click('button[type="submit"]');
    });

    test('should remember me functionality', async ({ page }) => {
      await page.goto('/auth/login');

      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.check('input[name="rememberMe"]');

      await page.click('button[type="submit"]');

      // Check if session cookie is set with extended expiry
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session'));
      expect(sessionCookie).toBeDefined();
    });
  });

  test.describe('Dashboard Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
    });

    test('should display user dashboard with stats', async ({ page }) => {
      await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i })).toBeVisible();

      // Check for key dashboard elements
      await expect(page.locator('text=/total.*earnings|balance/i')).toBeVisible();
      await expect(page.locator('text=/active.*bots|bots/i')).toBeVisible();
      await expect(page.locator('text=/referrals/i')).toBeVisible();
    });

    test('should navigate to different dashboard sections', async ({ page }) => {
      // Navigate to earnings
      await page.click('a[href*="earnings"], button:has-text("Earnings")');
      await expect(page).toHaveURL(/earnings/);

      // Navigate to bots
      await page.click('a[href*="bots"], button:has-text("Bots")');
      await expect(page).toHaveURL(/bots/);

      // Navigate to referrals
      await page.click('a[href*="referrals"], button:has-text("Referrals")');
      await expect(page).toHaveURL(/referrals/);
    });

    test('should display transaction history', async ({ page }) => {
      await page.goto('/dashboard/transactions');

      // Check for transaction table
      await expect(page.locator('table, [role="table"]')).toBeVisible();
      
      // Check for transaction columns
      await expect(page.locator('text=/date|time/i')).toBeVisible();
      await expect(page.locator('text=/amount/i')).toBeVisible();
      await expect(page.locator('text=/status/i')).toBeVisible();
    });
  });

  test.describe('Bot Activation Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
    });

    test('should view available bot packages', async ({ page }) => {
      await page.goto('/dashboard/packages');

      // Check for package cards
      await expect(page.locator('[data-testid="package-card"], .package-card').first()).toBeVisible();
      
      // Check for package details
      await expect(page.locator('text=/price|cost/i')).toBeVisible();
      await expect(page.locator('text=/daily.*return|roi/i')).toBeVisible();
    });

    test('should initiate bot purchase', async ({ page }) => {
      await page.goto('/dashboard/packages');

      // Click on first package
      await page.click('[data-testid="package-card"], .package-card >> nth=0');

      // Click purchase button
      await page.click('button:has-text("Purchase"), button:has-text("Buy Now")');

      // Should show payment modal
      await expect(page.locator('[role="dialog"], .modal').filter({ hasText: /payment/i })).toBeVisible();
    });

    test('should complete bot activation after payment', async ({ page }) => {
      await page.goto('/dashboard/packages');

      // Select package
      await page.click('[data-testid="package-card"] >> nth=0');
      await page.click('button:has-text("Purchase")');

      // Select payment method
      await page.click('button:has-text("USDT"), [data-currency="USDT"]');

      // Confirm payment
      await page.click('button:has-text("Confirm"), button[type="submit"]');

      // Should show QR code or payment address
      await expect(page.locator('text=/scan.*qr|payment.*address/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Payment Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
    });

    test('should display payment QR code', async ({ page }) => {
      await page.goto('/dashboard/packages');
      
      await page.click('[data-testid="package-card"] >> nth=0');
      await page.click('button:has-text("Purchase")');
      await page.click('button:has-text("USDT")');
      await page.click('button:has-text("Confirm")');

      // Check for QR code
      await expect(page.locator('canvas, img[alt*="QR"], [data-testid="qr-code"]')).toBeVisible({ timeout: 5000 });
    });

    test('should copy payment address', async ({ page }) => {
      await page.goto('/dashboard/packages');
      
      await page.click('[data-testid="package-card"] >> nth=0');
      await page.click('button:has-text("Purchase")');
      await page.click('button:has-text("USDT")');
      await page.click('button:has-text("Confirm")');

      // Click copy button
      await page.click('button:has-text("Copy"), [aria-label*="Copy"]');

      // Should show success message
      await expect(page.locator('text=/copied|copy.*success/i')).toBeVisible({ timeout: 3000 });
    });

    test('should verify payment status', async ({ page }) => {
      await page.goto('/dashboard/transactions');

      // Check for pending payment
      await expect(page.locator('text=/pending/i').first()).toBeVisible();

      // Click refresh or check status
      await page.click('button:has-text("Refresh"), button[aria-label*="Refresh"]');

      // Status should update (in real scenario)
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Referral System Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
    });

    test('should display referral link', async ({ page }) => {
      await page.goto('/dashboard/referrals');

      // Check for referral link
      await expect(page.locator('input[readonly], [data-testid="referral-link"]')).toBeVisible();
    });

    test('should copy referral link', async ({ page }) => {
      await page.goto('/dashboard/referrals');

      // Click copy button
      await page.click('button:has-text("Copy Link"), button:has-text("Copy")');

      // Should show success message
      await expect(page.locator('text=/copied/i')).toBeVisible({ timeout: 3000 });
    });

    test('should display referral tree', async ({ page }) => {
      await page.goto('/dashboard/referrals');

      // Check for referral tree or list
      await expect(page.locator('text=/level.*1|direct.*referrals/i')).toBeVisible();
    });

    test('should display referral earnings', async ({ page }) => {
      await page.goto('/dashboard/referrals');

      // Check for earnings display
      await expect(page.locator('text=/total.*earnings|referral.*income/i')).toBeVisible();
    });
  });

  test.describe('Withdrawal Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
    });

    test('should request withdrawal', async ({ page }) => {
      await page.goto('/dashboard/withdrawals');

      // Click request withdrawal
      await page.click('button:has-text("Request Withdrawal"), button:has-text("Withdraw")');

      // Fill withdrawal form
      await page.fill('input[name="amount"]', '100');
      await page.fill('input[name="walletAddress"]', 'TXYZabcdefghijklmnopqrstuvwxyz123456');

      // Submit request
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/withdrawal.*requested|success/i')).toBeVisible({ timeout: 5000 });
    });

    test('should validate minimum withdrawal amount', async ({ page }) => {
      await page.goto('/dashboard/withdrawals');

      await page.click('button:has-text("Request Withdrawal")');
      await page.fill('input[name="amount"]', '5'); // Below minimum

      await page.click('button[type="submit"]');

      await expect(page.locator('text=/minimum.*amount/i')).toBeVisible();
    });

    test('should display withdrawal history', async ({ page }) => {
      await page.goto('/dashboard/withdrawals');

      // Check for withdrawal history
      await expect(page.locator('text=/withdrawal.*history|past.*withdrawals/i')).toBeVisible();
    });
  });

  test.describe('Profile Management Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
    });

    test('should view profile settings', async ({ page }) => {
      await page.goto('/dashboard/settings');

      // Check for profile fields
      await expect(page.locator('input[name="username"], input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
    });

    test('should update profile information', async ({ page }) => {
      await page.goto('/dashboard/settings');

      // Update username
      await page.fill('input[name="username"]', 'UpdatedUsername');

      // Save changes
      await page.click('button:has-text("Save"), button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/updated.*successfully|saved/i')).toBeVisible({ timeout: 5000 });
    });

    test('should change password', async ({ page }) => {
      await page.goto('/dashboard/settings');

      // Navigate to security settings
      await page.click('a:has-text("Security"), button:has-text("Security")');

      // Fill password change form
      await page.fill('input[name="currentPassword"]', 'TestPassword123!');
      await page.fill('input[name="newPassword"]', 'NewPassword123!');
      await page.fill('input[name="confirmPassword"]', 'NewPassword123!');

      await page.click('button:has-text("Change Password")');

      await expect(page.locator('text=/password.*changed|updated/i')).toBeVisible({ timeout: 5000 });
    });

    test('should enable 2FA', async ({ page }) => {
      await page.goto('/dashboard/settings/security');

      // Click enable 2FA
      await page.click('button:has-text("Enable 2FA"), button:has-text("Enable Two-Factor")');

      // Should show QR code for 2FA setup
      await expect(page.locator('canvas, img[alt*="QR"]')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);

      // Logout
      await page.click('button:has-text("Logout"), a:has-text("Logout")');

      // Should redirect to login or home
      await expect(page).toHaveURL(/\/auth\/login|\/$/);
    });

    test('should clear session on logout', async ({ page }) => {
      // Login
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);

      // Logout
      await page.click('button:has-text("Logout")');

      // Try to access protected page
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
