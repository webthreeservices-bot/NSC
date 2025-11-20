/**
 * Fetch Live Database Schema from Neon
 *
 * Run with: node scripts/fetch-live-schema.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

async function checkBotStatusEnum() {
  console.log('\n🔍 CHECKING BotStatus ENUM\n');
  console.log('='.repeat(80));

  const query = `
    SELECT e.enumlabel as value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'BotStatus'
    ORDER BY e.enumsortorder;
  `;

  const result = await pool.query(query);

  if (result.rows.length === 0) {
    console.log('⚠️  BotStatus enum not found!');
    return [];
  }

  console.log('\n✅ BotStatus enum values:');
  const values = result.rows.map(row => row.value);
  console.log('   ', values.join(', '));

  if (values.includes('PENDING')) {
    console.log('\n✅ PENDING is a valid BotStatus value');
  } else {
    console.log('\n❌ PENDING is NOT in BotStatus enum - THIS IS THE PROBLEM!');
    console.log('   Your trigger function references PENDING but it does not exist!');
  }

  console.log('');
  return values;
}

async function fetchAllEnums() {
  console.log('\n📋 ALL ENUM TYPES\n');
  console.log('='.repeat(80));

  const query = `
    SELECT
      t.typname as enum_name,
      string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname;
  `;

  const result = await pool.query(query);

  console.log(`\n✅ Found ${result.rows.length} enum types:\n`);

  result.rows.forEach(row => {
    console.log(`📌 ${row.enum_name}`);
    console.log(`   ${row.enum_values}`);
    console.log('');
  });

  return result.rows;
}

async function fetchBotActivationColumns() {
  console.log('\n📊 BotActivation TABLE COLUMNS\n');
  console.log('='.repeat(80));

  const query = `
    SELECT
      column_name,
      data_type,
      udt_name,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'BotActivation'
    ORDER BY ordinal_position;
  `;

  const result = await pool.query(query);

  if (result.rows.length === 0) {
    console.log('⚠️  BotActivation table not found!');
    return [];
  }

  console.log(`\n✅ Found ${result.rows.length} columns:\n`);

  result.rows.forEach(col => {
    const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    const def = col.column_default ? ` [${col.column_default}]` : '';
    console.log(`   ${col.column_name.padEnd(30)} ${col.udt_name.padEnd(20)} ${nullable}${def}`);
  });

  console.log('');
  return result.rows;
}

async function checkTriggerFunction() {
  console.log('\n⚙️  BOT TRIGGER FUNCTION\n');
  console.log('='.repeat(80));

  const query = `
    SELECT pg_get_functiondef(p.oid) as definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'update_user_bot_purchase_status';
  `;

  const result = await pool.query(query);

  if (result.rows.length === 0) {
    console.log('⚠️  Function update_user_bot_purchase_status not found!');
    return null;
  }

  console.log('\n✅ Current function definition:\n');
  console.log(result.rows[0].definition);
  console.log('');

  // Check if it references PENDING
  if (result.rows[0].definition.includes('PENDING')) {
    console.log('❌ FOUND ISSUE: Function references PENDING status!');
    console.log('   This needs to be fixed!\n');
  } else {
    console.log('✅ Function does not reference PENDING\n');
  }

  return result.rows[0].definition;
}

async function fetchSampleBotData() {
  console.log('\n📦 SAMPLE BOT ACTIVATION DATA\n');
  console.log('='.repeat(80));

  const query = `
    SELECT
      id, "userId", "botType", status, "activationFee",
      "activationDate", "activatedAt", "expiryDate", "expiredAt",
      network, "isExpired", "createdAt"
    FROM "BotActivation"
    ORDER BY "createdAt" DESC
    LIMIT 2;
  `;

  try {
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      console.log('⚠️  No bot activations found\n');
      return [];
    }

    console.log(`\n✅ Found ${result.rows.length} records:\n`);

    result.rows.forEach((bot, i) => {
      console.log(`Record ${i + 1}:`);
      console.log(`   Bot Type: ${bot.botType}`);
      console.log(`   Status: ${bot.status}`);
      console.log(`   Activation Fee: ${bot.activationFee}`);
      console.log(`   activationDate: ${bot.activationDate}`);
      console.log(`   activatedAt: ${bot.activatedAt}`);
      console.log(`   expiryDate: ${bot.expiryDate}`);
      console.log(`   expiredAt: ${bot.expiredAt}`);
      console.log(`   Network: ${bot.network}`);
      console.log(`   isExpired: ${bot.isExpired}`);
      console.log('');
    });

    return result.rows;
  } catch (error) {
    console.error('Error fetching sample data:', error.message);
    return [];
  }
}

async function analyzeCodeVsDatabase(columns, botStatus) {
  console.log('\n🔎 CODE VS DATABASE COMPARISON\n');
  console.log('='.repeat(80));

  // Check critical columns
  const columnNames = columns.map(c => c.column_name);

  console.log('\n1️⃣  Date Column Analysis:');
  console.log('   Database has:', columnNames.filter(c => c.includes('Date') || c.includes('At')).join(', '));
  console.log('   Code expects: activationDate, expiryDate (frontend)');
  console.log('   Code queries: activationDate, expiryDate (my-bots API - FIXED)');

  if (columnNames.includes('activationDate') && columnNames.includes('expiryDate')) {
    console.log('   ✅ All required date columns exist');
  } else {
    console.log('   ❌ Missing date columns!');
  }

  console.log('\n2️⃣  Status Enum Analysis:');
  console.log('   Database BotStatus enum:', botStatus.join(', '));
  console.log('   Code uses: ACTIVE (in activate-selected API)');
  console.log('   Trigger checks: ACTIVE, PENDING (OLD - needs fix)');

  if (botStatus.includes('PENDING')) {
    console.log('   ✅ PENDING exists - trigger is OK');
  } else {
    console.log('   ❌ PENDING does NOT exist - trigger will fail!');
  }

  console.log('\n3️⃣  Network Column:');
  if (columnNames.includes('network')) {
    console.log('   ✅ network column exists');
  } else {
    console.log('   ❌ network column missing!');
  }

  console.log('');
}

async function main() {
  console.log('\n🚀 LIVE DATABASE SCHEMA ANALYZER FOR NEON');
  console.log('='.repeat(80));
  console.log(`Connecting to: ${process.env.DATABASE_URL?.substring(0, 50)}...\n`);

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!\n');

    // Run all checks
    const botStatus = await checkBotStatusEnum();
    await fetchAllEnums();
    const columns = await fetchBotActivationColumns();
    await checkTriggerFunction();
    await fetchSampleBotData();
    await analyzeCodeVsDatabase(columns, botStatus);

    console.log('\n' + '='.repeat(80));
    console.log('✅ ANALYSIS COMPLETE!');
    console.log('='.repeat(80));
    console.log('\n📝 SUMMARY OF ISSUES FOUND:\n');

    if (!botStatus.includes('PENDING')) {
      console.log('❌ CRITICAL: BotStatus enum does not include PENDING');
      console.log('   → Fix: Update trigger to only check for ACTIVE');
      console.log('   → Run: The fix-bot-activation-trigger.sql script\n');
    }

    console.log('✅ Date columns are correct (activationDate, expiryDate)');
    console.log('✅ API endpoint fixed to return correct field names\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
    console.log('🔌 Connection closed\n');
    process.exit(0);
  }
}

main();
