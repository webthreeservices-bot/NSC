/**
 * Database Migration Script: Backfill Missing Dates
 * 
 * This script fixes records with missing or invalid dates (NULL or epoch/1970)
 * Run this with: node scripts/backfill-dates.js
 */

import pkg from 'pg'
const { Pool } = pkg
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('neon.tech') || connectionString?.includes('amazonaws.com')
    ? { rejectUnauthorized: false }
    : false
})

async function runMigration() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Starting date backfill migration...\n')
    
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', 'backfill-created-at-dates.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Execute the migration
    console.log('📝 Executing migration...')
    await client.query(migrationSQL)
    
    console.log('\n✅ Migration completed successfully!\n')
    
    // Display summary
    const summary = await client.query(`
      SELECT 
        'User' as table_name,
        COUNT(*) as total_records,
        COUNT(*) FILTER (WHERE "createdAt" IS NULL OR "createdAt" < '1971-01-01'::timestamp) as invalid_dates,
        MIN("createdAt") as earliest_date,
        MAX("createdAt") as latest_date
      FROM "User"
      UNION ALL
      SELECT 
        'Package',
        COUNT(*),
        COUNT(*) FILTER (WHERE "createdAt" IS NULL OR "createdAt" < '1971-01-01'::timestamp),
        MIN("createdAt"),
        MAX("createdAt")
      FROM "Package"
      UNION ALL
      SELECT 
        'Transaction',
        COUNT(*),
        COUNT(*) FILTER (WHERE "createdAt" IS NULL OR "createdAt" < '1971-01-01'::timestamp),
        MIN("createdAt"),
        MAX("createdAt")
      FROM "Transaction"
      UNION ALL
      SELECT 
        'Withdrawal',
        COUNT(*),
        COUNT(*) FILTER (WHERE "createdAt" IS NULL OR "createdAt" < '1971-01-01'::timestamp),
        MIN("createdAt"),
        MAX("createdAt")
      FROM "Withdrawal"
    `)
    
    console.log('📊 Database Summary:')
    console.log('━'.repeat(80))
    console.table(summary.rows)
    
    if (summary.rows.some(row => row.invalid_dates > 0)) {
      console.log('\n⚠️  WARNING: Some tables still have invalid dates!')
      console.log('This might indicate a schema issue or data corruption.')
    } else {
      console.log('\n✨ All dates are now valid!')
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('\n🎉 Migration script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error)
    process.exit(1)
  })
