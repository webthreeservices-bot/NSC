#!/usr/bin/env node

/**
 * Live Data Flow Test
 * Tests actual data retrieval and balance calculations with real database data
 */

require('dotenv').config();
const { Pool } = require('pg');
const http = require('http');

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? {
    rejectUnauthorized: false
  } : false
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test Balance Calculation with Real User Data
 */
async function testBalanceCalculations() {
  log('\n━━━ Testing Balance Calculations with Live Data ━━━\n', 'cyan');

  try {
    // Get all users
    const usersResult = await pool.query('SELECT id, email, "fullName" FROM "User" LIMIT 10');
    const users = usersResult.rows;

    if (users.length === 0) {
      log('⚠️  No users found in database', 'yellow');
      return { success: true, message: 'No users to test' };
    }

    log(`Found ${users.length} users to test\n`, 'cyan');

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      try {
        // Test the balance calculation query from roiService.ts
        const balanceQuery = `
          SELECT
            COALESCE(SUM(CASE WHEN t.type = 'ROI_PAYMENT' AND t.status = 'COMPLETED' THEN t.amount ELSE 0 END), 0) as roi_balance,
            COALESCE(
              (SELECT SUM(amount) FROM "Earning"
               WHERE "userId" = $1 AND "earningType" = 'DIRECT_REFERRAL'::"EarningType"),
              0
            ) as referral_balance,
            COALESCE(
              (SELECT SUM(amount) FROM "Earning"
               WHERE "userId" = $1 AND "earningType" = 'LEVEL_INCOME'::"EarningType"),
              0
            ) as level_balance,
            COALESCE(
              (SELECT SUM(amount) FROM "Withdrawal"
               WHERE "userId" = $1 AND status = 'COMPLETED'),
              0
            ) as total_withdrawn,
            COALESCE(
              (SELECT SUM(amount) FROM "Package"
               WHERE "userId" = $1 AND status IN ('ACTIVE', 'PENDING')),
              0
            ) as locked_capital
          FROM "Transaction" t
          WHERE t."userId" = $1
        `;

        const result = await pool.query(balanceQuery, [user.id]);
        const balance = result.rows[0];

        // Validate no NaN values
        const hasNaN = Object.values(balance).some(v => isNaN(v));
        if (hasNaN) {
          log(`✗ ${user.email} - NaN detected in balance`, 'red');
          failureCount++;
          continue;
        }

        // Calculate totals
        const roiBalance = Number(balance.roi_balance) || 0;
        const referralBalance = Number(balance.referral_balance) || 0;
        const levelBalance = Number(balance.level_balance) || 0;
        const totalWithdrawn = Number(balance.total_withdrawn) || 0;
        const lockedCapital = Number(balance.locked_capital) || 0;

        const totalEarned = roiBalance + referralBalance + levelBalance;
        const totalBalance = Math.max(0, totalEarned - totalWithdrawn);

        log(`✓ ${user.email}`, 'green');
        log(`  ROI: $${roiBalance.toFixed(2)} | Referral: $${referralBalance.toFixed(2)} | Level: $${levelBalance.toFixed(2)}`, 'yellow');
        log(`  Total: $${totalBalance.toFixed(2)} | Withdrawn: $${totalWithdrawn.toFixed(2)} | Locked: $${lockedCapital.toFixed(2)}`, 'yellow');

        successCount++;

      } catch (error) {
        log(`✗ ${user.email} - Error: ${error.message}`, 'red');
        failureCount++;
      }
    }

    log(`\nBalance Calculation Results:`, 'cyan');
    log(`  Successful: ${successCount}/${users.length}`, successCount === users.length ? 'green' : 'yellow');
    log(`  Failed: ${failureCount}/${users.length}`, failureCount > 0 ? 'red' : 'green');

    return { success: failureCount === 0, successCount, failureCount };

  } catch (error) {
    log(`✗ Balance calculation test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test Package Data Retrieval
 */
async function testPackageData() {
  log('\n━━━ Testing Package Data Retrieval ━━━\n', 'cyan');

  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.status,
        p.amount,
        p."roiPercentage",
        p."roiPaidCount",
        p."nextRoiDate",
        u.email as user_email
      FROM "Package" p
      JOIN "User" u ON p."userId" = u.id
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      log('⚠️  No packages found', 'yellow');
      return { success: true, message: 'No packages to test' };
    }

    log(`Found ${result.rows.length} packages\n`, 'cyan');

    for (const pkg of result.rows) {
      const nextRoiDate = pkg.nextRoiDate ? new Date(pkg.nextRoiDate).toLocaleDateString() : 'N/A';
      log(`✓ Package ${pkg.id.substring(0, 8)}...`, 'green');
      log(`  User: ${pkg.user_email} | Status: ${pkg.status}`, 'yellow');
      log(`  Amount: $${pkg.amount} | ROI: ${pkg.roiPercentage}% | Paid: ${pkg.roiPaidCount}/12`, 'yellow');
      log(`  Next ROI: ${nextRoiDate}\n`, 'yellow');
    }

    return { success: true, count: result.rows.length };

  } catch (error) {
    log(`✗ Package data test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test Transaction History
 */
async function testTransactionData() {
  log('\n━━━ Testing Transaction Data ━━━\n', 'cyan');

  try {
    const result = await pool.query(`
      SELECT
        t.id,
        t.type,
        t.status,
        t.amount,
        t."createdAt",
        u.email as user_email
      FROM "Transaction" t
      JOIN "User" u ON t."userId" = u.id
      ORDER BY t."createdAt" DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      log('⚠️  No transactions found', 'yellow');
      return { success: true, message: 'No transactions to test' };
    }

    log(`Found ${result.rows.length} recent transactions\n`, 'cyan');

    for (const tx of result.rows) {
      const date = new Date(tx.createdAt).toLocaleString();
      log(`✓ ${tx.type} - ${tx.status}`, 'green');
      log(`  User: ${tx.user_email}`, 'yellow');
      log(`  Amount: $${tx.amount} | Date: ${date}\n`, 'yellow');
    }

    return { success: true, count: result.rows.length };

  } catch (error) {
    log(`✗ Transaction data test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test Referral Network
 */
async function testReferralData() {
  log('\n━━━ Testing Referral Network Data ━━━\n', 'cyan');

  try {
    const result = await pool.query(`
      SELECT
        u.email,
        u."referralCode",
        u."referredBy",
        (SELECT COUNT(*) FROM "User" WHERE "referredBy" = u."referralCode") as direct_referrals,
        (SELECT COALESCE(SUM(amount), 0) FROM "Earning"
         WHERE "userId" = u.id AND "earningType" = 'DIRECT_REFERRAL'::"EarningType") as referral_earnings
      FROM "User" u
      WHERE u."referralCode" IS NOT NULL
      ORDER BY direct_referrals DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      log('⚠️  No users with referral codes found', 'yellow');
      return { success: true, message: 'No referral data to test' };
    }

    log(`Found ${result.rows.length} users with referral data\n`, 'cyan');

    for (const user of result.rows) {
      log(`✓ ${user.email}`, 'green');
      log(`  Code: ${user.referralCode} | Referred by: ${user.referredBy || 'None'}`, 'yellow');
      log(`  Direct Referrals: ${user.direct_referrals} | Earnings: $${user.referral_earnings}\n`, 'yellow');
    }

    return { success: true, count: result.rows.length };

  } catch (error) {
    log(`✗ Referral data test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Main test execution
 */
async function runTests() {
  log('\n================================================', 'blue');
  log('Live Data Flow Testing', 'blue');
  log('================================================\n', 'blue');

  const results = {
    balanceCalculations: await testBalanceCalculations(),
    packageData: await testPackageData(),
    transactionData: await testTransactionData(),
    referralData: await testReferralData()
  };

  // Summary
  log('\n================================================', 'blue');
  log('Test Summary', 'blue');
  log('================================================\n', 'blue');

  const allPassed = Object.values(results).every(r => r.success);

  log(`Balance Calculations: ${results.balanceCalculations.success ? '✓ PASS' : '✗ FAIL'}`,
      results.balanceCalculations.success ? 'green' : 'red');
  log(`Package Data: ${results.packageData.success ? '✓ PASS' : '✗ FAIL'}`,
      results.packageData.success ? 'green' : 'red');
  log(`Transaction Data: ${results.transactionData.success ? '✓ PASS' : '✗ FAIL'}`,
      results.transactionData.success ? 'green' : 'red');
  log(`Referral Data: ${results.referralData.success ? '✓ PASS' : '✗ FAIL'}`,
      results.referralData.success ? 'green' : 'red');

  log(`\nOverall: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`,
      allPassed ? 'green' : 'red');

  return allPassed ? 0 : 1;
}

// Run tests
(async () => {
  try {
    const exitCode = await runTests();
    await pool.end();
    process.exit(exitCode);
  } catch (error) {
    log(`\n✗ Fatal Error: ${error.message}`, 'red');
    await pool.end();
    process.exit(1);
  }
})();
