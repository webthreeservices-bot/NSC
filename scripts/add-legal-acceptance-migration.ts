#!/usr/bin/env node
/**
 * Script to add LegalAcceptance table to database
 * Run with: npx tsx scripts/add-legal-acceptance-migration.ts
 */

import pool from '../lib/db-connection'
import * as fs from 'fs'
import * as path from 'path'

async function runMigration() {
  try {
    console.log('🚀 Running LegalAcceptance table migration...')

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'add-legal-acceptance-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Execute the migration
    await pool.query(sql)

    console.log('✅ LegalAcceptance table created successfully!')
    console.log('📊 Table structure:')
    console.log('   - id (Primary Key)')
    console.log('   - userId (Foreign Key to User)')
    console.log('   - documentType (TERMS, PRIVACY, COOKIE_POLICY)')
    console.log('   - version')
    console.log('   - ipAddress')
    console.log('   - userAgent')
    console.log('   - acceptedAt')
    console.log('')
    console.log('🔒 Unique constraint: userId + documentType + version')
    console.log('📈 Indexes created for optimal query performance')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
