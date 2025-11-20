/**
 * COMPREHENSIVE DATABASE SCHEMA AUDIT
 *
 * Fetches EVERYTHING from live Neon database:
 * - All tables and their columns
 * - All enum types and values
 * - All indexes
 * - All foreign keys
 * - All triggers and functions
 * - All constraints
 *
 * Run with: node scripts/full-db-schema-audit.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const schemaData = {
  tables: {},
  enums: {},
  triggers: [],
  functions: [],
  indexes: [],
  foreignKeys: []
};

// Fetch all enum types
async function fetchEnums() {
  console.log('\n📋 FETCHING ALL ENUM TYPES...\n');

  const query = `
    SELECT
      t.typname as enum_name,
      array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname;
  `;

  const result = await pool.query(query);

  result.rows.forEach(row => {
    // PostgreSQL array_agg already returns an array
    const values = Array.isArray(row.enum_values) ? row.enum_values : [row.enum_values];
    schemaData.enums[row.enum_name] = values;
    console.log(`✅ ${row.enum_name}: ${values.join(', ')}`);
  });

  console.log(`\n✅ Found ${result.rows.length} enum types\n`);
  return result.rows;
}

// Fetch all tables
async function fetchAllTables() {
  console.log('\n📊 FETCHING ALL TABLES...\n');

  const query = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  const result = await pool.query(query);
  const tables = result.rows.map(r => r.table_name);

  console.log(`✅ Found ${tables.length} tables:`);
  tables.forEach(t => console.log(`   - ${t}`));
  console.log('');

  return tables;
}

// Fetch table structure with detailed info
async function fetchTableStructure(tableName) {
  const query = `
    SELECT
      c.column_name,
      c.data_type,
      c.udt_name,
      c.is_nullable,
      c.column_default,
      c.character_maximum_length,
      c.numeric_precision,
      c.numeric_scale
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.table_name = $1
    ORDER BY c.ordinal_position;
  `;

  const result = await pool.query(query, [tableName]);

  schemaData.tables[tableName] = {
    columns: result.rows,
    foreignKeys: [],
    indexes: []
  };

  return result.rows;
}

// Fetch foreign keys
async function fetchForeignKeys(tableName) {
  const query = `
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.update_rule,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = $1;
  `;

  const result = await pool.query(query, [tableName]);

  if (result.rows.length > 0) {
    schemaData.tables[tableName].foreignKeys = result.rows;
  }

  return result.rows;
}

// Fetch indexes
async function fetchIndexes(tableName) {
  const query = `
    SELECT
      i.relname as index_name,
      a.attname as column_name,
      ix.indisunique as is_unique,
      ix.indisprimary as is_primary
    FROM pg_class t
    JOIN pg_index ix ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE t.relname = $1
    AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ORDER BY i.relname;
  `;

  const result = await pool.query(query, [tableName]);

  if (result.rows.length > 0) {
    schemaData.tables[tableName].indexes = result.rows;
  }

  return result.rows;
}

// Fetch all triggers
async function fetchAllTriggers() {
  console.log('\n⚙️  FETCHING ALL TRIGGERS...\n');

  const query = `
    SELECT
      t.tgname as trigger_name,
      c.relname as table_name,
      p.proname as function_name,
      pg_get_triggerdef(t.oid) as trigger_definition
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_proc p ON t.tgfoid = p.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND NOT t.tgisinternal
    ORDER BY c.relname, t.tgname;
  `;

  const result = await pool.query(query);
  schemaData.triggers = result.rows;

  console.log(`✅ Found ${result.rows.length} triggers:`);
  result.rows.forEach(t => {
    console.log(`   - ${t.trigger_name} on ${t.table_name} → ${t.function_name}()`);
  });
  console.log('');

  return result.rows;
}

// Fetch all functions
async function fetchAllFunctions() {
  console.log('\n🔧 FETCHING ALL FUNCTIONS...\n');

  const query = `
    SELECT
      p.proname as function_name,
      CASE
        WHEN p.prokind = 'a' THEN 'AGGREGATE FUNCTION'
        ELSE pg_get_functiondef(p.oid)
      END as function_definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind != 'a'  -- Exclude aggregate functions
    ORDER BY p.proname;
  `;

  const result = await pool.query(query);
  schemaData.functions = result.rows;

  console.log(`✅ Found ${result.rows.length} functions:`);
  result.rows.forEach(f => console.log(`   - ${f.function_name}()`));
  console.log('');

  return result.rows;
}

// Main audit function
async function runFullAudit() {
  console.log('\n🚀 COMPREHENSIVE DATABASE SCHEMA AUDIT');
  console.log('='.repeat(80));
  console.log(`Database: ${process.env.DATABASE_URL?.substring(0, 50)}...\n`);

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!\n');

    // Fetch all schema components
    await fetchEnums();
    const tables = await fetchAllTables();

    console.log('\n📊 FETCHING DETAILED TABLE STRUCTURES...\n');
    for (const tableName of tables) {
      console.log(`Analyzing ${tableName}...`);
      await fetchTableStructure(tableName);
      await fetchForeignKeys(tableName);
      await fetchIndexes(tableName);
    }
    console.log('✅ All tables analyzed\n');

    await fetchAllTriggers();
    await fetchAllFunctions();

    // Save to JSON file
    const outputPath = path.join(__dirname, 'live-db-schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(schemaData, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('✅ AUDIT COMPLETE!');
    console.log('='.repeat(80));
    console.log(`\n📄 Full schema saved to: ${outputPath}\n`);

    // Print summary
    printSummary();

    return schemaData;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    throw error;
  }
}

function printSummary() {
  console.log('\n📊 SCHEMA SUMMARY:\n');
  console.log(`   Tables: ${Object.keys(schemaData.tables).length}`);
  console.log(`   Enums: ${Object.keys(schemaData.enums).length}`);
  console.log(`   Triggers: ${schemaData.triggers.length}`);
  console.log(`   Functions: ${schemaData.functions.length}`);

  let totalColumns = 0;
  let totalFKs = 0;
  let totalIndexes = 0;

  Object.values(schemaData.tables).forEach(table => {
    totalColumns += table.columns.length;
    totalFKs += table.foreignKeys.length;
    totalIndexes += table.indexes.length;
  });

  console.log(`   Total Columns: ${totalColumns}`);
  console.log(`   Foreign Keys: ${totalFKs}`);
  console.log(`   Indexes: ${totalIndexes}`);
  console.log('');
}

// Run audit
runFullAudit()
  .then(() => {
    pool.end();
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    pool.end();
    process.exit(1);
  });
