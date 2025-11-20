const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

(async () => {
  const client = await pool.connect();
  try {
    // Step 1: Find the actual table name (case-insensitive check), search public schema
    const tableRes = await client.query(`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
        AND tablename ILIKE 'lostcommission'
      LIMIT 1
    `)
    if (!tableRes.rows[0]) {
      console.error('❌ LostCommission table not found!')
      return
    }
    const actualTableName = tableRes.rows[0].tablename
    console.log('✅ LostCommission relation:', actualTableName)

    // Step 2: Get indexes using the ACTUAL table name (parameterized)
    const idx = await client.query(
      `SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = $1 ORDER BY indexname`,
      [actualTableName]
    )
    console.log('📊 Indexes:', idx.rows.map(r => r.indexname))
    console.log(`\n✅ Found ${idx.rows.length} indexes`)
  } catch (e) {
    console.error('Query failed', e.message);
  } finally {
    await client.release();
    await pool.end();
  }
})();
