/**
 * Blockchain Data Sync Cron Job
 * Automatically fetches and caches blockchain data for all transactions
 * Runs periodically to keep blockchain data up-to-date
 */

import pool from '@/lib/db-connection'
import { fetchCompleteTransactionData } from '@/lib/blockchain-scanner'

export async function syncBlockchainData() {
  console.log('[Blockchain Sync] Starting blockchain data sync...')
  
  const client = await pool.connect()
  
  try {
    // Get transactions that need blockchain data update
    const result = await client.query(
      `SELECT 
        id,
        "txHash",
        network,
        amount,
        "blockchainVerified",
        "blockchainLastChecked",
        "blockchainStatus"
      FROM "Transaction"
      WHERE 
        "txHash" IS NOT NULL 
        AND "txHash" != 'N/A'
        AND "txHash" NOT LIKE 'ADMIN_%'
        AND "txHash" NOT LIKE 'BOT-%'
        AND network IN ('BEP20', 'TRC20')
        AND (
          "blockchainLastChecked" IS NULL -- Never checked
          OR "blockchainVerified" = false -- Not verified yet
          OR "blockchainStatus" = 'pending' -- Still pending
          OR ("blockchainStatus" = 'confirmed' 
              AND "blockchainLastChecked" < CURRENT_TIMESTAMP - INTERVAL '7 days') -- Recheck confirmed after 7 days
        )
      ORDER BY 
        CASE 
          WHEN "blockchainLastChecked" IS NULL THEN 0 -- Never checked = highest priority
          WHEN "blockchainStatus" = 'pending' THEN 1 -- Pending = high priority
          WHEN "blockchainVerified" = false THEN 2 -- Not verified = medium priority
          ELSE 3 -- Rechecking confirmed = low priority
        END,
        "createdAt" DESC
      LIMIT 100` // Process 100 transactions per run
    )
    
    const transactions = result.rows
    console.log(`[Blockchain Sync] Found ${transactions.length} transactions to sync`)
    
    if (transactions.length === 0) {
      console.log('[Blockchain Sync] No transactions need updating')
      return {
        success: true,
        processed: 0,
        verified: 0,
        failed: 0
      }
    }
    
    let verified = 0
    let failed = 0
    
    // Process transactions in batches of 10 to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (tx: any) => {
          try {
            console.log(`[Blockchain Sync] Fetching data for txHash: ${tx.txHash}`)
            
            const blockchainData = await fetchCompleteTransactionData(
              tx.txHash,
              tx.network as 'BEP20' | 'TRC20'
            )
            
            if (blockchainData) {
              // Update database with blockchain data
              await client.query(
                `UPDATE "Transaction"
                 SET 
                   "blockchainData" = $1,
                   "blockchainVerified" = true,
                   "blockchainLastChecked" = CURRENT_TIMESTAMP,
                   "fromAddress" = $2,
                   "toAddress" = $3,
                   "blockNumber" = $4,
                   "onChainValue" = $5,
                   "blockchainStatus" = $6,
                   "blockTimestamp" = $7,
                   "explorerUrl" = $8,
                   "updatedAt" = CURRENT_TIMESTAMP
                 WHERE id = $9`,
                [
                  JSON.stringify(blockchainData),
                  blockchainData.from,
                  blockchainData.to,
                  blockchainData.blockNumber,
                  blockchainData.value,
                  blockchainData.status,
                  blockchainData.timestamp,
                  blockchainData.explorerUrl,
                  tx.id
                ]
              )
              
              verified++
              console.log(`[Blockchain Sync] ✓ Verified ${tx.txHash} - Status: ${blockchainData.status}`)
              
              // Check for amount discrepancy
              const discrepancy = Math.abs(parseFloat(tx.amount) - blockchainData.value)
              if (discrepancy > 0.01) {
                console.warn(
                  `[Blockchain Sync] ⚠️ DISCREPANCY DETECTED!`,
                  `TxHash: ${tx.txHash}`,
                  `Claimed: $${tx.amount}`,
                  `Actual: $${blockchainData.value}`,
                  `Difference: $${discrepancy}`
                )
              }
            } else {
              // Blockchain data not found - mark as checked
              await client.query(
                `UPDATE "Transaction"
                 SET 
                   "blockchainLastChecked" = CURRENT_TIMESTAMP,
                   "updatedAt" = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [tx.id]
              )
              
              failed++
              console.log(`[Blockchain Sync] ✗ Not found: ${tx.txHash}`)
            }
          } catch (error: any) {
            console.error(`[Blockchain Sync] Error processing ${tx.txHash}:`, error.message)
            failed++
            
            // Still mark as checked to avoid retrying immediately
            await client.query(
              `UPDATE "Transaction"
               SET 
                 "blockchainLastChecked" = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [tx.id]
            )
          }
        })
      )
      
      // Wait between batches to respect rate limits
      if (i + batchSize < transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      }
    }
    
    console.log(`[Blockchain Sync] Completed! Verified: ${verified}, Failed: ${failed}`)
    
    return {
      success: true,
      processed: transactions.length,
      verified,
      failed
    }
    
  } catch (error: any) {
    console.error('[Blockchain Sync] Error:', error)
    return {
      success: false,
      error: error.message,
      processed: 0,
      verified: 0,
      failed: 0
    }
  } finally {
    client.release()
  }
}

// Export for manual execution
export default syncBlockchainData
