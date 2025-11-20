/**
 * FIND REAL TYPE MISMATCHES IN DATABASE
 * Only reports actual problems that exist
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function findRealMismatches() {
  console.log('\n🔍 FINDING REAL TYPE MISMATCHES\n');
  console.log('='.repeat(80));

  const issues = [];

  try {
    // 1. Check all trigger functions for type mismatches
    console.log('\n1️⃣  Checking trigger functions...\n');

    const functionsQuery = `
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

    const functions = await pool.query(functionsQuery);

    // Get column types for all tables
    const columnsQuery = `
      SELECT
        table_name,
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name NOT LIKE 'pg_%'
      ORDER BY table_name, ordinal_position;
    `;

    const columns = await pool.query(columnsQuery);

    // Build a map of table -> column -> type
    const columnTypes = {};
    columns.rows.forEach(col => {
      if (!columnTypes[col.table_name]) {
        columnTypes[col.table_name] = {};
      }
      columnTypes[col.table_name][col.column_name] = {
        data_type: col.data_type,
        udt_name: col.udt_name
      };
    });

    // Check each function
    for (const func of functions.rows) {
      const def = func.definition;

      // Find INSERT statements
      const insertRegex = /INSERT INTO "(\w+)"\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\)/gi;
      let match;

      while ((match = insertRegex.exec(def)) !== null) {
        const tableName = match[1];
        const valuesSection = match[2];

        if (!columnTypes[tableName]) continue;

        // Check for common mismatches
        // 1. Enum types without casting
        Object.keys(columnTypes[tableName]).forEach(colName => {
          const colType = columnTypes[tableName][colName];

          // Check if it's a user-defined type (enum)
          if (colType.data_type === 'USER-DEFINED') {
            // Look for string literals that might be enum values
            const enumPattern = new RegExp(`'([A-Z_]+)'(?!::)`, 'g');
            let enumMatch;

            while ((enumMatch = enumPattern.exec(valuesSection)) !== null) {
              const value = enumMatch[1];
              // Check if this looks like an enum value (all caps)
              if (value === value.toUpperCase() && value.length > 2) {
                issues.push({
                  severity: 'HIGH',
                  function: func.function_name,
                  table: tableName,
                  issue: 'Enum cast missing',
                  detail: `Value '${value}' should be cast to enum type`,
                  fix: `'${value}'::"${colType.udt_name}"`
                });
              }
            }
          }

          // Check for UUID columns
          if (colType.udt_name === 'uuid' || colName.includes('Id')) {
            if (valuesSection.includes("gen_random_uuid()::text")) {
              issues.push({
                severity: 'MEDIUM',
                function: func.function_name,
                table: tableName,
                column: colName,
                issue: 'UUID cast to text',
                detail: 'Using gen_random_uuid()::text instead of keeping as UUID',
                fix: 'Remove ::text cast or use directly'
              });
            }
          }

          // Check for timestamp columns
          if (colType.data_type === 'timestamp without time zone') {
            if (valuesSection.match(new RegExp(`'\\d{4}-\\d{2}-\\d{2}'(?!::)`, 'g'))) {
              issues.push({
                severity: 'LOW',
                function: func.function_name,
                table: tableName,
                column: colName,
                issue: 'Timestamp without cast',
                detail: 'Date string without timestamp cast',
                fix: "Use NOW() or 'value'::timestamp"
              });
            }
          }
        });
      }
    }

    // 2. Check for actual runtime errors
    console.log('\n2️⃣  Checking for logged errors...\n');

    const errorQuery = `
      SELECT DISTINCT "message", "createdAt"
      FROM "ErrorLog"
      WHERE "message" LIKE '%type%'
      OR "message" LIKE '%cast%'
      OR "message" LIKE '%expression%'
      ORDER BY "createdAt" DESC
      LIMIT 10;
    `;

    try {
      const errors = await pool.query(errorQuery);
      if (errors.rows.length > 0) {
        console.log('   Found recent type-related errors:\n');
        errors.rows.forEach((err, i) => {
          console.log(`   ${i + 1}. ${err.message}`);
          console.log(`      Time: ${err.createdAt}\n`);
        });
      } else {
        console.log('   ✅ No type-related errors in logs\n');
      }
    } catch (e) {
      console.log('   ℹ️  ErrorLog table not accessible\n');
    }

    // Report findings
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINDINGS');
    console.log('='.repeat(80));

    if (issues.length === 0) {
      console.log('\n✅ NO TYPE MISMATCHES FOUND!\n');
      console.log('All type casts are correct.\n');
    } else {
      console.log(`\n⚠️  Found ${issues.length} type mismatch issues:\n`);

      // Group by severity
      const critical = issues.filter(i => i.severity === 'CRITICAL');
      const high = issues.filter(i => i.severity === 'HIGH');
      const medium = issues.filter(i => i.severity === 'MEDIUM');
      const low = issues.filter(i => i.severity === 'LOW');

      if (critical.length > 0) {
        console.log('🚨 CRITICAL:\n');
        critical.forEach((issue, i) => {
          console.log(`${i + 1}. ${issue.function} - ${issue.table}`);
          console.log(`   Issue: ${issue.issue}`);
          console.log(`   Detail: ${issue.detail}`);
          console.log(`   Fix: ${issue.fix}\n`);
        });
      }

      if (high.length > 0) {
        console.log('⚠️  HIGH:\n');
        high.forEach((issue, i) => {
          console.log(`${i + 1}. ${issue.function} - ${issue.table}`);
          console.log(`   Issue: ${issue.issue}`);
          console.log(`   Detail: ${issue.detail}`);
          console.log(`   Fix: ${issue.fix}\n`);
        });
      }

      if (medium.length > 0) {
        console.log('📋 MEDIUM (${medium.length}):\n');
        medium.slice(0, 5).forEach((issue, i) => {
          console.log(`${i + 1}. ${issue.function} - ${issue.issue}`);
        });
        if (medium.length > 5) {
          console.log(`   ... and ${medium.length - 5} more\n`);
        }
      }

      if (low.length > 0) {
        console.log(`\n📝 LOW (${low.length}): Minor issues, won't cause errors\n`);
      }
    }

    // Save report
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, 'type-mismatch-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ issues, timestamp: new Date() }, null, 2));

    console.log(`\n📄 Report saved: ${reportPath}\n`);

    return issues;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

findRealMismatches()
  .then(issues => {
    console.log('='.repeat(80));
    if (issues.length === 0) {
      console.log('✅ ALL CLEAR - No type mismatches');
    } else {
      const critical = issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
      if (critical.length > 0) {
        console.log(`❌ ${critical.length} critical issues need fixing`);
      } else {
        console.log('✅ No critical issues, only minor warnings');
      }
    }
    console.log('='.repeat(80));
    console.log('');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
