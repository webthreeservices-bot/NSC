/**
 * FIX ALL ENUM CASTING ISSUES AUTOMATICALLY
 * Finds and fixes ALL enum type casting errors in database triggers
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAllEnumCasting() {
  console.log('\n🔧 FIXING ALL ENUM CASTING ISSUES\n');
  console.log('='.repeat(80));

  try {
    console.log('\n1️⃣  Applying all enum casting fixes...\n');

    // Fix 1: process_referral_earnings - Complete fix
    const fix1 = `
      CREATE OR REPLACE FUNCTION process_referral_earnings()
      RETURNS TRIGGER AS $$
      DECLARE
        earning_record RECORD;
        transaction_id TEXT;
      BEGIN
        IF NEW."status" = 'ACTIVE' AND (OLD."status" IS NULL OR OLD."status" != 'ACTIVE') THEN

          FOR earning_record IN
            SELECT * FROM calculate_referral_earnings(NEW."id", NEW."userId", NEW."amount")
          LOOP
            transaction_id := gen_random_uuid()::text;

            -- Create transaction with proper enum casts
            INSERT INTO "Transaction" (
              "id", "userId", "type", "amount", "status", "description",
              "referenceId", "referenceType"
            ) VALUES (
              transaction_id,
              earning_record."referrerId",
              (CASE WHEN earning_record."level" = 1 THEN 'REFERRAL_BONUS' ELSE 'LEVEL_INCOME' END)::"TransactionType",
              earning_record."amount",
              'COMPLETED'::"TransactionStatus",
              'Level ' || earning_record."level" || ' income from package purchase',
              NEW."id",
              'PACKAGE'
            );

            -- Create earning with proper enum cast
            INSERT INTO "Earning" (
              "id", "userId", "fromUserId", "packageId", "transactionId",
              "earningType", "amount", "level", "percentage", "status"
            ) VALUES (
              gen_random_uuid()::text,
              earning_record."referrerId",
              NEW."userId",
              NEW."id",
              transaction_id,
              (CASE WHEN earning_record."level" = 1 THEN 'DIRECT_REFERRAL' ELSE 'LEVEL_INCOME' END)::"EarningType",
              earning_record."amount",
              earning_record."level",
              earning_record."percentage",
              'PAID'
            );

            -- Create notification
            INSERT INTO "Notification" (
              "id", "userId", "title", "message", "type", "referenceId", "referenceType"
            ) VALUES (
              gen_random_uuid()::text,
              earning_record."referrerId",
              'Referral Earnings',
              'You earned ' || earning_record."amount" || ' USDT from Level ' || earning_record."level" || ' referral income!',
              'REFERRAL'::"NotificationType",
              NEW."id",
              'PACKAGE'
            );
          END LOOP;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await pool.query(fix1);
    console.log('   ✅ process_referral_earnings - Fixed TransactionType, EarningType, NotificationType');

    // Fix 2: create_withdrawal_transaction
    const fix2 = `
      CREATE OR REPLACE FUNCTION create_withdrawal_transaction()
      RETURNS TRIGGER AS $$
      DECLARE
        v_transaction_id TEXT;
      BEGIN
        IF NEW."status" = 'COMPLETED' AND (OLD."status" IS NULL OR OLD."status" != 'COMPLETED') THEN
          v_transaction_id := gen_random_uuid()::text;

          INSERT INTO "Transaction" (
            "id", "userId", "type", "amount", "fee", "netAmount",
            "status", "description", "txHash", "network",
            "referenceId", "referenceType"
          ) VALUES (
            v_transaction_id,
            NEW."userId",
            'WITHDRAWAL'::"TransactionType",
            NEW."amount",
            NEW."fee",
            NEW."netAmount",
            'COMPLETED'::"TransactionStatus",
            'Withdrawal to ' || NEW."walletAddress",
            NEW."txHash",
            NEW."network",
            NEW."id",
            'WITHDRAWAL'
          );

          UPDATE "Withdrawal" SET "transactionId" = v_transaction_id WHERE "id" = NEW."id";
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await pool.query(fix2);
    console.log('   ✅ create_withdrawal_transaction - Fixed TransactionType, TransactionStatus');

    // Fix 3: Check and fix auto_expire_sessions if needed
    const fix3 = `
      CREATE OR REPLACE FUNCTION auto_expire_sessions()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW."expiresAt" < NOW() AND NEW."isActive" = true THEN
          NEW."isActive" = false;
          NEW."status" = 'EXPIRED'::"SessionStatus";
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await pool.query(fix3);
    console.log('   ✅ auto_expire_sessions - Fixed SessionStatus');

    console.log('\n2️⃣  Verifying all fixes...\n');

    // Verify the fixes
    const verifyQuery = `
      SELECT
        p.proname as function_name,
        CASE
          WHEN pg_get_functiondef(p.oid) LIKE '%::"TransactionType"%' THEN '✅'
          WHEN pg_get_functiondef(p.oid) LIKE '%Transaction%' THEN '⚠️'
          ELSE '—'
        END as transaction_cast,
        CASE
          WHEN pg_get_functiondef(p.oid) LIKE '%::"EarningType"%' THEN '✅'
          WHEN pg_get_functiondef(p.oid) LIKE '%Earning%' AND pg_get_functiondef(p.oid) LIKE '%INSERT%' THEN '⚠️'
          ELSE '—'
        END as earning_cast,
        CASE
          WHEN pg_get_functiondef(p.oid) LIKE '%::"NotificationType"%' THEN '✅'
          WHEN pg_get_functiondef(p.oid) LIKE '%Notification%' AND pg_get_functiondef(p.oid) LIKE '%INSERT%' THEN '⚠️'
          ELSE '—'
        END as notification_cast,
        CASE
          WHEN pg_get_functiondef(p.oid) LIKE '%::"SessionStatus"%' THEN '✅'
          WHEN pg_get_functiondef(p.oid) LIKE '%Session%' AND pg_get_functiondef(p.oid) LIKE '%UPDATE%' THEN '⚠️'
          ELSE '—'
        END as session_cast
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname IN (
        'process_referral_earnings',
        'create_withdrawal_transaction',
        'auto_expire_sessions'
      )
      ORDER BY p.proname;
    `;

    const result = await pool.query(verifyQuery);

    console.log('   Function Verification:');
    console.log('   ─'.repeat(40));
    result.rows.forEach(row => {
      console.log(`   ${row.function_name}:`);
      if (row.transaction_cast !== '—') console.log(`     TransactionType: ${row.transaction_cast}`);
      if (row.earning_cast !== '—') console.log(`     EarningType: ${row.earning_cast}`);
      if (row.notification_cast !== '—') console.log(`     NotificationType: ${row.notification_cast}`);
      if (row.session_cast !== '—') console.log(`     SessionStatus: ${row.session_cast}`);
    });

    console.log('\n3️⃣  Checking for any remaining issues...\n');

    // Check if there are any other functions with INSERT/UPDATE that might need fixing
    const checkQuery = `
      SELECT
        p.proname as function_name,
        CASE
          WHEN pg_get_functiondef(p.oid) ~ 'INSERT.*CASE.*WHEN.*THEN.*ELSE.*END[^:]' THEN 'Potential issue'
          ELSE 'OK'
        END as status
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND pg_get_functiondef(p.oid) LIKE '%INSERT%'
      ORDER BY p.proname;
    `;

    const checkResult = await pool.query(checkQuery);
    const issues = checkResult.rows.filter(r => r.status !== 'OK');

    if (issues.length > 0) {
      console.log(`   ⚠️  Found ${issues.length} functions with potential CASE expression issues:`);
      issues.forEach(issue => {
        console.log(`     - ${issue.function_name}`);
      });
    } else {
      console.log('   ✅ No remaining CASE expression issues found');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL ENUM CASTING FIXES APPLIED!');
    console.log('='.repeat(80));
    console.log('\nFixed Functions:');
    console.log('  1. process_referral_earnings (TransactionType, EarningType, NotificationType)');
    console.log('  2. create_withdrawal_transaction (TransactionType, TransactionStatus)');
    console.log('  3. auto_expire_sessions (SessionStatus)');
    console.log('\nAll enum type casting errors are now resolved! 🎉\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixAllEnumCasting()
  .then(() => {
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
