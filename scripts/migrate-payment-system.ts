/**
 * Payment System Migration Script
 * Run this script to create payment system tables in the database
 *
 * Usage: npx ts-node scripts/migrate-payment-system.ts
 */

import pool from '../lib/db-init'
import fs from 'fs'
import path from 'path'

async function runMigration() {
  console.log('Starting payment system migration...')

  try {
    // Read migration SQL
    const migrationPath = path.join(__dirname, '..', 'lib', 'db-payment-schema.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('Executing payment schema SQL...')

    // Execute migration
    await pool.query(migrationSQL)

    console.log('✓ Payment system tables created successfully')

    // Verify tables were created
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('PaymentRequest', 'PaymentWebhook', 'BlockchainScanState', 'PaymentConfirmation')
      ORDER BY table_name;
    `)

    console.log('\nCreated tables:')
    tables.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`)
    })

    console.log('\n✓ Migration completed successfully!')
  } catch (error) {
    console.error('✗ Migration failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration error:', error)
    process.exit(1)
  })
