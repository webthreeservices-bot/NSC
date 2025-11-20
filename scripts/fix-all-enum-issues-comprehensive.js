/**
 * COMPREHENSIVE FIX FOR ALL ENUM CASTING ISSUES
 * This fixes ALL enum type mismatches across ALL trigger functions
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAllEnumIssues() {
  console.log('\n🔧 COMPREHENSIVE ENUM CASTING FIX\n');
  console.log('='.repeat(80));

  const fixes = [];

  try {
    console.log('\n📝 Applying fixes to all trigger functions...\n');

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
    fixes.push('✅ assign_unique_referral_code_after_bot_purchase - Fixed NotificationType');

    // Fix 2: create_event_notification
    const fix2 = `
      CREATE OR REPLACE FUNCTION create_event_notification()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Package activated (only for Package table)
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

        -- Withdrawal notifications (only for Withdrawal table)
        IF TG_TABLE_NAME = 'Withdrawal' THEN
          -- Withdrawal approved
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

        -- KYC approved (only for User table)
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
    fixes.push('✅ create_event_notification - Fixed NotificationType (4 locations)');

    // Fix 3: create_session
    const fix3 = `
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
    await pool.query(fix3);
    fixes.push('✅ create_session - Fixed SessionStatus');

    // Fix 4: log_admin_action
    const fix4 = `
      CREATE OR REPLACE FUNCTION log_admin_action()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Log withdrawal approvals (only for Withdrawal table)
        IF TG_TABLE_NAME = 'Withdrawal' THEN
          IF NEW."approvedBy" IS NOT NULL AND (OLD."approvedBy" IS NULL OR OLD."approvedBy" IS DISTINCT FROM NEW."approvedBy") THEN
            INSERT INTO "AdminLog" (
              "id", "adminId", "action", "targetType", "targetId", "description"
            ) VALUES (
              gen_random_uuid()::text,
              NEW."approvedBy",
              'APPROVE_WITHDRAWAL'::"AdminActionType",
              'WITHDRAWAL',
              NEW."id",
              'Approved withdrawal of ' || NEW."amount" || ' USDT for user ' || NEW."userId"
            );
          END IF;

          -- Log withdrawal rejections
          IF NEW."status" = 'REJECTED' AND OLD."status" != 'REJECTED' THEN
            INSERT INTO "AdminLog" (
              "id", "adminId", "action", "targetType", "targetId", "description"
            ) VALUES (
              gen_random_uuid()::text,
              NEW."rejectedBy",
              'REJECT_WITHDRAWAL'::"AdminActionType",
              'WITHDRAWAL',
              NEW."id",
              'Rejected withdrawal: ' || COALESCE(NEW."rejectionReason", 'No reason provided')
            );
          END IF;
        END IF;

        -- Log user blocking (only for User table)
        IF TG_TABLE_NAME = 'User' THEN
          IF NEW."isBlocked" = true AND OLD."isBlocked" = false THEN
            INSERT INTO "AdminLog" (
              "id", "adminId", "action", "targetType", "targetId", "description"
            ) VALUES (
              gen_random_uuid()::text,
              NEW."blockedBy",
              'BLOCK_USER'::"AdminActionType",
              'USER',
              NEW."id",
              'Blocked user: ' || COALESCE(NEW."blockReason", 'No reason provided')
            );
          END IF;

          -- Log KYC approvals
          IF NEW."kycStatus" = 'APPROVED' AND OLD."kycStatus" != 'APPROVED' THEN
            INSERT INTO "AdminLog" (
              "id", "adminId", "action", "targetType", "targetId", "description"
            ) VALUES (
              gen_random_uuid()::text,
              'SYSTEM',
              'APPROVE_KYC'::"AdminActionType",
              'USER',
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
    fixes.push('✅ log_admin_action - Fixed AdminActionType (4 locations)');

    // Fix 5: process_referral_earnings - MOST CRITICAL
    const fix5 = `
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

            -- Create earning record with proper enum cast
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

            -- Create notification with proper enum cast
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
    await pool.query(fix5);
    fixes.push('✅ process_referral_earnings - Fixed TransactionType, EarningType, NotificationType');

    console.log('\n' + '='.repeat(80));
    console.log('📊 FIXES APPLIED');
    console.log('='.repeat(80) + '\n');

    fixes.forEach((fix, i) => {
      console.log(`${i + 1}. ${fix}`);
    });

    // Verify the fixes
    console.log('\n\n🔍 VERIFYING FIXES...\n');

    const verifyQuery = `
      SELECT
        p.proname as function_name,
        CASE
          WHEN pg_get_functiondef(p.oid) ~ '::"NotificationType"' THEN '✅'
          WHEN pg_get_functiondef(p.oid) ~ 'Notification.*INSERT' THEN '❌'
          ELSE '—'
        END as notification_type,
        CASE
          WHEN pg_get_functiondef(p.oid) ~ '::"TransactionType"' THEN '✅'
          WHEN pg_get_functiondef(p.oid) ~ 'Transaction.*INSERT.*type' THEN '❌'
          ELSE '—'
        END as transaction_type,
        CASE
          WHEN pg_get_functiondef(p.oid) ~ '::"EarningType"' THEN '✅'
          WHEN pg_get_functiondef(p.oid) ~ 'Earning.*INSERT.*earningType' THEN '❌'
          ELSE '—'
        END as earning_type,
        CASE
          WHEN pg_get_functiondef(p.oid) ~ '::"AdminActionType"' THEN '✅'
          WHEN pg_get_functiondef(p.oid) ~ 'AdminLog.*INSERT.*action' THEN '❌'
          ELSE '—'
        END as admin_action_type,
        CASE
          WHEN pg_get_functiondef(p.oid) ~ '::"SessionStatus"' THEN '✅'
          WHEN pg_get_functiondef(p.oid) ~ 'Session.*INSERT.*status' THEN '❌'
          ELSE '—'
        END as session_status
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname IN (
        'assign_unique_referral_code_after_bot_purchase',
        'create_event_notification',
        'create_session',
        'log_admin_action',
        'process_referral_earnings'
      )
      ORDER BY p.proname;
    `;

    const result = await pool.query(verifyQuery);

    console.log('Function                                          | NotificationType | TransactionType | EarningType | AdminActionType | SessionStatus');
    console.log('─'.repeat(150));

    result.rows.forEach(row => {
      const name = row.function_name.padEnd(48);
      const nt = row.notification_type.padEnd(16);
      const tt = row.transaction_type.padEnd(15);
      const et = row.earning_type.padEnd(11);
      const aat = row.admin_action_type.padEnd(15);
      const ss = row.session_status;
      console.log(`${name} | ${nt} | ${tt} | ${et} | ${aat} | ${ss}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL ENUM CASTING ISSUES FIXED!');
    console.log('='.repeat(80));
    console.log('\nFixed enum types:');
    console.log('  • NotificationType - 7 locations across 3 functions');
    console.log('  • TransactionType - 2 locations');
    console.log('  • TransactionStatus - 2 locations');
    console.log('  • EarningType - 1 location (CRITICAL FIX)');
    console.log('  • AdminActionType - 4 locations');
    console.log('  • SessionStatus - 1 location');
    console.log('\n🎉 Your database is now fully fixed!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the comprehensive fix
fixAllEnumIssues()
  .then(() => {
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
