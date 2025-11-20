/**
 * Script to fix admin dashboard issues
 * Ensures the get_platform_statistics() function exists in the database
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JsN5Z0KwCtaV@ep-ancient-mode-a1wdnpmn-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixAdminDashboard() {
  const client = await pool.connect();

  try {
    console.log('🔧 Fixing admin dashboard...\n');

    // Check if function exists
    console.log('1️⃣  Checking if get_platform_statistics() function exists...');
    const funcCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'get_platform_statistics'
      ) as exists
    `);

    if (funcCheck.rows[0].exists) {
      console.log('✅ Function already exists!\n');
    } else {
      console.log('❌ Function does not exist. Creating it...\n');

      // Create the function
      await client.query(`
        CREATE OR REPLACE FUNCTION get_platform_statistics()
        RETURNS TABLE (
          "totalUsers" BIGINT,
          "activeUsers" BIGINT,
          "totalPackages" BIGINT,
          "activePackages" BIGINT,
          "totalInvested" DECIMAL(20, 8),
          "totalRoiPaid" DECIMAL(20, 8),
          "totalWithdrawals" DECIMAL(20, 8),
          "pendingWithdrawals" BIGINT
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT
            (SELECT COUNT(*) FROM "User" WHERE "isActive" = true) as "totalUsers",
            (SELECT COUNT(*) FROM "User" WHERE "lastLogin" > NOW() - INTERVAL '30 days') as "activeUsers",
            (SELECT COUNT(*) FROM "Package") as "totalPackages",
            (SELECT COUNT(*) FROM "Package" WHERE "status" = 'ACTIVE') as "activePackages",
            (SELECT COALESCE(SUM("amount"), 0) FROM "Package" WHERE "status" IN ('ACTIVE', 'EXPIRED', 'COMPLETED')) as "totalInvested",
            (SELECT COALESCE(SUM("amount"), 0) FROM "RoiPayment" WHERE "status" = 'COMPLETED') as "totalRoiPaid",
            (SELECT COALESCE(SUM("amount"), 0) FROM "Withdrawal" WHERE "status" = 'COMPLETED') as "totalWithdrawals",
            (SELECT COUNT(*) FROM "Withdrawal" WHERE "status" = 'PENDING') as "pendingWithdrawals";
        END;
        $$ LANGUAGE plpgsql;
      `);

      console.log('✅ Function created successfully!\n');
    }

    // Test the function
    console.log('2️⃣  Testing function...');
    const testResult = await client.query('SELECT * FROM get_platform_statistics()');
    console.log('✅ Function works! Results:');
    console.log(JSON.stringify(testResult.rows[0], null, 2));
    console.log('\n✅ All fixed! Admin dashboard should work now.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAdminDashboard();
