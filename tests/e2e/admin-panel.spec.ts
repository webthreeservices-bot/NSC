import { test, expect } from '@playwright/test';

test.describe('Admin Panel E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin|\/dashboard/);
  });

  test.describe('Admin Dashboard', () => {
    test('should display admin dashboard with statistics', async ({ page }) => {
      await page.goto('/admin');

      // Check for admin dashboard elements
      await expect(page.locator('h1, h2').filter({ hasText: /admin.*dashboard/i })).toBeVisible();
      
      // Check for key metrics
      await expect(page.locator('text=/total.*users/i')).toBeVisible();
      await expect(page.locator('text=/total.*transactions/i')).toBeVisible();
      await expect(page.locator('text=/pending.*approvals/i')).toBeVisible();
    });

    test('should display recent activity', async ({ page }) => {
      await page.goto('/admin');

      await expect(page.locator('text=/recent.*activity|latest.*transactions/i')).toBeVisible();
    });
  });

  test.describe('User Management', () => {
    test('should view all users', async ({ page }) => {
      await page.goto('/admin/users');

      // Check for users table
      await expect(page.locator('table, [role="table"]')).toBeVisible();
      
      // Check for user columns
      await expect(page.locator('text=/email/i')).toBeVisible();
      await expect(page.locator('text=/status/i')).toBeVisible();
      await expect(page.locator('text=/joined|created/i')).toBeVisible();
    });

    test('should search for users', async ({ page }) => {
      await page.goto('/admin/users');

      // Search for user
      await page.fill('input[placeholder*="Search"], input[name="search"]', 'test@example.com');
      await page.waitForTimeout(500); // Wait for debounce

      // Results should be filtered
      await expect(page.locator('table tbody tr')).toHaveCount(1, { timeout: 5000 });
    });

    test('should view user details', async ({ page }) => {
      await page.goto('/admin/users');

      // Click on first user
      await page.click('table tbody tr:first-child, [data-testid="user-row"]:first-child');

      // Should show user details modal or page
      await expect(page.locator('text=/user.*details|profile/i')).toBeVisible({ timeout: 5000 });
    });

    test('should suspend user account', async ({ page }) => {
      await page.goto('/admin/users');

      // Click on user actions
      await page.click('table tbody tr:first-child button, [data-testid="user-actions"]');

      // Click suspend
      await page.click('button:has-text("Suspend"), [role="menuitem"]:has-text("Suspend")');

      // Confirm action
      await page.click('button:has-text("Confirm")');

      // Should show success message
      await expect(page.locator('text=/suspended.*successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should activate suspended user', async ({ page }) => {
      await page.goto('/admin/users');

      // Filter suspended users
      await page.click('button:has-text("Filter"), select[name="status"]');
      await page.click('[role="option"]:has-text("Suspended"), option[value="suspended"]');

      // Activate first suspended user
      await page.click('table tbody tr:first-child button');
      await page.click('button:has-text("Activate")');
      await page.click('button:has-text("Confirm")');

      await expect(page.locator('text=/activated.*successfully/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Transaction Management', () => {
    test('should view all transactions', async ({ page }) => {
      await page.goto('/admin/transactions');

      await expect(page.locator('table, [role="table"]')).toBeVisible();
      
      // Check for transaction columns
      await expect(page.locator('text=/transaction.*id|txn.*id/i')).toBeVisible();
      await expect(page.locator('text=/amount/i')).toBeVisible();
      await expect(page.locator('text=/status/i')).toBeVisible();
      await expect(page.locator('text=/user/i')).toBeVisible();
    });

    test('should filter transactions by status', async ({ page }) => {
      await page.goto('/admin/transactions');

      // Filter by pending
      await page.click('select[name="status"], button:has-text("Status")');
      await page.click('[role="option"]:has-text("Pending"), option[value="pending"]');

      await page.waitForTimeout(500);

      // All visible transactions should be pending
      const statusCells = page.locator('td:has-text("Pending"), [data-status="pending"]');
      await expect(statusCells.first()).toBeVisible();
    });

    test('should filter transactions by date range', async ({ page }) => {
      await page.goto('/admin/transactions');

      // Set date range
      await page.fill('input[name="startDate"], input[type="date"]:first-of-type', '2024-01-01');
      await page.fill('input[name="endDate"], input[type="date"]:last-of-type', '2024-12-31');

      // Apply filter
      await page.click('button:has-text("Apply"), button:has-text("Filter")');

      await page.waitForTimeout(500);
    });

    test('should export transactions', async ({ page }) => {
      await page.goto('/admin/transactions');

      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export"), button:has-text("Download")');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/transactions.*\.(csv|xlsx)/i);
    });
  });

  test.describe('Withdrawal Approvals', () => {
    test('should view pending withdrawals', async ({ page }) => {
      await page.goto('/admin/withdrawals');

      await expect(page.locator('text=/pending.*withdrawals/i')).toBeVisible();
      await expect(page.locator('table, [role="table"]')).toBeVisible();
    });

    test('should approve withdrawal', async ({ page }) => {
      await page.goto('/admin/withdrawals');

      // Click approve on first pending withdrawal
      await page.click('table tbody tr:first-child button:has-text("Approve")');

      // Confirm approval
      await page.click('button:has-text("Confirm")');

      // Should show success message
      await expect(page.locator('text=/approved.*successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should reject withdrawal', async ({ page }) => {
      await page.goto('/admin/withdrawals');

      // Click reject
      await page.click('table tbody tr:first-child button:has-text("Reject")');

      // Enter rejection reason
      await page.fill('textarea[name="reason"], input[name="reason"]', 'Insufficient verification');

      // Confirm rejection
      await page.click('button:has-text("Confirm")');

      await expect(page.locator('text=/rejected.*successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should view withdrawal details', async ({ page }) => {
      await page.goto('/admin/withdrawals');

      // Click on withdrawal row
      await page.click('table tbody tr:first-child');

      // Should show details
      await expect(page.locator('text=/withdrawal.*details/i')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/wallet.*address/i')).toBeVisible();
      await expect(page.locator('text=/amount/i')).toBeVisible();
    });
  });

  test.describe('Bot Management', () => {
    test('should view all active bots', async ({ page }) => {
      await page.goto('/admin/bots');

      await expect(page.locator('table, [role="table"]')).toBeVisible();
      
      // Check for bot columns
      await expect(page.locator('text=/bot.*id|id/i')).toBeVisible();
      await expect(page.locator('text=/user/i')).toBeVisible();
      await expect(page.locator('text=/package/i')).toBeVisible();
      await expect(page.locator('text=/status/i')).toBeVisible();
    });

    test('should deactivate bot', async ({ page }) => {
      await page.goto('/admin/bots');

      // Click on bot actions
      await page.click('table tbody tr:first-child button');

      // Click deactivate
      await page.click('button:has-text("Deactivate")');

      // Confirm
      await page.click('button:has-text("Confirm")');

      await expect(page.locator('text=/deactivated.*successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should view bot earnings', async ({ page }) => {
      await page.goto('/admin/bots');

      // Click on bot row
      await page.click('table tbody tr:first-child');

      // Should show earnings details
      await expect(page.locator('text=/earnings|revenue/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Package Management', () => {
    test('should view all packages', async ({ page }) => {
      await page.goto('/admin/packages');

      await expect(page.locator('[data-testid="package-card"], .package-card')).toHaveCount(3, { timeout: 5000 });
    });

    test('should create new package', async ({ page }) => {
      await page.goto('/admin/packages');

      // Click create package
      await page.click('button:has-text("Create Package"), button:has-text("Add Package")');

      // Fill package form
      await page.fill('input[name="name"]', 'Test Package');
      await page.fill('input[name="price"]', '500');
      await page.fill('input[name="dailyReturn"]', '2.5');
      await page.fill('input[name="duration"]', '365');

      // Submit
      await page.click('button[type="submit"]');

      await expect(page.locator('text=/package.*created/i')).toBeVisible({ timeout: 5000 });
    });

    test('should edit package', async ({ page }) => {
      await page.goto('/admin/packages');

      // Click edit on first package
      await page.click('[data-testid="package-card"]:first-child button:has-text("Edit")');

      // Update price
      await page.fill('input[name="price"]', '600');

      // Save
      await page.click('button:has-text("Save")');

      await expect(page.locator('text=/updated.*successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should deactivate package', async ({ page }) => {
      await page.goto('/admin/packages');

      // Click deactivate
      await page.click('[data-testid="package-card"]:first-child button:has-text("Deactivate")');

      // Confirm
      await page.click('button:has-text("Confirm")');

      await expect(page.locator('text=/deactivated.*successfully/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('System Settings', () => {
    test('should view system settings', async ({ page }) => {
      await page.goto('/admin/settings');

      await expect(page.locator('h1, h2').filter({ hasText: /settings/i })).toBeVisible();
    });

    test('should update platform fee', async ({ page }) => {
      await page.goto('/admin/settings');

      // Update platform fee
      await page.fill('input[name="platformFee"]', '2.5');

      // Save
      await page.click('button:has-text("Save")');

      await expect(page.locator('text=/updated.*successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should update minimum withdrawal amount', async ({ page }) => {
      await page.goto('/admin/settings');

      await page.fill('input[name="minWithdrawal"]', '50');
      await page.click('button:has-text("Save")');

      await expect(page.locator('text=/updated.*successfully/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Audit Logs', () => {
    test('should view audit logs', async ({ page }) => {
      await page.goto('/admin/audit-logs');

      await expect(page.locator('table, [role="table"]')).toBeVisible();
      
      // Check for log columns
      await expect(page.locator('text=/action|event/i')).toBeVisible();
      await expect(page.locator('text=/user|admin/i')).toBeVisible();
      await expect(page.locator('text=/timestamp|date/i')).toBeVisible();
    });

    test('should filter logs by action type', async ({ page }) => {
      await page.goto('/admin/audit-logs');

      // Filter by action
      await page.click('select[name="action"], button:has-text("Action")');
      await page.click('[role="option"]:has-text("User Created"), option[value="user_created"]');

      await page.waitForTimeout(500);
    });

    test('should search logs', async ({ page }) => {
      await page.goto('/admin/audit-logs');

      // Search
      await page.fill('input[placeholder*="Search"]', 'user@example.com');
      await page.waitForTimeout(500);
    });
  });

  test.describe('Analytics and Reports', () => {
    test('should view analytics dashboard', async ({ page }) => {
      await page.goto('/admin/analytics');

      // Check for charts
      await expect(page.locator('canvas, svg[class*="recharts"]')).toHaveCount(3, { timeout: 5000 });
    });

    test('should generate revenue report', async ({ page }) => {
      await page.goto('/admin/reports');

      // Select report type
      await page.click('select[name="reportType"]');
      await page.click('option[value="revenue"]');

      // Set date range
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-12-31');

      // Generate report
      await page.click('button:has-text("Generate")');

      await expect(page.locator('text=/report.*generated/i')).toBeVisible({ timeout: 10000 });
    });

    test('should export analytics data', async ({ page }) => {
      await page.goto('/admin/analytics');

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export")');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/analytics.*\.(csv|xlsx)/i);
    });
  });

  test.describe('Referral System Management', () => {
    test('should view referral statistics', async ({ page }) => {
      await page.goto('/admin/referrals');

      await expect(page.locator('text=/total.*referrals/i')).toBeVisible();
      await expect(page.locator('text=/referral.*earnings/i')).toBeVisible();
    });

    test('should view referral tree for user', async ({ page }) => {
      await page.goto('/admin/referrals');

      // Search for user
      await page.fill('input[placeholder*="Search"]', 'test@example.com');
      await page.click('button:has-text("Search")');

      // View tree
      await page.click('button:has-text("View Tree")');

      await expect(page.locator('text=/referral.*tree/i')).toBeVisible({ timeout: 5000 });
    });

    test('should update referral commission rates', async ({ page }) => {
      await page.goto('/admin/settings/referrals');

      // Update level 1 commission
      await page.fill('input[name="level1Commission"]', '10');
      await page.fill('input[name="level2Commission"]', '5');
      await page.fill('input[name="level3Commission"]', '2');

      await page.click('button:has-text("Save")');

      await expect(page.locator('text=/updated.*successfully/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Support Tickets', () => {
    test('should view all support tickets', async ({ page }) => {
      await page.goto('/admin/support');

      await expect(page.locator('table, [role="table"]')).toBeVisible();
    });

    test('should respond to ticket', async ({ page }) => {
      await page.goto('/admin/support');

      // Click on first ticket
      await page.click('table tbody tr:first-child');

      // Enter response
      await page.fill('textarea[name="response"]', 'Thank you for contacting us. We will resolve this issue.');

      // Send response
      await page.click('button:has-text("Send")');

      await expect(page.locator('text=/response.*sent/i')).toBeVisible({ timeout: 5000 });
    });

    test('should close ticket', async ({ page }) => {
      await page.goto('/admin/support');

      await page.click('table tbody tr:first-child');
      await page.click('button:has-text("Close Ticket")');
      await page.click('button:has-text("Confirm")');

      await expect(page.locator('text=/ticket.*closed/i')).toBeVisible({ timeout: 5000 });
    });
  });
});
