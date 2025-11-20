import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { neonQuery } from '@/lib/neon-serverless'
import { fetchCompleteTransactionData } from '@/lib/blockchain-scanner'

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/transactions/with-blockchain
 * Get user's transactions WITH live blockchain data
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authenticateToken(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    // Get user's transactions
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
        "updatedAt"
      FROM "Transaction" 
      WHERE "userId" = $1 
      ORDER BY "createdAt" DESC
      LIMIT 100`,
      [user.userId]
    )
    
    // Fetch blockchain data for each transaction with valid txHash
    const transactionsWithBlockchainData = await Promise.all(
      transactions.map(async (tx: any) => {
        let blockchainData = null
        
        // Only fetch if txHash exists and is a real blockchain hash
        if (
          tx.txHash && 
          tx.txHash !== 'N/A' && 
          !tx.txHash.startsWith('ADMIN_') &&
          !tx.txHash.startsWith('BOT-') &&
          tx.network &&
          ['BEP20', 'TRC20'].includes(tx.network)
        ) {
          try {
            blockchainData = await fetchCompleteTransactionData(
              tx.txHash, 
              tx.network as 'BEP20' | 'TRC20'
            )
          } catch (error) {
            console.error(`Error fetching blockchain data for ${tx.txHash}:`, error)
          }
        }
        
        return {
          ...tx,
          blockchain: blockchainData
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      transactions: transactionsWithBlockchainData
    })
    
  } catch (error: any) {
    console.error('Error fetching transactions with blockchain data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    )
  }
}
