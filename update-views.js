const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('Dropping existing views...');

    // Drop views in reverse dependency order
    await pool.query('DROP MATERIALIZED VIEW IF EXISTS "mv_UserEarningsSummary" CASCADE');
    await pool.query('DROP VIEW IF EXISTS "vw_MonthlyRevenue" CASCADE');
    await pool.query('DROP VIEW IF EXISTS "vw_AdminQuickStats" CASCADE');
    await pool.query('DROP VIEW IF EXISTS "vw_PackagePerformance" CASCADE');
    await pool.query('DROP VIEW IF EXISTS "vw_UserActivityLog" CASCADE');
    await pool.query('DROP VIEW IF EXISTS "vw_RoiPaymentSchedule" CASCADE');
    await pool.query('DROP VIEW IF EXISTS "vw_PlatformStatistics" CASCADE');
    await pool.query('DROP VIEW IF EXISTS "vw_UserBalanceSummary" CASCADE');

    console.log('Applying updated views...');

    const sqlFile = path.join(__dirname, 'database-schema', '07_views.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    await pool.query(sql);
    console.log('✅ Views applied successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();