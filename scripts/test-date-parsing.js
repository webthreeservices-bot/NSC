const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function testDateParsing() {
  try {
    // Get a package with dates
    const result = await pool.query(`
      SELECT 
        "investmentDate",
        "expiryDate",
        "createdAt"
      FROM "Package"
      WHERE "userId" = (SELECT id FROM "User" WHERE email = 'ha@ha.com' LIMIT 1)
      LIMIT 1
    `)
    
    if (result.rowCount === 0) {
      console.log('No packages found')
      return
    }
    
    const pkg = result.rows[0]
    
    console.log('Raw database values:')
    console.log('  investmentDate:', pkg.investmentDate)
    console.log('  expiryDate:', pkg.expiryDate)
    console.log('  createdAt:', pkg.createdAt)
    
    console.log('\nAs ISO Strings:')
    console.log('  investmentDate:', pkg.investmentDate?.toISOString())
    console.log('  expiryDate:', pkg.expiryDate?.toISOString())
    
    console.log('\nWrapped in new Date():')
    console.log('  new Date(investmentDate):', new Date(pkg.investmentDate))
    console.log('  new Date(expiryDate):', new Date(pkg.expiryDate))
    
    console.log('\nTimestamps:')
    console.log('  investmentDate timestamp:', pkg.investmentDate?.getTime())
    console.log('  expiryDate timestamp:', pkg.expiryDate?.getTime())
    
    console.log('\nChecking epoch detection (< 86400000):')
    console.log('  investmentDate < 86400000?', pkg.investmentDate?.getTime() < 86400000)
    console.log('  expiryDate < 86400000?', pkg.expiryDate?.getTime() < 86400000)
    
    // Simulate what the formatter does
    const testDate = pkg.investmentDate
    if (!testDate) {
      console.log('\nFormatter would return: N/A (no date)')
    } else {
      const dateObj = testDate instanceof Date ? testDate : new Date(testDate)
      if (isNaN(dateObj.getTime())) {
        console.log('\nFormatter would return: N/A (invalid date)')
      } else if (dateObj.getTime() < 86400000) {
        console.log('\nFormatter would return: N/A (epoch detection)')
      } else {
        console.log('\nFormatter would return:', dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }))
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

testDateParsing()
