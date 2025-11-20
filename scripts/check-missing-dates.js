/**
 * Database Migration Script: Backfill Missing Dates (Dry Run)
 * 
 * This script shows what WOULD be changed without actually changing it
 * Run this with: node scripts/check-missing-dates.js
 */

import pkg from 'pg'
const { Pool } = pkg

const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('neon.tech') || connectionString?.includes('amazonaws.com')
    ? { rejectUnauthorized: false }
    : false
})

async function checkMissingDates() {
  const client = await pool.connect()
  
  try {
    console.log('🔍 Checking for missing or invalid dates...\n')
    
    // Check Users
    const usersCheck = await client.query(`
      SELECT 
        id,
        email,
        "createdAt",
        "updatedAt",
        "lastLogin"
      FROM "User"
      WHERE "createdAt" IS NULL 
         OR "createdAt" < '1971-01-01'::timestamp
         OR "updatedAt" IS NULL
         OR "updatedAt" < '1971-01-01'::timestamp
      LIMIT 10
    `)
    
    console.log('👥 USERS with invalid dates:', usersCheck.rows.length)
    if (usersCheck.rows.length > 0) {
      console.table(usersCheck.rows)
    }
    
    // Check Packages
    const packagesCheck = await client.query(`
      SELECT 
        id,
        "userId",
        amount,
        "packageType",
        "createdAt",
        "investmentDate",
        "expiryDate",
        "nextRoiDate"
      FROM "Package"
      WHERE "createdAt" IS NULL 
         OR "createdAt" < '1971-01-01'::timestamp
         OR "investmentDate" IS NULL
         OR "investmentDate" < '1971-01-01'::timestamp
      LIMIT 10
    `)
    
    console.log('\n📦 PACKAGES with invalid dates:', packagesCheck.rows.length)
    if (packagesCheck.rows.length > 0) {
      console.table(packagesCheck.rows)
    }
    
    // Check Transactions
    const transactionsCheck = await client.query(`
      SELECT 
        id,
        "userId",
        type,
        amount,
        "createdAt"
      FROM "Transaction"
      WHERE "createdAt" IS NULL 
         OR "createdAt" < '1971-01-01'::timestamp
      LIMIT 10
    `)
    
    console.log('\n💳 TRANSACTIONS with invalid dates:', transactionsCheck.rows.length)
    if (transactionsCheck.rows.length > 0) {
      console.table(transactionsCheck.rows)
    }
    
    // Check Withdrawals
    const withdrawalsCheck = await client.query(`
      SELECT 
        id,
        "userId",
        amount,
        status,
        "createdAt",
        "requestedAt"
      FROM "Withdrawal"
      WHERE "createdAt" IS NULL 
         OR "createdAt" < '1971-01-01'::timestamp
         OR "requestedAt" IS NULL
         OR "requestedAt" < '1971-01-01'::timestamp
      LIMIT 10
    `)
    
    console.log('\n💰 WITHDRAWALS with invalid dates:', withdrawalsCheck.rows.length)
    if (withdrawalsCheck.rows.length > 0) {
      console.table(withdrawalsCheck.rows)
    }
    
    // Summary
    const totalIssues = 
      usersCheck.rows.length + 
      packagesCheck.rows.length + 
      transactionsCheck.rows.length + 
      withdrawalsCheck.rows.length
    
    console.log('\n━'.repeat(80))
    console.log(`\n📊 SUMMARY:`)
    console.log(`   Users with issues: ${usersCheck.rows.length}`)
    console.log(`   Packages with issues: ${packagesCheck.rows.length}`)
    console.log(`   Transactions with issues: ${transactionsCheck.rows.length}`)
    console.log(`   Withdrawals with issues: ${withdrawalsCheck.rows.length}`)
    console.log(`   TOTAL RECORDS TO FIX: ${totalIssues}`)
    
    if (totalIssues > 0) {
      console.log('\n⚠️  To fix these issues, run:')
      console.log('   node scripts/backfill-dates.js')
    } else {
      console.log('\n✅ No issues found! All dates are valid.')
    }
    
  } catch (error) {
    console.error('\n❌ Check failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the check
checkMissingDates()
  .then(() => {
    console.log('\n🎉 Check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error)
    process.exit(1)
  })
