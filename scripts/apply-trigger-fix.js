/**
 * Apply Trigger Fix to Live Database
 *
 * This ensures the trigger function is correct
 * Run with: node scripts/apply-trigger-fix.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

async function applyTriggerFix() {
  console.log('\n🔧 APPLYING TRIGGER FIX TO LIVE DATABASE\n');
  console.log('='.repeat(80));

  const fixSQL = `
    CREATE OR REPLACE FUNCTION update_user_bot_purchase_status()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Only check for ACTIVE status (PENDING is not valid for BotStatus enum)
      IF NEW."status" = 'ACTIVE' THEN
        UPDATE "User"
        SET "hasPurchasedBot" = true
        WHERE "id" = NEW."userId"
        AND "hasPurchasedBot" = false;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    console.log('Applying fix...\n');
    await pool.query(fixSQL);
    console.log('✅ Trigger function updated successfully!\n');

    // Verify the update
    const verifyQuery = `
      SELECT pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'update_user_bot_purchase_status';
    `;

    const result = await pool.query(verifyQuery);

    console.log('📋 Updated function definition:\n');
    console.log(result.rows[0].definition);
    console.log('\n');

    // Check if PENDING is used in the actual logic (not in comments)
    const hasInvalidPendingCheck = result.rows[0].definition.includes("IN ('ACTIVE', 'PENDING')") ||
                                    result.rows[0].definition.includes('= \'PENDING\'');

    if (hasInvalidPendingCheck) {
      console.log('❌ ERROR: Function still has invalid PENDING check!');
      return false;
    } else {
      console.log('✅ VERIFIED: Function only checks for ACTIVE status\n');
      console.log('✅ Fix applied successfully!');
      return true;
    }

  } catch (error) {
    console.error('❌ Error applying trigger fix:', error.message);
    console.error(error.stack);
    return false;
  }
}

async function main() {
  console.log('\n🚀 TRIGGER FIX APPLICATOR');
  console.log('='.repeat(80));

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    const success = await applyTriggerFix();

    if (success) {
      console.log('\n' + '='.repeat(80));
      console.log('✅ ALL DONE! Trigger is now fixed.');
      console.log('='.repeat(80));
      console.log('\nYou can now:');
      console.log('1. Try activating a bot again');
      console.log('2. The error should be gone');
      console.log('3. Check /bots page for activation dates\n');
    } else {
      console.log('\n❌ Fix failed. Please check the errors above.\n');
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
  } finally {
    await pool.end();
    console.log('🔌 Connection closed\n');
    process.exit(0);
  }
}

main();
