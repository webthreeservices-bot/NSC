const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function checkPackageDates() {
  try {
    // Get packages for user ha@ha.com
    const result = await pool.query(`
      SELECT 
        p.id,
        p."packageType",
        p.amount,
        p."investmentDate",
        p."expiryDate",
        p."createdAt",
        p."updatedAt",
        u.email
      FROM "Package" p
      LEFT JOIN "User" u ON p."userId" = u.id
      WHERE u.email = 'ha@ha.com'
      ORDER BY p."createdAt" DESC
    `)
    
    console.log(`Found ${result.rowCount} packages:\n`)
    
    result.rows.forEach((pkg, i) => {
      console.log(`${i+1}. ${pkg.packageType} - $${pkg.amount}`)
      console.log(`   Investment Date: ${pkg.investmentDate}`)
      console.log(`   Investment Date (timestamp): ${pkg.investmentDate?.getTime()}`)
      console.log(`   Expiry Date: ${pkg.expiryDate}`)
      console.log(`   Expiry Date (timestamp): ${pkg.expiryDate?.getTime()}`)
      console.log(`   Created At: ${pkg.createdAt}`)
      console.log(`   Updated At: ${pkg.updatedAt}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error)
  } finally {
    await pool.end()
  }
}

checkPackageDates()
