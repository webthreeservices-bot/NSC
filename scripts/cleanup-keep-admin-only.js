#!/usr/bin/env node

/**
 * CLEANUP SCRIPT - Remove all user data except admin
 * WARNING: This will permanently delete data!
 */

require('dotenv').config();
const { Pool } = require('pg');
const readline = require('readline');

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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question} (yes/no): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function getCurrentData() {
  log('\n━━━ CURRENT DATABASE STATUS ━━━\n', 'cyan');

  const users = await pool.query('SELECT id, email, "fullName", role FROM "User" ORDER BY "createdAt"');
  const packages = await pool.query('SELECT COUNT(*) as count, SUM(amount) as total FROM "Package"');
  const transactions = await pool.query('SELECT COUNT(*) as count FROM "Transaction"');
  const earnings = await pool.query('SELECT COUNT(*) as count, SUM(amount) as total FROM "Earning"');
  const withdrawals = await pool.query('SELECT COUNT(*) as count FROM "Withdrawal"');
  const paymentRequests = await pool.query('SELECT COUNT(*) as count FROM "PaymentRequest"');

  log('Users:', 'cyan');
  users.rows.forEach((u, i) => {
    const isAdmin = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' || u.email.includes('admin');
    const marker = isAdmin ? '[ADMIN - WILL KEEP]' : '[WILL DELETE]';
    log(`  ${i + 1}. ${u.email} - ${u.fullName || 'N/A'} ${marker}`, isAdmin ? 'green' : 'red');
  });

  log(`\nPackages: ${packages.rows[0].count} (Total: $${packages.rows[0].total || 0})`, 'yellow');
  log(`Transactions: ${transactions.rows[0].count}`, 'yellow');
  log(`Earnings: ${earnings.rows[0].count} (Total: $${earnings.rows[0].total || 0})`, 'yellow');
  log(`Withdrawals: ${withdrawals.rows[0].count}`, 'yellow');
  log(`Payment Requests: ${paymentRequests.rows[0].count}`, 'yellow');

  return users.rows;
}

async function cleanupDatabase() {
  log('\n╔════════════════════════════════════════════════╗', 'magenta');
  log('║     DATABASE CLEANUP - KEEP ADMIN ONLY        ║', 'magenta');
  log('╚════════════════════════════════════════════════╝\n', 'magenta');

  try {
    // Get current data
    const users = await getCurrentData();

    // Find admin user
    const adminUser = users.find(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' || u.email.includes('admin'));
    const nonAdminUsers = users.filter(u => u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN' && !u.email.includes('admin'));

    if (!adminUser) {
      log('\n❌ ERROR: No admin user found! Cannot proceed.', 'red');
      log('Please ensure there is at least one user with ADMIN role.', 'yellow');
      return;
    }

    log(`\n✓ Admin user found: ${adminUser.email}`, 'green');
    log(`\n⚠️  Will DELETE ${nonAdminUsers.length} non-admin users and all their data:`, 'yellow');
    nonAdminUsers.forEach(u => {
      log(`  - ${u.email}`, 'red');
    });

    log('\n⚠️  WARNING: This action will:', 'yellow');
    log('  1. Delete all non-admin users', 'red');
    log('  2. Delete all packages (including admin packages)', 'red');
    log('  3. Delete all transactions', 'red');
    log('  4. Delete all earnings', 'red');
    log('  5. Delete all withdrawals', 'red');
    log('  6. Delete all payment requests', 'red');
    log('  7. Delete all bot activations', 'red');
    log('  8. Delete all KYC submissions', 'red');
    log('  9. Delete all support tickets', 'red');
    log('  10. Keep only admin user account\n', 'red');

    const confirmed = await confirm('\nAre you ABSOLUTELY SURE you want to proceed?');

    if (!confirmed) {
      log('\n✓ Cleanup cancelled. No changes made.', 'green');
      return;
    }

    const doubleConfirm = await confirm('\nFinal confirmation - Type "yes" to DELETE ALL DATA except admin');

    if (!doubleConfirm) {
      log('\n✓ Cleanup cancelled. No changes made.', 'green');
      return;
    }

    log('\n━━━ Starting cleanup... ━━━\n', 'cyan');

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Get non-admin user IDs
      const nonAdminIds = nonAdminUsers.map(u => u.id);

      if (nonAdminIds.length === 0) {
        log('✓ No non-admin users to delete.', 'green');
        await pool.query('ROLLBACK');
        return;
      }

      const idList = nonAdminIds.map(id => `'${id}'`).join(',');

      // Delete in correct order (respecting foreign keys)
      log('Deleting ROI Payments...', 'yellow');
      await pool.query(`DELETE FROM "RoiPayment" WHERE "userId" IN (${idList})`);

      log('Deleting Earnings...', 'yellow');
      const earningsResult = await pool.query(`DELETE FROM "Earning" WHERE "userId" IN (${idList})`);
      log(`  → Deleted ${earningsResult.rowCount} earnings`, 'cyan');

      log('Deleting Withdrawals...', 'yellow');
      const withdrawalsResult = await pool.query(`DELETE FROM "Withdrawal" WHERE "userId" IN (${idList})`);
      log(`  → Deleted ${withdrawalsResult.rowCount} withdrawals`, 'cyan');

      log('Deleting Transactions...', 'yellow');
      const transactionsResult = await pool.query(`DELETE FROM "Transaction" WHERE "userId" IN (${idList})`);
      log(`  → Deleted ${transactionsResult.rowCount} transactions`, 'cyan');

      log('Deleting Payment Confirmations...', 'yellow');
      await pool.query(`
        DELETE FROM "PaymentConfirmation"
        WHERE "paymentRequestId" IN (
          SELECT id FROM "PaymentRequest" WHERE "userId" IN (${idList})
        )
      `);

      log('Deleting Payment Webhooks...', 'yellow');
      await pool.query(`
        DELETE FROM "PaymentWebhook"
        WHERE "paymentRequestId" IN (
          SELECT id FROM "PaymentRequest" WHERE "userId" IN (${idList})
        )
      `);

      log('Deleting Payment Requests...', 'yellow');
      const paymentResult = await pool.query(`DELETE FROM "PaymentRequest" WHERE "userId" IN (${idList})`);
      log(`  → Deleted ${paymentResult.rowCount} payment requests`, 'cyan');

      log('Deleting Bot Activations...', 'yellow');
      const botsResult = await pool.query(`DELETE FROM "BotActivation" WHERE "userId" IN (${idList})`);
      log(`  → Deleted ${botsResult.rowCount} bot activations`, 'cyan');

      log('Deleting Packages...', 'yellow');
      const packagesResult = await pool.query(`DELETE FROM "Package" WHERE "userId" IN (${idList})`);
      log(`  → Deleted ${packagesResult.rowCount} packages`, 'cyan');

      log('Deleting KYC Submissions...', 'yellow');
      const kycResult = await pool.query(`DELETE FROM "KYCSubmission" WHERE "userId" IN (${idList})`);
      log(`  → Deleted ${kycResult.rowCount} KYC submissions`, 'cyan');

      log('Deleting Support Tickets...', 'yellow');
      const ticketsResult = await pool.query(`DELETE FROM "SupportTicket" WHERE "userId" IN (${idList})`);
      log(`  → Deleted ${ticketsResult.rowCount} support tickets`, 'cyan');

      log('Deleting Sessions...', 'yellow');
      const sessionsResult = await pool.query(`DELETE FROM "Session" WHERE "userId" IN (${idList})`);
      log(`  → Deleted ${sessionsResult.rowCount} sessions`, 'cyan');

      log('Deleting Audit Logs...', 'yellow');
      await pool.query(`DELETE FROM "AuditLog" WHERE "userId" IN (${idList})`);

      log('Deleting Users...', 'yellow');
      const usersResult = await pool.query(`DELETE FROM "User" WHERE id IN (${idList})`);
      log(`  → Deleted ${usersResult.rowCount} users`, 'cyan');

      // Commit transaction
      await pool.query('COMMIT');

      log('\n✓ Cleanup completed successfully!', 'green');
      log('\n━━━ FINAL STATUS ━━━\n', 'cyan');

      // Show final status
      const finalUsers = await pool.query('SELECT email, "fullName", role FROM "User"');
      const finalPackages = await pool.query('SELECT COUNT(*) as count FROM "Package"');
      const finalTransactions = await pool.query('SELECT COUNT(*) as count FROM "Transaction"');

      log('Remaining Users:', 'cyan');
      finalUsers.rows.forEach(u => {
        log(`  ✓ ${u.email} (${u.role})`, 'green');
      });

      log(`\nPackages: ${finalPackages.rows[0].count}`, 'green');
      log(`Transactions: ${finalTransactions.rows[0].count}`, 'green');

      log('\n✅ Database cleaned successfully!', 'green');

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    log(`\n❌ Error during cleanup: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run cleanup
(async () => {
  try {
    await cleanupDatabase();
    await pool.end();
    process.exit(0);
  } catch (error) {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    await pool.end();
    process.exit(1);
  }
})();
