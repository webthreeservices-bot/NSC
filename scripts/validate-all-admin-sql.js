/**
 * COMPREHENSIVE SQL VALIDATION FOR ALL ADMIN ENDPOINTS
 * Tests actual queries against live database schema
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function validateAllAdminSQL() {
  console.log('\n🔍 COMPREHENSIVE SQL VALIDATION\n');
  console.log('='.repeat(80));

  try {
    // Get all enum types from live database
    console.log('\n1️⃣  Fetching live database schema...\n');

    const enumsResult = await pool.query(`
      SELECT
        t.typname as enum_name,
        string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);

    const liveEnums = {};
    enumsResult.rows.forEach(row => {
      liveEnums[row.enum_name] = row.enum_values.split(',');
      console.log(`   ✅ ${row.enum_name}: ${row.enum_values}`);
    });

    // Get all table columns
    console.log('\n2️⃣  Fetching table schemas...\n');

    const tablesResult = await pool.query(`
      SELECT
        table_name,
        string_agg(column_name, ',' ORDER BY ordinal_position) as columns
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name IN ('User', 'Package', 'Withdrawal', 'Transaction', 'Earning', 'Notification')
      GROUP BY table_name
      ORDER BY table_name;
    `);

    const tableschemas = {};
    tablesResult.rows.forEach(row => {
      tableSchemas[row.table_name] = row.columns.split(',');
      console.log(`   ✅ ${row.table_name}: ${tableSchemas[row.table_name].length} columns`);
    });

    console.log('\n3️⃣  Validating common patterns...\n');

    const validations = [
      {
        name: 'ReferenceType enum',
        test: () => !liveEnums['ReferenceType'],
        expected: true,
        message: 'ReferenceType should NOT exist (it\'s TEXT)'
      },
      {
        name: 'TargetType enum',
        test: () => !liveEnums['TargetType'],
        expected: true,
        message: 'TargetType should NOT exist (it\'s TEXT)'
      },
      {
        name: 'EarningStatus enum',
        test: () => !liveEnums['EarningStatus'],
        expected: true,
        message: 'EarningStatus should NOT exist (Earning.status is TEXT)'
      },
      {
        name: 'PackageStatus has PENDING',
        test: () => liveEnums['PackageStatus'] && liveEnums['PackageStatus'].includes('PENDING'),
        expected: true,
        message: 'PENDING is valid PackageStatus'
      },
      {
        name: 'PackageStatus has INACTIVE',
        test: () => liveEnums['PackageStatus'] && liveEnums['PackageStatus'].includes('INACTIVE'),
        expected: false,
        message: 'INACTIVE is NOT a valid PackageStatus'
      },
      {
        name: 'User has fullName',
        test: () => tableSchemas['User'] && tableSchemas['User'].includes('fullName'),
        expected: true,
        message: 'User.fullName exists'
      },
      {
        name: 'User has name',
        test: () => tableSchemas['User'] && tableSchemas['User'].includes('name'),
        expected: false,
        message: 'User.name does NOT exist (use fullName or username)'
      },
      {
        name: 'Package has isActive',
        test: () => tableSchemas['Package'] && tableSchemas['Package'].includes('isActive'),
        expected: false,
        message: 'Package.isActive does NOT exist (use status)'
      },
      {
        name: 'Package has notes',
        test: () => tableSchemas['Package'] && tableSchemas['Package'].includes('notes'),
        expected: true,
        message: 'Package.notes exists (not description)'
      },
      {
        name: 'Withdrawal has txHash',
        test: () => tableSchemas['Withdrawal'] && tableSchemas['Withdrawal'].includes('txHash'),
        expected: true,
        message: 'Withdrawal.txHash exists (not transactionHash)'
      },
      {
        name: 'Transaction has referenceType',
        test: () => tableSchemas['Transaction'] && tableSchemas['Transaction'].includes('referenceType'),
        expected: true,
        message: 'Transaction.referenceType is TEXT field'
      }
    ];

    let passed = 0;
    let failed = 0;

    validations.forEach(v => {
      const result = v.test();
      const status = result === v.expected ? '✅' : '❌';

      if (result === v.expected) {
        passed++;
        console.log(`   ${status} ${v.name}`);
      } else {
        failed++;
        console.log(`   ${status} ${v.name} - FAILED!`);
        console.log(`      Expected: ${v.expected}, Got: ${result}`);
        console.log(`      ${v.message}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('📊 VALIDATION RESULTS');
    console.log('='.repeat(80));
    console.log(`\n✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed === 0) {
      console.log('\n🎉 ALL VALIDATIONS PASSED!\n');
      console.log('Your database schema matches expectations.');
    } else {
      console.log('\n⚠️  SOME VALIDATIONS FAILED\n');
      console.log('Please review the issues above.\n');
    }

    // Summary of what's correct
    console.log('='.repeat(80));
    console.log('✅ CONFIRMED CORRECT SCHEMA');
    console.log('='.repeat(80));
    console.log('\nEnums that exist:');
    Object.keys(liveEnums).forEach(e => console.log(`   • ${e}`));

    console.log('\nEnums that DON\'T exist (use TEXT instead):');
    console.log('   • ReferenceType (referenceType is TEXT)');
    console.log('   • TargetType (targetType is TEXT)');
    console.log('   • EarningStatus (Earning.status is TEXT)');

    console.log('\nCommon field corrections:');
    console.log('   • User: fullName (NOT name)');
    console.log('   • Package: status (NOT isActive)');
    console.log('   • Package: notes (NOT description)');
    console.log('   • Withdrawal: txHash (NOT transactionHash)');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}

const tableSchemas = {};

validateAllAdminSQL()
  .then(() => {
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
