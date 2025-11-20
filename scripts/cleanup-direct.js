#!/usr/bin/env node

/**
 * DIRECT CLEANUP - Remove all user data except admin (NO PROMPTS)
 */

require('dotenv').config();
const { Pool } = require('pg');

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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function cleanupDatabase() {
  log('\n╔════════════════════════════════════════════════╗', 'magenta');
  log('║     CLEANUP IN PROGRESS...                     ║', 'magenta');
  log('╚════════════════════════════════════════════════╝\n', 'magenta');

  try {
    // Get admin user
    const adminResult = await pool.query(`
      SELECT id, email
      FROM "User"
      WHERE role = 'SUPER_ADMIN' OR role = 'ADMIN' OR email LIKE '%admin%'
      LIMIT 1
    `);

    if (adminResult.rows.length === 0) {
      log('❌ No admin user found!', 'red');
      return;
    }

    const adminId = adminResult.rows[0].id;
    log(`✓ Admin user: ${adminResult.rows[0].email}`, 'green');

    // Get all non-admin users
    const nonAdminUsers = await pool.query(`
      SELECT id, email
      FROM "User"
      WHERE id != $1
    `, [adminId]);

    if (nonAdminUsers.rows.length === 0) {
      log('\n✓ No non-admin users to delete.', 'green');
      return;
    }

    log(`\n⚠️  Deleting ${nonAdminUsers.rows.length} users:`, 'yellow');
    nonAdminUsers.rows.forEach(u => log(`  - ${u.email}`, 'red'));

    const nonAdminIds = nonAdminUsers.rows.map(u => u.id);
    const idList = nonAdminIds.map(id => `'${id}'`).join(',');

    log('\n━━━ Starting deletion... ━━━\n', 'cyan');

    // Start transaction
    await pool.query('BEGIN');

    try {
      log('1. Deleting ROI Payments...', 'yellow');
      await pool.query(`DELETE FROM "RoiPayment" WHERE "userId" IN (${idList})`);

      log('2. Deleting Earnings...', 'yellow');
      const earningsResult = await pool.query(`DELETE FROM "Earning" WHERE "userId" IN (${idList})`);
      log(`   → ${earningsResult.rowCount} earnings deleted`, 'cyan');

      log('3. Deleting Withdrawals...', 'yellow');
      const withdrawalsResult = await pool.query(`DELETE FROM "Withdrawal" WHERE "userId" IN (${idList})`);
      log(`   → ${withdrawalsResult.rowCount} withdrawals deleted`, 'cyan');

      log('4. Deleting Transactions...', 'yellow');
      const transactionsResult = await pool.query(`DELETE FROM "Transaction" WHERE "userId" IN (${idList})`);
      log(`   → ${transactionsResult.rowCount} transactions deleted`, 'cyan');

      log('5. Deleting Payment Confirmations...', 'yellow');
      const confirmations = await pool.query(`
        DELETE FROM "PaymentConfirmation"
        WHERE "paymentRequestId" IN (
          SELECT id FROM "PaymentRequest" WHERE "userId" IN (${idList})
        )
      `);
      log(`   → ${confirmations.rowCount} confirmations deleted`, 'cyan');

      log('6. Deleting Payment Webhooks...', 'yellow');
      const webhooks = await pool.query(`
        DELETE FROM "PaymentWebhook"
        WHERE "paymentRequestId" IN (
          SELECT id FROM "PaymentRequest" WHERE "userId" IN (${idList})
        )
      `);
      log(`   → ${webhooks.rowCount} webhooks deleted`, 'cyan');

      log('7. Deleting Payment Requests...', 'yellow');
      const paymentResult = await pool.query(`DELETE FROM "PaymentRequest" WHERE "userId" IN (${idList})`);
      log(`   → ${paymentResult.rowCount} payment requests deleted`, 'cyan');

      log('8. Deleting Bot Activations...', 'yellow');
      const botsResult = await pool.query(`DELETE FROM "BotActivation" WHERE "userId" IN (${idList})`);
      log(`   → ${botsResult.rowCount} bot activations deleted`, 'cyan');

      log('9. Deleting Packages...', 'yellow');
      const packagesResult = await pool.query(`DELETE FROM "Package" WHERE "userId" IN (${idList})`);
      log(`   → ${packagesResult.rowCount} packages deleted`, 'cyan');

      log('10. Deleting KYC Submissions...', 'yellow');
      const kycResult = await pool.query(`DELETE FROM "KYCSubmission" WHERE "userId" IN (${idList})`);
      log(`   → ${kycResult.rowCount} KYC submissions deleted`, 'cyan');

      log('11. Deleting Support Tickets...', 'yellow');
      const ticketsResult = await pool.query(`DELETE FROM "SupportTicket" WHERE "userId" IN (${idList})`);
      log(`   → ${ticketsResult.rowCount} tickets deleted`, 'cyan');

      log('12. Deleting Sessions...', 'yellow');
      const sessionsResult = await pool.query(`DELETE FROM "Session" WHERE "userId" IN (${idList})`);
      log(`   → ${sessionsResult.rowCount} sessions deleted`, 'cyan');

      log('13. Deleting Audit Logs...', 'yellow');
      const auditResult = await pool.query(`DELETE FROM "AuditLog" WHERE "userId" IN (${idList})`);
      log(`   → ${auditResult.rowCount} audit logs deleted`, 'cyan');

      log('14. Deleting Users...', 'yellow');
      const usersResult = await pool.query(`DELETE FROM "User" WHERE id IN (${idList})`);
      log(`   → ${usersResult.rowCount} users deleted`, 'cyan');

      // Commit
      await pool.query('COMMIT');

      log('\n✅ CLEANUP COMPLETED SUCCESSFULLY!\n', 'green');

      // Show final stats
      const finalUsers = await pool.query('SELECT COUNT(*) as count FROM "User"');
      const finalPackages = await pool.query('SELECT COUNT(*) as count FROM "Package"');
      const finalTransactions = await pool.query('SELECT COUNT(*) as count FROM "Transaction"');
      const finalEarnings = await pool.query('SELECT COUNT(*) as count FROM "Earning"');

      log('━━━ FINAL DATABASE STATUS ━━━\n', 'cyan');
      log(`Users: ${finalUsers.rows[0].count}`, 'green');
      log(`Packages: ${finalPackages.rows[0].count}`, 'green');
      log(`Transactions: ${finalTransactions.rows[0].count}`, 'green');
      log(`Earnings: ${finalEarnings.rows[0].count}`, 'green');

      log('\n✓ Database is now clean - Only admin account remains\n', 'green');

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

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
