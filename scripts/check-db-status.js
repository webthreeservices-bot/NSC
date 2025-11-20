/**
 * Quick Database Status Check
 * Verifies if any SQL commands need to be run
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkStatus() {
  console.log('\n🔍 CHECKING NEON DATABASE STATUS\n');
  console.log('='.repeat(80));

  try {
    // Check trigger function
    const functionQuery = `
      SELECT pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'update_user_bot_purchase_status';
    `;

    const result = await pool.query(functionQuery);

    if (result.rows.length === 0) {
      console.log('❌ CRITICAL: Trigger function not found!');
      console.log('   Action: Run the SQL from fix-bot-activation-trigger.sql\n');
      return false;
    }

    const definition = result.rows[0].definition;

    console.log('✅ Trigger function exists\n');
    console.log('Checking for issues...\n');

    // Check for PENDING reference
    if (definition.includes("IN ('ACTIVE', 'PENDING')")) {
      console.log('❌ ISSUE FOUND: Trigger checks for PENDING status!');
      console.log('   This will cause errors when activating bots.\n');
      console.log('   Action Required: Run SQL fix script\n');
      return false;
    }

    if (definition.includes("= 'ACTIVE'") && !definition.includes("'PENDING'")) {
      console.log('✅ TRIGGER IS CORRECT!');
      console.log('   Function only checks for ACTIVE status\n');
    }

    // Check BotStatus enum
    const enumQuery = `
      SELECT e.enumlabel as value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'BotStatus'
      ORDER BY e.enumsortorder;
    `;

    const enumResult = await pool.query(enumQuery);
    const enumValues = enumResult.rows.map(r => r.value);

    console.log('✅ BotStatus enum values:');
    console.log(`   ${enumValues.join(', ')}\n`);

    if (enumValues.includes('PENDING')) {
      console.log('⚠️  PENDING exists in enum (unexpected)');
    } else {
      console.log('✅ No PENDING in enum (correct)\n');
    }

    // Check sample bot data
    const dataQuery = `
      SELECT id, "botType", status, "activationDate", "expiryDate", network
      FROM "BotActivation"
      ORDER BY "createdAt" DESC
      LIMIT 1;
    `;

    const dataResult = await pool.query(dataQuery);

    if (dataResult.rows.length > 0) {
      const bot = dataResult.rows[0];
      console.log('✅ Sample bot data:');
      console.log(`   Type: ${bot.botType}`);
      console.log(`   Status: ${bot.status}`);
      console.log(`   Activation: ${bot.activationDate ? 'Has Date ✅' : 'NULL ❌'}`);
      console.log(`   Expiry: ${bot.expiryDate ? 'Has Date ✅' : 'NULL ❌'}`);
      console.log(`   Network: ${bot.network || 'NULL'}\n`);
    } else {
      console.log('ℹ️  No bot activations in database yet\n');
    }

    console.log('='.repeat(80));
    console.log('📊 FINAL STATUS');
    console.log('='.repeat(80));
    console.log('\n✅ DATABASE IS READY!');
    console.log('   No SQL commands need to be run.\n');
    console.log('You can now:');
    console.log('   1. Start your application');
    console.log('   2. Try activating a bot');
    console.log('   3. Check /bots page for dates\n');

    return true;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

checkStatus()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
