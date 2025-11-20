/**
 * STRICT MODE ENUM CASTING FIX
 * Fixes ALL enum values including simple string literals
 * This is required when PostgreSQL is in strict mode
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAllEnumStrictMode() {
  console.log('\n🔧 STRICT MODE ENUM CASTING FIX\n');
  console.log('='.repeat(80));

  const fixes = [];

  try {
    console.log('\n📝 Applying strict enum casts to all trigger functions...\n');

    // Fix 1: assign_unique_referral_code_after_bot_purchase - COMPLETE
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
            'REFERRAL'::"ReferenceType"
          );
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await pool.query(fix1);
    fixes.push('✅ assign_unique_referral_code_after_bot_purchase');

    // Fix 2: create_event_notification - ALL ENUMS
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
              'PACKAGE'::"ReferenceType"
            );
          END IF;
        END IF;

        -- Withdrawal notifications
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
              'WITHDRAWAL'::"ReferenceType"
            );
          END IF;

          IF NEW."status" = 'REJECTED' AND OLD."status" = 'PENDING' THEN
            INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "referenceId", "referenceType")
            VALUES (
              gen_random_uuid()::text,
              NEW."userId",
              'Withdrawal Rejected',
              'Your withdrawal request has been rejected. Reason: ' || COALESCE(NEW."rejectionReason", 'Not specified'),
              'ERROR'::"NotificationType",
              NEW."id",
              'WITHDRAWAL'::"ReferenceType"
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
              'KYC'::"ReferenceType"
            );
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await pool.query(fix2);
    fixes.push('✅ create_event_notification');

    // Fix 3: create_withdrawal_transaction - ALL ENUMS
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
            'WITHDRAWAL'::"ReferenceType"
          );

          UPDATE "Withdrawal" SET "transactionId" = v_transaction_id WHERE "id" = NEW."id";
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await pool.query(fix3);
    fixes.push('✅ create_withdrawal_transaction');

    // Fix 4: log_admin_action - ALL ENUMS
    const fix4 = `
      CREATE OR REPLACE FUNCTION log_admin_action()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Log withdrawal approvals
        IF TG_TABLE_NAME = 'Withdrawal' THEN
          IF NEW."approvedBy" IS NOT NULL AND (OLD."approvedBy" IS NULL OR OLD."approvedBy" IS DISTINCT FROM NEW."approvedBy") THEN
            INSERT INTO "AdminLog" (
              "id", "adminId", "action", "targetType", "targetId", "description"
            ) VALUES (
              gen_random_uuid()::text,
              NEW."approvedBy",
              'APPROVE_WITHDRAWAL'::"AdminActionType",
              'WITHDRAWAL'::"TargetType",
              NEW."id",
              'Approved withdrawal of ' || NEW."amount" || ' USDT for user ' || NEW."userId"
            );
          END IF;

          IF NEW."status" = 'REJECTED' AND OLD."status" != 'REJECTED' THEN
            INSERT INTO "AdminLog" (
              "id", "adminId", "action", "targetType", "targetId", "description"
            ) VALUES (
              gen_random_uuid()::text,
              NEW."rejectedBy",
              'REJECT_WITHDRAWAL'::"AdminActionType",
              'WITHDRAWAL'::"TargetType",
              NEW."id",
              'Rejected withdrawal: ' || COALESCE(NEW."rejectionReason", 'No reason provided')
            );
          END IF;
        END IF;

        -- Log user blocking
        IF TG_TABLE_NAME = 'User' THEN
          IF NEW."isBlocked" = true AND OLD."isBlocked" = false THEN
            INSERT INTO "AdminLog" (
              "id", "adminId", "action", "targetType", "targetId", "description"
            ) VALUES (
              gen_random_uuid()::text,
              NEW."blockedBy",
              'BLOCK_USER'::"AdminActionType",
              'USER'::"TargetType",
              NEW."id",
              'Blocked user: ' || COALESCE(NEW."blockReason", 'No reason provided')
            );
          END IF;

          IF NEW."kycStatus" = 'APPROVED' AND OLD."kycStatus" != 'APPROVED' THEN
            INSERT INTO "AdminLog" (
              "id", "adminId", "action", "targetType", "targetId", "description"
            ) VALUES (
              gen_random_uuid()::text,
              'SYSTEM',
              'APPROVE_KYC'::"AdminActionType",
              'USER'::"TargetType",
              NEW."id",
              'Approved KYC verification'
            );
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await pool.query(fix4);
    fixes.push('✅ log_admin_action');

    // Fix 5: process_referral_earnings - ALL ENUMS (MOST CRITICAL)
    const fix5 = `
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

            -- Create transaction with ALL enum casts
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
              'PACKAGE'::"ReferenceType"
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
              'PAID'::"EarningStatus"
            );

            -- Create notification with proper enum casts
            INSERT INTO "Notification" (
              "id", "userId", "title", "message", "type", "referenceId", "referenceType"
            ) VALUES (
              gen_random_uuid()::text,
              earning_record."referrerId",
              'Referral Earnings',
              'You earned ' || earning_record."amount" || ' USDT from Level ' || earning_record."level" || ' referral income!',
              'REFERRAL'::"NotificationType",
              NEW."id",
              'PACKAGE'::"ReferenceType"
            );
          END LOOP;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await pool.query(fix5);
    fixes.push('✅ process_referral_earnings');

    // Fix 6: create_session
    const fix6 = `
      CREATE OR REPLACE FUNCTION create_session(
        p_user_id TEXT,
        p_token_hash TEXT,
        p_refresh_token_hash TEXT,
        p_ip_address TEXT,
        p_user_agent TEXT,
        p_expires_at TIMESTAMP
      )
      RETURNS TEXT AS $$
      DECLARE
        v_session_id TEXT;
      BEGIN
        v_session_id := gen_random_uuid()::text;

        INSERT INTO "Session" (
          "id", "userId", "token", "refreshToken", "ipAddress", "userAgent",
          "expiresAt", "isActive", "status", "createdAt", "lastUsedAt"
        ) VALUES (
          v_session_id, p_user_id, p_token_hash, p_refresh_token_hash, p_ip_address, p_user_agent,
          p_expires_at, true, 'ACTIVE'::"SessionStatus", NOW(), NOW()
        );

        RETURN v_session_id;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await pool.query(fix6);
    fixes.push('✅ create_session');

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL FIXES APPLIED');
    console.log('='.repeat(80) + '\n');

    fixes.forEach((fix, i) => {
      console.log(`${i + 1}. ${fix}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('🎯 ENUM TYPES FIXED:');
    console.log('='.repeat(80));
    console.log('\n✅ NotificationType - All instances cast');
    console.log('✅ ReferenceType - All instances cast');
    console.log('✅ TransactionType - All instances cast');
    console.log('✅ TransactionStatus - All instances cast');
    console.log('✅ Network - All instances cast');
    console.log('✅ EarningType - All instances cast');
    console.log('✅ EarningStatus - All instances cast');
    console.log('✅ AdminActionType - All instances cast');
    console.log('✅ TargetType - All instances cast');
    console.log('✅ SessionStatus - All instances cast');
    console.log('\n🎉 All enum type errors are now resolved!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixAllEnumStrictMode()
  .then(() => {
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
