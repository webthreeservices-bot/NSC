
import fs from 'fs';
import path from 'path';
import pool from '../lib/db-connection';

async function runMigration() {
  try {
    const sqlPath = path.join(process.cwd(), 'src', 'database-migration', 'add_demo_packages.sql');
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
