#!/usr/bin/env node

/**
 * Database Live Connection and Query Test
 * Tests actual database connectivity and common queries
 */

require('dotenv').config();
const { Pool } = require('pg');

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? {
    rejectUnauthorized: false
  } : false
});

const tests = [];
let passed = 0;
let failed = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testQuery(name, query, expectedRows = null) {
  try {
    const startTime = Date.now();
    const result = await pool.query(query);
    const duration = Date.now() - startTime;

    const rowCount = result.rows.length;
    const success = expectedRows === null || rowCount >= expectedRows;

    if (success) {
      log(`✓ ${name} - ${rowCount} rows (${duration}ms)`, 'green');
      passed++;
      return { success: true, rowCount, duration, data: result.rows };
    } else {
      log(`✗ ${name} - Expected ${expectedRows}+ rows, got ${rowCount} (${duration}ms)`, 'red');
      failed++;
      return { success: false, rowCount, duration };
    }
  } catch (error) {
    log(`✗ ${name} - Error: ${error.message}`, 'red');
    failed++;
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n================================================', 'blue');
  log('Database Live Connection Test', 'blue');
  log('================================================\n', 'blue');

  log(`Database: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`, 'cyan');
  log('', 'reset');

  // Test 1: Basic Connection
  log('\n━━━ Basic Connectivity ━━━\n', 'cyan');
  await testQuery('Database Connection', 'SELECT NOW() as current_time');
  await testQuery('Database Version', 'SELECT version()');

  // Test 2: Schema Verification
  log('\n━━━ Schema Verification ━━━\n', 'cyan');
  await testQuery('User Table', 'SELECT COUNT(*) as count FROM "User"', 0);
  await testQuery('Package Table', 'SELECT COUNT(*) as count FROM "Package"', 0);
  await testQuery('Transaction Table', 'SELECT COUNT(*) as count FROM "Transaction"', 0);
  await testQuery('Earning Table', 'SELECT COUNT(*) as count FROM "Earning"', 0);
  await testQuery('Withdrawal Table', 'SELECT COUNT(*) as count FROM "Withdrawal"', 0);

  // Test 3: Enum Types
  log('\n━━━ Enum Types ━━━\n', 'cyan');
  await testQuery(
    'PackageStatus Enum',
    `SELECT unnest(enum_range(NULL::"PackageStatus")) as value`
  );
  await testQuery(
    'TransactionType Enum',
    `SELECT unnest(enum_range(NULL::"TransactionType")) as value`
  );
  await testQuery(
    'EarningType Enum',
    `SELECT unnest(enum_range(NULL::"EarningType")) as value`
  );

  // Test 4: Functions
  log('\n━━━ Database Functions ━━━\n', 'cyan');
  const functionsResult = await testQuery(
    'Custom Functions',
    `SELECT proname FROM pg_proc WHERE proname IN (
      'get_withdrawable_balance',
      'process_referral_earnings',
      'calculate_level_income'
    )`
  );

  if (functionsResult.data) {
    functionsResult.data.forEach(fn => {
      log(`  → ${fn.proname}`, 'yellow');
    });
  }

  // Test 5: Triggers
  log('\n━━━ Database Triggers ━━━\n', 'cyan');
  const triggersResult = await testQuery(
    'Triggers',
    `SELECT tgname, tgrelid::regclass as table_name
     FROM pg_trigger
     WHERE tgname NOT LIKE 'RI_%'
     AND tgname NOT LIKE 'pg_%'`
  );

  if (triggersResult.data) {
    triggersResult.data.forEach(tg => {
      log(`  → ${tg.tgname} on ${tg.table_name}`, 'yellow');
    });
  }

  // Test 6: Sample Data Queries
  log('\n━━━ Sample Data Queries ━━━\n', 'cyan');

  const userCountResult = await testQuery(
    'Total Users',
    'SELECT COUNT(*) as count FROM "User"'
  );
  if (userCountResult.data) {
    log(`  → Total: ${userCountResult.data[0].count}`, 'yellow');
  }

  const activePackagesResult = await testQuery(
    'Active Packages',
    `SELECT COUNT(*) as count FROM "Package" WHERE status = 'ACTIVE'`
  );
  if (activePackagesResult.data) {
    log(`  → Active: ${activePackagesResult.data[0].count}`, 'yellow');
  }

  const totalTransactionsResult = await testQuery(
    'Total Transactions',
    'SELECT COUNT(*) as count FROM "Transaction"'
  );
  if (totalTransactionsResult.data) {
    log(`  → Total: ${totalTransactionsResult.data[0].count}`, 'yellow');
  }

  // Test 7: Balance Calculation
  log('\n━━━ Balance Calculations ━━━\n', 'cyan');

  // Get a sample user if exists
  const sampleUserResult = await pool.query(
    'SELECT id FROM "User" LIMIT 1'
  );

  if (sampleUserResult.rows.length > 0) {
    const userId = sampleUserResult.rows[0].id;

    // Test balance calculation query
    const balanceResult = await testQuery(
      'Balance Calculation Query',
      `SELECT
        COALESCE(SUM(CASE WHEN t.type = 'ROI_PAYMENT' THEN t.amount ELSE 0 END), 0) as roi_balance,
        COALESCE(
          (SELECT SUM(amount) FROM "Earning" WHERE "userId" = '${userId}' AND "earningType" = 'DIRECT_REFERRAL'::"EarningType"),
          0
        ) as referral_balance
      FROM "Transaction" t
      WHERE t."userId" = '${userId}' AND t.status = 'COMPLETED'`
    );

    if (balanceResult.data) {
      log(`  → ROI Balance: ${balanceResult.data[0].roi_balance}`, 'yellow');
      log(`  → Referral Balance: ${balanceResult.data[0].referral_balance}`, 'yellow');
    }
  } else {
    log('  → No users found to test balance calculation', 'yellow');
  }

  // Test 8: Performance Check
  log('\n━━━ Performance Tests ━━━\n', 'cyan');

  const perfStart = Date.now();
  await pool.query('SELECT 1');
  const perfEnd = Date.now();
  const latency = perfEnd - perfStart;

  if (latency < 100) {
    log(`✓ Query Latency: ${latency}ms (Excellent)`, 'green');
    passed++;
  } else if (latency < 500) {
    log(`✓ Query Latency: ${latency}ms (Good)`, 'yellow');
    passed++;
  } else {
    log(`✗ Query Latency: ${latency}ms (Slow)`, 'red');
    failed++;
  }

  // Summary
  log('\n================================================', 'blue');
  log('Test Summary', 'blue');
  log('================================================\n', 'blue');

  const total = passed + failed;
  const successRate = ((passed / total) * 100).toFixed(1);

  log(`Total Tests: ${total}`, 'reset');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  log(`Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');
  log('', 'reset');

  return failed === 0 ? 0 : 1;
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
