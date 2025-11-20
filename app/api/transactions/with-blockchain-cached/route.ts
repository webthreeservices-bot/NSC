import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { neonQuery } from '@/lib/neon-serverless'
import { fetchCompleteTransactionData } from '@/lib/blockchain-scanner'

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/transactions/with-blockchain-cached
 * Get user's transactions WITH blockchain data (uses database cache)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authenticateToken(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    // Get user's transactions with cached blockchain data
    const transactions = await neonQuery(
      `SELECT 
        id, 
        "userId", 
        type, 
        amount, 
        "txHash", 
          network, 
          description, 
          status, 
          "createdAt",
          "updatedAt",
          "blockchainData",
          "blockchainVerified",
          "blockchainLastChecked",
          "fromAddress",
          "toAddress",
          "blockNumber",
          "onChainValue",
          "blockchainStatus",
          "blockTimestamp",
          "explorerUrl"
        FROM "Transaction" 
        WHERE "userId" = $1 
        ORDER BY "createdAt" DESC
        LIMIT 100`,
        [user.userId]
  )
      
      // Check which transactions need blockchain data update
      const transactionsToUpdate = transactions.filter((tx: any) => {
        // Skip if no valid txHash
        if (!tx.txHash || tx.txHash === 'N/A' || 
            tx.txHash.startsWith('ADMIN_') || tx.txHash.startsWith('BOT-')) {
          return false
        }
        
        // Skip if not a blockchain network
        if (!tx.network || !['BEP20', 'TRC20'].includes(tx.network)) {
          return false
        }
        
        // Check if needs update using database function
        const needsUpdate = !tx.blockchainLastChecked || // Never checked
          !tx.blockchainVerified || // Not verified yet
          tx.blockchainStatus === 'pending' || // Still pending
          (Date.now() - new Date(tx.blockchainLastChecked).getTime() > 24 * 60 * 60 * 1000) // Last checked > 24h ago
        
        return needsUpdate
      })
      
      // Fetch and update blockchain data for transactions that need it
      if (transactionsToUpdate.length > 0) {
        await Promise.all(
          transactionsToUpdate.map(async (tx: any) => {
            try {
              const blockchainData = await fetchCompleteTransactionData(
                tx.txHash,
                tx.network as 'BEP20' | 'TRC20'
              )
              
              if (blockchainData) {
                // Update database with blockchain data (use neonQuery)
                await neonQuery(
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
                
                // Update the transaction in our array
                Object.assign(tx, {
                  blockchainData: JSON.stringify(blockchainData),
                  blockchainVerified: true,
                  fromAddress: blockchainData.from,
                  toAddress: blockchainData.to,
                  blockNumber: blockchainData.blockNumber,
                  onChainValue: blockchainData.value,
                  blockchainStatus: blockchainData.status,
                  blockTimestamp: blockchainData.timestamp,
                  explorerUrl: blockchainData.explorerUrl
                })
              } else {
                // Mark as checked but not verified
                await neonQuery(
                  `UPDATE "Transaction"
                   SET 
                     "blockchainLastChecked" = CURRENT_TIMESTAMP,
                     "updatedAt" = CURRENT_TIMESTAMP
                   WHERE id = $1`,
                  [tx.id]
                )
              }
            } catch (error) {
              console.error(`Error fetching blockchain data for ${tx.txHash}:`, error)
            }
          })
        )
      }
      
      // Format response with blockchain data
      const formattedTransactions = transactions.map((tx: any) => {
        let blockchain = null
        
        if (tx.blockchainData) {
          try {
            blockchain = typeof tx.blockchainData === 'string' 
              ? JSON.parse(tx.blockchainData) 
              : tx.blockchainData
          } catch (e) {
            // Construct from individual fields if JSON parse fails
            if (tx.blockchainVerified) {
              blockchain = {
                hash: tx.txHash,
                from: tx.fromAddress,
                to: tx.toAddress,
                value: parseFloat(tx.onChainValue || 0),
                blockNumber: tx.blockNumber,
                timestamp: tx.blockTimestamp,
                status: tx.blockchainStatus,
                network: tx.network,
                explorerUrl: tx.explorerUrl
              }
            }
          }
        }
        
        return {
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          txHash: tx.txHash,
          network: tx.network,
          description: tx.description,
          status: tx.status,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
          blockchain,
          blockchainVerified: tx.blockchainVerified,
          onChainValue: tx.onChainValue
        }
      })
      
      return NextResponse.json({
        success: true,
        transactions: formattedTransactions,
        stats: {
          total: transactions.length,
          verified: transactions.filter((t: any) => t.blockchainVerified).length,
          pending: transactionsToUpdate.length
        }
      })
      
  } catch (error: any) {
    console.error('Error fetching transactions with blockchain data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    )
  }
}
