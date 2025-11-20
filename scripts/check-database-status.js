/**
 * CHECK DATABASE STATUS
 * Verifies what's already in the database
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabaseStatus() {
  console.log('\n📊 CHECKING DATABASE STATUS\n');
  console.log('='.repeat(80));

  try {
    // Check tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`\n✅ TABLES (${tablesResult.rows.length} total):\n`);
    tablesResult.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });

    // Check enums
    const enumsResult = await pool.query(`
      SELECT typname as enum_name
      FROM pg_type t
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public'
      AND t.typtype = 'e'
      ORDER BY typname;
    `);

    console.log(`\n✅ ENUMS (${enumsResult.rows.length} total):\n`);
    enumsResult.rows.forEach(row => {
      console.log(`   • ${row.enum_name}`);
    });

    // Check functions
    const functionsResult = await pool.query(`
      SELECT proname as function_name
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND prokind = 'f'
      ORDER BY proname;
    `);

    console.log(`\n✅ FUNCTIONS (${functionsResult.rows.length} total):\n`);
    functionsResult.rows.slice(0, 20).forEach(row => {
      console.log(`   • ${row.function_name}`);
    });
    if (functionsResult.rows.length > 20) {
      console.log(`   ... and ${functionsResult.rows.length - 20} more`);
    }

    // Check triggers
    const triggersResult = await pool.query(`
      SELECT
        t.tgname as trigger_name,
        c.relname as table_name
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
      AND NOT t.tgisinternal
      ORDER BY c.relname, t.tgname;
    `);

    console.log(`\n✅ TRIGGERS (${triggersResult.rows.length} total):\n`);
    triggersResult.rows.forEach(row => {
      console.log(`   • ${row.trigger_name} on ${row.table_name}`);
    });

    // Check indexes
    const indexesResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public';
    `);

    console.log(`\n✅ INDEXES: ${indexesResult.rows[0].count} total`);

    // Check admin user
    const adminResult = await pool.query(`
      SELECT id, email, role, "isActive"
      FROM "User"
      WHERE role = 'SUPER_ADMIN' OR role = 'ADMIN'
      LIMIT 5;
    `);

    console.log(`\n✅ ADMIN USERS (${adminResult.rows.length}):\n`);
    adminResult.rows.forEach(row => {
      console.log(`   • ${row.email} (${row.role}) - ${row.isActive ? 'Active' : 'Inactive'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('📊 DATABASE STATUS SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✅ Tables: ${tablesResult.rows.length}`);
    console.log(`✅ Enums: ${enumsResult.rows.length}`);
    console.log(`✅ Functions: ${functionsResult.rows.length}`);
    console.log(`✅ Triggers: ${triggersResult.rows.length}`);
    console.log(`✅ Indexes: ${indexesResult.rows[0].count}`);
    console.log(`✅ Admin Users: ${adminResult.rows.length}`);

    if (tablesResult.rows.length >= 25 && enumsResult.rows.length >= 15) {
      console.log('\n🎉 DATABASE IS FULLY SET UP AND READY!\n');
      console.log('No migration needed - database is already configured.\n');
    } else {
      console.log('\n⚠️  DATABASE MAY BE INCOMPLETE\n');
      console.log('Expected at least 25 tables and 15 enums.\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

checkDatabaseStatus()
  .then(() => {
    console.log('🔌 Connection closed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
