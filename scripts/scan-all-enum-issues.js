/**
 * SCAN ALL TRIGGERS FOR ENUM CASTING ISSUES
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function scanForEnumIssues() {
  console.log('\n🔍 SCANNING ALL TRIGGERS FOR ENUM CASTING ISSUES\n');
  console.log('='.repeat(80));

  try {
    // Get all functions
    const functionsQuery = `
      SELECT
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      ORDER BY p.proname;
    `;

    const result = await pool.query(functionsQuery);

    console.log(`\nFound ${result.rows.length} functions to check\n`);

    const issues = [];

    result.rows.forEach(row => {
      const def = row.definition;

      // Check for INSERT or UPDATE statements with enum values
      const hasInsert = def.includes('INSERT INTO');
      const hasUpdate = def.includes('UPDATE');

      if (!hasInsert && !hasUpdate) return;

      // Check for enum types without casting
      const enumTypes = [
        'TransactionType',
        'TransactionStatus',
        'PackageStatus',
        'WithdrawalStatus',
        'EarningType',
        'NotificationType',
        'BotStatus',
        'KYCStatus',
        'PaymentStatus',
        'UserRole'
      ];

      enumTypes.forEach(enumType => {
        // Check if function inserts/updates this enum type
        const pattern = new RegExp(`"(\\w+)"\\s*,.*'([A-Z_]+)'`, 'g');
        let match;

        while ((match = pattern.exec(def)) !== null) {
          const columnName = match[1];
          const value = match[2];

          // Check if this looks like an enum value
          if (value.match(/^[A-Z_]+$/)) {
            // Check if it's already cast
            const isCast = def.includes(`'${value}'::"${enumType}"`);

            if (!isCast && enumType.toLowerCase().includes(columnName.toLowerCase())) {
              issues.push({
                function: row.function_name,
                column: columnName,
                value: value,
                enumType: enumType,
                needsCast: true
              });
            }
          }
        }
      });
    });

    if (issues.length === 0) {
      console.log('✅ NO ENUM CASTING ISSUES FOUND!\n');
      console.log('All enum values are properly cast.\n');
    } else {
      console.log(`⚠️  FOUND ${issues.length} POTENTIAL ISSUES:\n`);

      issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.function}`);
        console.log(`   Column: ${issue.column}`);
        console.log(`   Value: '${issue.value}'`);
        console.log(`   Needs: '${issue.value}'::"${issue.enumType}"`);
        console.log('');
      });
    }

    console.log('='.repeat(80));
    console.log('SCAN COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

scanForEnumIssues()
  .then(() => {
    console.log('\n🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
