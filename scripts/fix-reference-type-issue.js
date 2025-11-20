/**
 * FIX REFERENCETYPE ENUM ISSUE
 * The ReferenceType enum doesn't exist - referenceType is just TEXT
 * Remove all incorrect enum casts
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixReferenceTypeIssue() {
  console.log('\n🔧 FIXING REFERENCETYPE ENUM ISSUE\n');
  console.log('='.repeat(80));

  try {
    console.log('\n✅ IMPORTANT: referenceType is a TEXT field, not an enum!\n');
    console.log('Removing incorrect ::"ReferenceType" casts from trigger functions...\n');

    // Fix 1: assign_unique_referral_code_after_bot_purchase
    const fix1 = `
      CREATE OR REPLACE FUNCTION assign_unique_referral_code_after_bot_purchase()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW."status" = 'ACTIVE' AND (OLD IS NULL OR OLD."status" != 'ACTIVE') THEN
          UPDATE "User" SET "hasPurchasedBot" = true WHERE "id" = NEW."userId";

          INSERT INTO "Notification" (
            "id", "userId", "title", "message", "type", "referenceType"
          ) VALUES (
            gen_random_uuid()::text,
            NEW."userId",
            'Referral Code Activated',
            'Congratulations! You can now earn referral and direct income from your referrals!',
            'SUCCESS'::"NotificationType",
            'REFERRAL'
          );
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await pool.query(fix1);
    console.log('   ✅ assign_unique_referral_code_after_bot_purchase');

    // Fix 2: create_event_notification
    const fix2 = `
      CREATE OR REPLACE FUNCTION create_event_notification()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Package activated
        IF TG_TABLE_NAME = 'Package' THEN
          IF NEW."status" = 'ACTIVE' AND OLD."status" = 'PENDING' THEN
            INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "referenceId", "referenceType")
            VALUES (
              gen_random_uuid()::text,
              NEW."userId",
              'Package Activated',
              'Your ' || NEW."packageType" || ' package has been activated successfully!',
              'SUCCESS'::"NotificationType",
              NEW."id",
              'PACKAGE'
            );
          END IF;
        END IF;

        -- Withdrawal approved
        IF TG_TABLE_NAME = 'Withdrawal' THEN
          IF NEW."status" = 'APPROVED' AND OLD."status" = 'PENDING' THEN
            INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "referenceId", "referenceType")
            VALUES (
              gen_random_uuid()::text,
              NEW."userId",
              'Withdrawal Approved',
              'Your withdrawal request of ' || NEW."amount" || ' USDT has been approved!',
              'SUCCESS'::"NotificationType",
              NEW."id",
              'WITHDRAWAL'
            );
          END IF;

          -- Withdrawal rejected
          IF NEW."status" = 'REJECTED' AND OLD."status" = 'PENDING' THEN
            INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "referenceId", "referenceType")
            VALUES (
              gen_random_uuid()::text,
              NEW."userId",
              'Withdrawal Rejected',
              'Your withdrawal request has been rejected. Reason: ' || COALESCE(NEW."rejectionReason", 'Not specified'),
              'ERROR'::"NotificationType",
              NEW."id",
              'WITHDRAWAL'
            );
          END IF;
        END IF;

        -- KYC approved
        IF TG_TABLE_NAME = 'User' THEN
          IF NEW."kycStatus" = 'APPROVED' AND OLD."kycStatus" != 'APPROVED' THEN
            INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "referenceType")
            VALUES (
              gen_random_uuid()::text,
              NEW."id",
              'KYC Approved',
              'Your KYC verification has been approved!',
              'SUCCESS'::"NotificationType",
              'KYC'
            );
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await pool.query(fix2);
    console.log('   ✅ create_event_notification');

    // Fix 3: create_withdrawal_transaction
    const fix3 = `
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
            NEW."network"::"Network",
            NEW."id",
            'WITHDRAWAL'
          );

          UPDATE "Withdrawal" SET "transactionId" = v_transaction_id WHERE "id" = NEW."id";
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await pool.query(fix3);
    console.log('   ✅ create_withdrawal_transaction');

    // Fix 4: process_referral_earnings
    const fix4 = `
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

            -- Create transaction with proper casts
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
    await pool.query(fix4);
    console.log('   ✅ process_referral_earnings');

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL REFERENCETYPE CASTS REMOVED');
    console.log('='.repeat(80));
    console.log('\nreferenceType is now correctly treated as TEXT field');
    console.log('All trigger functions updated successfully!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}

fixReferenceTypeIssue()
  .then(() => {
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
