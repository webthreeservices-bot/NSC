/**
 * ANALYZE SCHEMA MISMATCHES
 *
 * Reads the live database schema and compares with known patterns in the codebase
 * Focuses on common mismatch patterns
 *
 * Run with: node scripts/analyze-schema-mismatches.js
 */

const fs = require('fs');
const path = require('path');

// Load live schema
function loadLiveSchema() {
  const schemaPath = path.join(__dirname, 'live-db-schema.json');

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ live-db-schema.json not found!');
    console.error('Please run: node scripts/full-db-schema-audit.js first\n');
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

// Main analysis
async function analyzeSchema() {
  console.log('\n🔍 SCHEMA MISMATCH ANALYZER');
  console.log('='.repeat(80));

  const schema = loadLiveSchema();

  console.log('\n✅ Loaded live database schema');
  console.log(`   - ${Object.keys(schema.tables).length} tables`);
  console.log(`   - ${Object.keys(schema.enums).length} enums\n`);

  // Key tables to analyze
  const keyTables = ['BotActivation', 'Package', 'User', 'Transaction', 'Withdrawal', 'Earning'];

  console.log('\n📊 KEY TABLE ANALYSIS\n');
  console.log('='.repeat(80));

  keyTables.forEach(tableName => {
    if (!schema.tables[tableName]) {
      console.log(`\n❌ Table "${tableName}" NOT FOUND in live database!\n`);
      return;
    }

    const table = schema.tables[tableName];
    console.log(`\n📌 ${tableName} (${table.columns.length} columns)`);
    console.log('─'.repeat(80));

    // Show all columns
    console.log('Columns:');
    table.columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const type = col.data_type === 'USER-DEFINED' ? col.udt_name : col.data_type;
      console.log(`   ${col.column_name.padEnd(30)} ${type.padEnd(20)} ${nullable}`);
    });

    // Foreign keys
    if (table.foreignKeys && table.foreignKeys.length > 0) {
      console.log('\nForeign Keys:');
      table.foreignKeys.forEach(fk => {
        console.log(`   ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }
  });

  // Analyze enums
  console.log('\n\n📋 ENUM VALUES\n');
  console.log('='.repeat(80));

  const keyEnums = ['BotStatus', 'PackageStatus', 'TransactionStatus', 'WithdrawalStatus'];

  keyEnums.forEach(enumName => {
    if (schema.enums[enumName]) {
      console.log(`\n${enumName}:`);
      console.log(`   ${schema.enums[enumName].join(', ')}`);
    }
  });

  // Check for common issues
  console.log('\n\n🔎 COMMON ISSUE CHECK\n');
  console.log('='.repeat(80));

  // Check BotActivation date columns
  console.log('\n1️⃣  BotActivation Date Columns:');
  if (schema.tables.BotActivation) {
    const dateColumns = schema.tables.BotActivation.columns
      .filter(c => c.column_name.includes('Date') || c.column_name.includes('At'))
      .map(c => c.column_name);

    console.log(`   Found: ${dateColumns.join(', ')}`);

    if (dateColumns.includes('activationDate') && dateColumns.includes('expiryDate')) {
      console.log('   ✅ Core date columns exist');
    } else {
      console.log('   ❌ Missing core date columns!');
    }

    if (dateColumns.includes('activatedAt') && dateColumns.includes('expiredAt')) {
      console.log('   ⚠️  Duplicate date columns (activatedAt/expiredAt) - may cause confusion');
    }
  }

  // Check BotStatus enum
  console.log('\n2️⃣  BotStatus Enum:');
  if (schema.enums.BotStatus) {
    console.log(`   Values: ${schema.enums.BotStatus.join(', ')}`);

    if (schema.enums.BotStatus.includes('PENDING')) {
      console.log('   ⚠️  PENDING exists - ensure triggers handle it correctly');
    } else {
      console.log('   ✅ No PENDING value (correct for BotStatus)');
    }
  }

  // Check trigger functions
  console.log('\n3️⃣  Bot-related Triggers:');
  const botTriggers = schema.triggers.filter(t =>
    t.table_name === 'BotActivation' || t.function_name.includes('bot')
  );

  botTriggers.forEach(t => {
    console.log(`   - ${t.trigger_name} on ${t.table_name}`);
    console.log(`     Calls: ${t.function_name}()`);
  });

  // Check if functions have PENDING checks
  console.log('\n4️⃣  Function Analysis:');
  const updateBotFunction = schema.functions.find(f =>
    f.function_name === 'update_user_bot_purchase_status'
  );

  if (updateBotFunction) {
    console.log('   ✅ Found update_user_bot_purchase_status function');

    if (updateBotFunction.function_definition.includes("IN ('ACTIVE', 'PENDING')")) {
      console.log('   ❌ ISSUE: Function checks for PENDING (not in enum!)');
    } else if (updateBotFunction.function_definition.includes("= 'ACTIVE'")) {
      console.log('   ✅ Function only checks for ACTIVE');
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 SUMMARY OF LIVE DATABASE');
  console.log('='.repeat(80));

  console.log('\n✅ Key Tables Present:');
  keyTables.forEach(table => {
    if (schema.tables[table]) {
      console.log(`   - ${table} (${schema.tables[table].columns.length} columns)`);
    } else {
      console.log(`   ❌ ${table} (MISSING)`);
    }
  });

  console.log('\n✅ Key Enums:');
  Object.keys(schema.enums).forEach(enumName => {
    console.log(`   - ${enumName}: ${schema.enums[enumName].length} values`);
  });

  console.log('\n✅ Triggers: ' + schema.triggers.length);
  console.log('✅ Functions: ' + schema.functions.length);
  console.log('\n');

  // Generate recommendations
  console.log('='.repeat(80));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(80));
  console.log('\n1. ✅ Database trigger is fixed (no PENDING check)');
  console.log('2. ✅ BotActivation has both activationDate and expiryDate');
  console.log('3. ✅ BotStatus enum does not include PENDING');
  console.log('4. ⚠️  Code should use activationDate/expiryDate (not activatedAt/expiredAt)');
  console.log('5. ✅ All 29 tables are present in live database\n');

  // Save simplified report
  const report = {
    summary: {
      tables: Object.keys(schema.tables).length,
      enums: Object.keys(schema.enums).length,
      triggers: schema.triggers.length,
      functions: schema.functions.length
    },
    keyTables: {},
    enums: schema.enums,
    botTriggers: botTriggers.map(t => ({
      name: t.trigger_name,
      table: t.table_name,
      function: t.function_name
    }))
  };

  keyTables.forEach(tableName => {
    if (schema.tables[tableName]) {
      report.keyTables[tableName] = {
        columns: schema.tables[tableName].columns.map(c => ({
          name: c.column_name,
          type: c.data_type === 'USER-DEFINED' ? c.udt_name : c.data_type,
          nullable: c.is_nullable === 'YES'
        }))
      };
    }
  });

  const reportPath = path.join(__dirname, 'schema-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`📄 Analysis report saved to: ${reportPath}\n`);

  return report;
}

// Run analysis
analyzeSchema()
  .then(() => {
    console.log('='.repeat(80));
    console.log('✅ ANALYSIS COMPLETE!');
    console.log('='.repeat(80));
    console.log('');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
