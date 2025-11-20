
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from root
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing from .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function run() {
  try {
    const sqlPath = path.join(__dirname, '..', 'database-migration', 'add_demo_enum_values.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing SQL...');
    await pool.query(sql);
    console.log('Enum values added successfully.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}

run();
