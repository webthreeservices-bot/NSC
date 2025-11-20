const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function checkEpochDates() {
  try {
    console.log('Checking for epoch/1970 dates...\n')
    
    // Check Package table
    const pkgResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "createdAt" IS NULL OR "createdAt" < '1971-01-01'::timestamp) as bad_created,
        COUNT(*) FILTER (WHERE "investmentDate" IS NULL OR "investmentDate" < '1971-01-01'::timestamp) as bad_investment,
        COUNT(*) FILTER (WHERE "expiryDate" IS NULL OR "expiryDate" < '1971-01-01'::timestamp) as bad_expiry
      FROM "Package"
    `)
    
    console.log('Package Table:')
    console.log('  Total records:', pkgResult.rows[0].total)
    console.log('  Bad createdAt:', pkgResult.rows[0].bad_created)
    console.log('  Bad investmentDate:', pkgResult.rows[0].bad_investment)
    console.log('  Bad expiryDate:', pkgResult.rows[0].bad_expiry)
    
    // Get some examples
    const examples = await pool.query(`
      SELECT id, "packageType", amount, "investmentDate", "expiryDate", "createdAt"
      FROM "Package"
      WHERE "investmentDate" < '1971-01-01'::timestamp 
         OR "expiryDate" < '1971-01-01'::timestamp
      LIMIT 5
    `)
    
    if (examples.rowCount > 0) {
      console.log('\n  Sample bad records:')
      examples.rows.forEach((pkg, i) => {
        console.log(`  ${i+1}. ${pkg.packageType} - $${pkg.amount}`)
        console.log(`     Investment: ${pkg.investmentDate}`)
        console.log(`     Expiry: ${pkg.expiryDate}`)
        console.log(`     Created: ${pkg.createdAt}`)
      })
    }
    
    // Check BotActivation table
    const botResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "createdAt" IS NULL OR "createdAt" < '1971-01-01'::timestamp) as bad_created,
        COUNT(*) FILTER (WHERE "activationDate" IS NULL OR "activationDate" < '1971-01-01'::timestamp) as bad_activation,
        COUNT(*) FILTER (WHERE "expiryDate" IS NULL OR "expiryDate" < '1971-01-01'::timestamp) as bad_expiry
      FROM "BotActivation"
    `)
    
    console.log('\nBotActivation Table:')
    console.log('  Total records:', botResult.rows[0].total)
    console.log('  Bad createdAt:', botResult.rows[0].bad_created)
    console.log('  Bad activationDate:', botResult.rows[0].bad_activation)
    console.log('  Bad expiryDate:', botResult.rows[0].bad_expiry)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkEpochDates()
