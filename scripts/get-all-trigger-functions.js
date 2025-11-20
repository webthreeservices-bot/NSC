/**
 * GET ALL TRIGGER FUNCTION DEFINITIONS
 * Extracts all trigger functions to analyze enum casting issues
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getAllTriggerFunctions() {
  console.log('\n📋 EXTRACTING ALL TRIGGER FUNCTIONS\n');
  console.log('='.repeat(80));

  try {
    // Get all trigger functions
    const query = `
      SELECT
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND (
        pg_get_functiondef(p.oid) LIKE '%INSERT INTO%'
        OR pg_get_functiondef(p.oid) LIKE '%UPDATE%SET%'
      )
      ORDER BY p.proname;
    `;

    const result = await pool.query(query);

    console.log(`\n✅ Found ${result.rows.length} trigger functions\n`);

    // Save all functions to a file for analysis
    const functions = {};
    result.rows.forEach(row => {
      functions[row.function_name] = row.definition;
      console.log(`   - ${row.function_name}`);
    });

    // Save to file
    const outputPath = path.join(__dirname, 'all-trigger-functions.json');
    fs.writeFileSync(outputPath, JSON.stringify(functions, null, 2));

    console.log(`\n💾 Saved to: ${outputPath}\n`);

    // Also print them for immediate viewing
    console.log('\n' + '='.repeat(80));
    console.log('FUNCTION DEFINITIONS');
    console.log('='.repeat(80));

    result.rows.forEach(row => {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`Function: ${row.function_name}`);
      console.log('─'.repeat(80));
      console.log(row.definition);
    });

    return functions;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

getAllTriggerFunctions()
  .then(() => {
    console.log('\n✅ Done!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
