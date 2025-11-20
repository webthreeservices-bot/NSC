
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function checkSettings() {
  try {
    const res = await pool.query("SELECT key, value FROM \"SystemSetting\" WHERE key LIKE 'TEST_%'");
    console.log('Demo Settings found:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSettings();
