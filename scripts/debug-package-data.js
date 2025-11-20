const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function checkActualData() {
  try {
    // Get packages directly from database
    const result = await pool.query(`
      SELECT 
        id,
        "packageType",
        amount,
        "investmentDate",
        "expiryDate",
        "nextRoiDate",
        "createdAt",
        status
      FROM "Package"
      WHERE "userId" = (SELECT id FROM "User" WHERE email = 'ha@ha.com' LIMIT 1)
      ORDER BY "createdAt" DESC
      LIMIT 5
    `)
    
    console.log(`Found ${result.rowCount} packages:\n`)
    
    result.rows.forEach((pkg, i) => {
      console.log(`${i+1}. ${pkg.packageType} Package - ${pkg.status}`)
      console.log(`   Amount: $${pkg.amount}`)
      console.log(`   Investment Date (raw):`, pkg.investmentDate)
      console.log(`   Investment Date (ISO):`, pkg.investmentDate?.toISOString?.())
      console.log(`   Expiry Date (raw):`, pkg.expiryDate)
      console.log(`   Expiry Date (ISO):`, pkg.expiryDate?.toISOString?.())
      console.log(`   Next ROI Date:`, pkg.nextRoiDate)
      console.log(`   Created At:`, pkg.createdAt)
      
      // Check if dates are null
      if (pkg.investmentDate === null) console.log('   ⚠️  investmentDate is NULL!')
      if (pkg.expiryDate === null) console.log('   ⚠️  expiryDate is NULL!')
      
      console.log('')
    })
    
    // Also check what the API would return
    console.log('\n--- Simulating API toISOString conversion ---\n')
    
    const pkg = result.rows[0]
    if (pkg) {
      const toISOString = (date) => {
        if (!date) return null
        if (date instanceof Date) {
          return isNaN(date.getTime()) ? null : date.toISOString()
        }
        if (typeof date === 'string') {
          const parsed = new Date(date)
          return isNaN(parsed.getTime()) ? null : parsed.toISOString()
        }
        return null
      }
      
      console.log('API would return:')
      console.log('  investmentDate:', toISOString(pkg.investmentDate))
      console.log('  expiryDate:', toISOString(pkg.expiryDate))
      console.log('  nextRoiDate:', toISOString(pkg.nextRoiDate))
    }
    
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error)
  } finally {
    await pool.end()
  }
}

checkActualData()
