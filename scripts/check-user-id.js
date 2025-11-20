const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function checkUser() {
  try {
    // Get the user with email ha@ha.com
    const result = await pool.query(`
      SELECT id, email, "fullName", "isAdmin"
      FROM "User"
      WHERE email = 'ha@ha.com'
    `)
    
    if (result.rowCount === 0) {
      console.log('User ha@ha.com not found')
    } else {
      const user = result.rows[0]
      console.log('User found:')
      console.log('  ID:', user.id)
      console.log('  Email:', user.email)
      console.log('  Name:', user.fullName)
      console.log('  Is Admin:', user.isAdmin)
      
      // Get transactions for this user
      const txResult = await pool.query(`
        SELECT id, type, amount, status, description, "createdAt"
        FROM "Transaction"
        WHERE "userId" = $1
        ORDER BY "createdAt" DESC
      `, [user.id])
      
      console.log(`\nTransactions for this user: ${txResult.rowCount}`)
      txResult.rows.forEach((tx, index) => {
        console.log(`  ${index + 1}. ${tx.type} - $${tx.amount} (${tx.status})`)
        console.log(`     ${tx.description}`)
        console.log(`     Created: ${tx.createdAt}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkUser()
