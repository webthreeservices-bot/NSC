/**
 * FIX ENUM TYPE CASTING IN TRIGGERS
 *
 * Fixes the error: column "type" is of type "TransactionType" but expression is of type text
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixEnumCasting() {
  console.log('\n🔧 FIXING ENUM TYPE CASTING IN TRIGGERS\n');
  console.log('='.repeat(80));

  try {
    // Fix process_referral_earnings trigger
    console.log('\n1️⃣  Fixing process_referral_earnings function...\n');

    const fixReferralEarnings = `
      CREATE OR REPLACE FUNCTION process_referral_earnings()
      RETURNS TRIGGER AS $$
      DECLARE
        earning_record RECORD;
        transaction_id TEXT;
      BEGIN
        -- Only process when package becomes ACTIVE
        IF NEW."status" = 'ACTIVE' AND (OLD."status" IS NULL OR OLD."status" != 'ACTIVE') THEN

          -- Calculate and create earnings for referral chain
          FOR earning_record IN
            SELECT * FROM calculate_referral_earnings(NEW."id", NEW."userId", NEW."amount")
          LOOP
            -- Create transaction record
            transaction_id := gen_random_uuid()::text;

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

            -- Create earning record
            INSERT INTO "Earning" (
              "id", "userId", "fromUserId", "packageId", "transactionId",
              "earningType", "amount", "level", "percentage", "status"
            ) VALUES (
              gen_random_uuid()::text,
              earning_record."referrerId",
              NEW."userId",
              NEW."id",
              transaction_id,
              CASE WHEN earning_record."level" = 1 THEN 'DIRECT_REFERRAL' ELSE 'LEVEL_INCOME' END,
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
              'REFERRAL',
              NEW."id",
              'PACKAGE'
            );
          END LOOP;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await pool.query(fixReferralEarnings);
    console.log('   ✅ process_referral_earnings fixed');

    // Fix create_withdrawal_transaction trigger
    console.log('\n2️⃣  Fixing create_withdrawal_transaction function...\n');

    const fixWithdrawalTransaction = `
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

          -- Link transaction to withdrawal
          UPDATE "Withdrawal" SET "transactionId" = v_transaction_id WHERE "id" = NEW."id";
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await pool.query(fixWithdrawalTransaction);
    console.log('   ✅ create_withdrawal_transaction fixed');

    // Verify fixes
    console.log('\n3️⃣  Verifying fixes...\n');

    const verifyQuery = `
      SELECT
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname IN ('process_referral_earnings', 'create_withdrawal_transaction');
    `;

    const result = await pool.query(verifyQuery);

    result.rows.forEach(row => {
      const hasCasting = row.definition.includes('::"TransactionType"') &&
                         row.definition.includes('::"TransactionStatus"');

      if (hasCasting) {
        console.log(`   ✅ ${row.function_name} - Type casting PRESENT`);
      } else {
        console.log(`   ❌ ${row.function_name} - Type casting MISSING`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ ENUM CASTING FIX APPLIED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log('\nYou can now:');
    console.log('1. Try package approval again');
    console.log('2. Test referral earnings');
    console.log('3. Test withdrawal completion\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run fix
fixEnumCasting()
  .then(() => {
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
