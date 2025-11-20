
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, '..', 'database-migration', 'add_demo_packages.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration...');
    await pool.query(sql);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
