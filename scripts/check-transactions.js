const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function checkTransactions() {
  try {
    console.log('Checking transactions...\n')
    
    // Get all transactions
    const result = await pool.query(`
      SELECT 
        t.id, 
        t.type, 
        t.amount, 
        t.status, 
        t.description, 
        t."userId",
        t."txHash",
        t.network,
        t."createdAt",
        u.email,
        u."fullName"
      FROM "Transaction" t
      LEFT JOIN "User" u ON t."userId" = u.id
      ORDER BY t."createdAt" DESC
      LIMIT 20
    `)
    
    console.log(`Total transactions found: ${result.rowCount}\n`)
    
    if (result.rowCount === 0) {
      console.log('No transactions in database')
    } else {
      result.rows.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.type} - $${tx.amount}`)
        console.log(`   User: ${tx.email} (${tx.fullName})`)
        console.log(`   Status: ${tx.status}`)
        console.log(`   Description: ${tx.description}`)
        console.log(`   Created: ${tx.createdAt}`)
        console.log(`   TxHash: ${tx.txHash || 'N/A'}`)
        console.log(`   Network: ${tx.network || 'N/A'}`)
        console.log('')
      })
    }
    
    // Check bot activations
    const botResult = await pool.query(`
      SELECT 
        ba.id,
        ba."botType",
        ba."activationFee",
        ba.status,
        ba."createdAt",
        u.email,
        u."fullName"
      FROM "BotActivation" ba
      LEFT JOIN "User" u ON ba."userId" = u.id
      ORDER BY ba."createdAt" DESC
      LIMIT 10
    `)
    
    console.log(`\nBot Activations found: ${botResult.rowCount}\n`)
    
    if (botResult.rowCount > 0) {
      botResult.rows.forEach((bot, index) => {
        console.log(`${index + 1}. ${bot.botType} Bot`)
        console.log(`   User: ${bot.email} (${bot.fullName})`)
        console.log(`   Fee: $${bot.activationFee}`)
        console.log(`   Status: ${bot.status}`)
        console.log(`   Created: ${bot.createdAt}`)
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkTransactions()
