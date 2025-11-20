const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getFunction() {
  const result = await pool.query(`
    SELECT pg_get_functiondef(p.oid) as definition
    FROM pg_proc p
    WHERE p.proname = 'process_referral_earnings';
  `);

  console.log(result.rows[0].definition);
  await pool.end();
}

getFunction().catch(console.error);
