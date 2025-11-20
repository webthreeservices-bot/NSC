/**
 * COMPARE LOCAL CODEBASE VS LIVE DATABASE SCHEMA
 * Identifies mismatches between what's in code vs what's in database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Local schema from migration files
const LOCAL_ENUMS = {
  'UserRole': ['USER', 'ADMIN', 'SUPER_ADMIN'],
  'PackageType': ['NEO', 'NEURAL', 'ORACLE'],
  'PackageStatus': ['PENDING', 'ACTIVE', 'EXPIRED', 'WITHDRAWN', 'CANCELLED', 'COMPLETED'],
  'TransactionType': ['DEPOSIT', 'WITHDRAWAL', 'BOT_FEE', 'BOT_ACTIVATION', 'ROI_PAYMENT', 'REFERRAL_BONUS', 'LEVEL_INCOME', 'CAPITAL_RETURN', 'PACKAGE_PURCHASE', 'ADMIN_CREDIT', 'ADMIN_DEBIT'],
  'TransactionStatus': ['PENDING', 'CONFIRMING', 'COMPLETED', 'FAILED', 'REJECTED'],
  'EarningType': ['DIRECT_REFERRAL', 'LEVEL_INCOME', 'REFERRAL', 'ROI', 'DIRECT', 'BONUS'],
  'WithdrawalStatus': ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED'],
  'WithdrawalType': ['ROI_ONLY', 'CAPITAL', 'CAPITAL_ONLY', 'FULL_AMOUNT'],
  'KYCStatus': ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMIT'],
  'PaymentStatus': ['PENDING', 'CONFIRMING', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'],
  'NotificationType': ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'PAYMENT', 'WITHDRAWAL', 'REFERRAL', 'ROI', 'KYC', 'SECURITY'],
  'TicketStatus': ['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'WAITING_ADMIN', 'RESOLVED', 'CLOSED', 'REOPENED'],
  'TicketPriority': ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'],
  'AdminActionType': ['APPROVE_WITHDRAWAL', 'REJECT_WITHDRAWAL', 'APPROVE_PACKAGE', 'REJECT_PACKAGE', 'UPDATE_SETTING', 'APPROVE_KYC', 'REJECT_KYC', 'BLOCK_USER', 'UNBLOCK_USER', 'CREDIT_BALANCE', 'DEBIT_BALANCE', 'TRIGGER_ROI', 'TRIGGER_EXPIRATION', 'UPDATE_USER', 'DELETE_USER', 'VIEW_STATISTICS', 'EXPORT_DATA'],
  'Network': ['BEP20', 'TRC20', 'ERC20', 'POLYGON', 'MANUAL'],
  'RoiPaymentStatus': ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED'],
  'BotStatus': ['ACTIVE', 'EXPIRED', 'INACTIVE', 'SUSPENDED'],
  'SessionStatus': ['ACTIVE', 'EXPIRED', 'REVOKED', 'INVALID'],
  'CronJobStatus': ['IDLE', 'RUNNING', 'COMPLETED', 'FAILED', 'DISABLED']
};

// TypeScript database types (partial - only what's explicitly defined)
const TYPESCRIPT_MODELS = {
  'User': {
    fields: ['id', 'email', 'name', 'referralCode', 'referredBy', 'isActive', 'walletAddress', 'role', 'createdAt', 'updatedAt'],
    enums: { role: ['USER', 'ADMIN'] }
  },
  'Package': {
    fields: ['id', 'userId', 'amount', 'status', 'packageType', 'expiresAt', 'createdAt', 'updatedAt'],
    enums: { status: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] }
  },
  'Earning': {
    fields: ['id', 'userId', 'amount', 'type', 'sourceId', 'status', 'createdAt', 'updatedAt'],
    enums: {
      type: ['REFERRAL', 'ROI', 'DIRECT'],
      status: ['PENDING', 'PAID']
    }
  },
  'Withdrawal': {
    fields: ['id', 'userId', 'amount', 'status', 'walletAddress', 'transactionHash', 'createdAt', 'updatedAt'],
    enums: { status: ['PENDING', 'COMPLETED', 'FAILED'] }
  },
  'SystemSetting': {
    fields: ['id', 'key', 'value', 'type', 'createdAt', 'updatedAt'],
    enums: { type: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'] }
  }
};

async function compareSchemas() {
  console.log('\n🔍 COMPARING LOCAL CODEBASE VS LIVE DATABASE\n');
  console.log('='.repeat(80));

  const mismatches = {
    enums: {
      missing_in_live: [],
      missing_in_local: [],
      value_mismatches: []
    },
    tables: {
      missing_in_local: [],
      found_in_both: []
    },
    typescript_mismatches: [],
    critical_issues: [],
    warnings: []
  };

  try {
    // 1. COMPARE ENUMS
    console.log('\n1️⃣  Comparing ENUM types...\n');

    const liveEnumsQuery = `
      SELECT
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `;

    const liveEnums = await pool.query(liveEnumsQuery);
    const liveEnumMap = {};

    liveEnums.rows.forEach(row => {
      let values = row.enum_values;
      // Handle PostgreSQL array format: {val1,val2,val3}
      if (typeof values === 'string') {
        values = values.replace(/[{}]/g, '').split(',');
      } else if (!Array.isArray(values)) {
        values = [values];
      }
      liveEnumMap[row.enum_name] = values;
    });

    // Check for enums in local but not in live
    Object.keys(LOCAL_ENUMS).forEach(enumName => {
      if (!liveEnumMap[enumName]) {
        mismatches.enums.missing_in_live.push(enumName);
        console.log(`   ❌ Missing in live DB: ${enumName}`);
      } else {
        // Compare values
        const localValues = LOCAL_ENUMS[enumName];
        const liveValues = liveEnumMap[enumName];

        const missingInLive = localValues.filter(v => !liveValues.includes(v));
        const extraInLive = liveValues.filter(v => !localValues.includes(v));

        if (missingInLive.length > 0 || extraInLive.length > 0) {
          mismatches.enums.value_mismatches.push({
            enum: enumName,
            missing_in_live: missingInLive,
            extra_in_live: extraInLive
          });
          console.log(`   ⚠️  Value mismatch in: ${enumName}`);
          if (missingInLive.length > 0) {
            console.log(`      Missing in live: ${missingInLive.join(', ')}`);
          }
          if (extraInLive.length > 0) {
            console.log(`      Extra in live: ${extraInLive.join(', ')}`);
          }
        } else {
          console.log(`   ✅ ${enumName} - Values match`);
        }
      }
    });

    // Check for enums in live but not in local
    Object.keys(liveEnumMap).forEach(enumName => {
      if (!LOCAL_ENUMS[enumName]) {
        mismatches.enums.missing_in_local.push({
          name: enumName,
          values: liveEnumMap[enumName]
        });
        console.log(`   ⚠️  In live DB but not in local migrations: ${enumName}`);
        console.log(`      Values: ${liveEnumMap[enumName].join(', ')}`);
      }
    });

    // 2. COMPARE TABLES
    console.log('\n\n2️⃣  Comparing TABLES...\n');

    const liveTablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const liveTables = await pool.query(liveTablesQuery);
    const liveTableNames = liveTables.rows.map(r => r.table_name);

    const localTableNames = Object.keys(TYPESCRIPT_MODELS);

    localTableNames.forEach(tableName => {
      if (liveTableNames.includes(tableName)) {
        mismatches.tables.found_in_both.push(tableName);
        console.log(`   ✅ ${tableName} - Found in both`);
      } else {
        console.log(`   ❌ ${tableName} - Missing in live DB`);
      }
    });

    // Tables in live but not in TypeScript models (expected - many are)
    const tablesOnlyInLive = liveTableNames.filter(t => !localTableNames.includes(t));
    mismatches.tables.missing_in_local = tablesOnlyInLive;

    console.log(`\n   ℹ️  ${tablesOnlyInLive.length} tables in live DB have no explicit TypeScript model:`);
    console.log(`      ${tablesOnlyInLive.slice(0, 10).join(', ')}${tablesOnlyInLive.length > 10 ? '...' : ''}`);

    // 3. COMPARE TYPESCRIPT MODELS WITH LIVE COLUMNS
    console.log('\n\n3️⃣  Comparing TypeScript models with live table columns...\n');

    for (const [tableName, model] of Object.entries(TYPESCRIPT_MODELS)) {
      if (!liveTableNames.includes(tableName)) continue;

      const columnsQuery = `
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;

      const columns = await pool.query(columnsQuery, [tableName]);
      const liveColumnNames = columns.rows.map(c => c.column_name);

      const missingFields = model.fields.filter(f => !liveColumnNames.includes(f));
      const extraColumns = liveColumnNames.filter(c => !model.fields.includes(c));

      if (missingFields.length > 0) {
        mismatches.typescript_mismatches.push({
          table: tableName,
          issue: 'missing_in_live',
          fields: missingFields
        });
        console.log(`   ⚠️  ${tableName} - Fields in TypeScript but not in live DB: ${missingFields.join(', ')}`);
      }

      if (extraColumns.length > 0) {
        console.log(`   ℹ️  ${tableName} - Columns in live DB not in TypeScript: ${extraColumns.slice(0, 5).join(', ')}${extraColumns.length > 5 ? '...' : ''}`);
      }

      // Check enum values if table has enums
      if (model.enums) {
        for (const [field, expectedValues] of Object.entries(model.enums)) {
          const col = columns.rows.find(c => c.column_name === field);
          if (col && col.data_type === 'USER-DEFINED') {
            const enumType = col.udt_name;
            const liveEnumValues = liveEnumMap[enumType];

            if (liveEnumValues) {
              const missing = expectedValues.filter(v => !liveEnumValues.includes(v));
              if (missing.length > 0) {
                mismatches.typescript_mismatches.push({
                  table: tableName,
                  field,
                  issue: 'enum_values_mismatch',
                  expected: expectedValues,
                  actual: liveEnumValues,
                  missing
                });
                console.log(`   ❌ ${tableName}.${field} - Enum values don't match!`);
                console.log(`      Expected: ${expectedValues.join(', ')}`);
                console.log(`      Got: ${liveEnumValues.join(', ')}`);
                console.log(`      Missing: ${missing.join(', ')}`);

                mismatches.critical_issues.push(`${tableName}.${field} enum mismatch - application may fail`);
              }
            }
          }
        }
      }

      if (missingFields.length === 0 && extraColumns.length === 0) {
        console.log(`   ✅ ${tableName} - All TypeScript fields exist in live DB`);
      }
    }

    // 4. IDENTIFY CRITICAL ISSUES
    console.log('\n\n4️⃣  Analyzing critical issues...\n');

    // Check for missing enum values that may be used in code
    const hasPACKAGE = liveEnumMap['TransactionType']?.includes('PACKAGE');
    const hasPACKAGE_PURCHASE = liveEnumMap['TransactionType']?.includes('PACKAGE_PURCHASE');

    if (!hasPACKAGE && !hasPACKAGE_PURCHASE) {
      mismatches.critical_issues.push('TransactionType has neither PACKAGE nor PACKAGE_PURCHASE');
      console.log(`   ⚠️  TransactionType has neither PACKAGE nor PACKAGE_PURCHASE`);
    } else {
      console.log(`   ✅ TransactionType has ${hasPACKAGE ? 'PACKAGE' : 'PACKAGE_PURCHASE'}`);
    }

    // 5. SAVE REPORT
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_enums_local: Object.keys(LOCAL_ENUMS).length,
        total_enums_live: Object.keys(liveEnumMap).length,
        total_tables_live: liveTableNames.length,
        total_typescript_models: Object.keys(TYPESCRIPT_MODELS).length,
        critical_issues: mismatches.critical_issues.length,
        enum_mismatches: mismatches.enums.value_mismatches.length,
        typescript_mismatches: mismatches.typescript_mismatches.length
      },
      mismatches,
      live_enums: liveEnumMap,
      live_tables: liveTableNames
    };

    const reportPath = path.join(__dirname, 'schema-comparison-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 6. SUMMARY
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 COMPARISON SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✅ ENUMs:`);
    console.log(`   • Local migration files: ${Object.keys(LOCAL_ENUMS).length}`);
    console.log(`   • Live database: ${Object.keys(liveEnumMap).length}`);
    console.log(`   • Missing in live: ${mismatches.enums.missing_in_live.length}`);
    console.log(`   • Missing in local: ${mismatches.enums.missing_in_local.length}`);
    console.log(`   • Value mismatches: ${mismatches.enums.value_mismatches.length}`);

    console.log(`\n📋 TABLES:`);
    console.log(`   • Live database: ${liveTableNames.length}`);
    console.log(`   • TypeScript models: ${Object.keys(TYPESCRIPT_MODELS).length}`);
    console.log(`   • Found in both: ${mismatches.tables.found_in_both.length}`);
    console.log(`   • Only in live: ${mismatches.tables.missing_in_local.length}`);

    console.log(`\n⚠️  ISSUES:`);
    console.log(`   • Critical issues: ${mismatches.critical_issues.length}`);
    console.log(`   • TypeScript mismatches: ${mismatches.typescript_mismatches.length}`);

    if (mismatches.critical_issues.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES:`);
      mismatches.critical_issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
    }

    console.log(`\n📄 Full report saved: ${reportPath}\n`);

    console.log('='.repeat(80));
    if (mismatches.critical_issues.length === 0 && mismatches.typescript_mismatches.length === 0) {
      console.log('✅ NO CRITICAL MISMATCHES FOUND!');
      console.log('   Your codebase is in sync with the live database.');
    } else {
      console.log('⚠️  MISMATCHES DETECTED');
      console.log('   Review the report and update your local schema files.');
    }
    console.log('='.repeat(80) + '\n');

    return report;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

compareSchemas()
  .then(() => {
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
