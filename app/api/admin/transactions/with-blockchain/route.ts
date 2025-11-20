import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { neonQuery } from '@/lib/neon-serverless'
import { fetchCompleteTransactionData } from '@/lib/blockchain-scanner'

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/transactions/with-blockchain
 * Get ALL transactions WITH live blockchain data (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authenticateToken(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    // Check admin access
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get ALL transactions with user details using Neon Serverless
    const transactions = await neonQuery(
      `SELECT
        t.id,
        t."userId",
        t.type,
        t.amount,
        t."txHash",
        t.network,
        t.description,
        t.status,
        t."createdAt",
        t."updatedAt",
        u.email as "userEmail",
        u."fullName" as "userName"
      FROM "Transaction" t
      LEFT JOIN "User" u ON t."userId" = u.id
      ORDER BY t."createdAt" DESC
      LIMIT 500`
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
      
      // Calculate stats
      const stats = {
        total: transactions.length,
        withBlockchainData: transactionsWithBlockchainData.filter(t => t.blockchain !== null).length,
        totalVolume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        byNetwork: {
          BEP20: transactions.filter(t => t.network === 'BEP20').length,
          TRC20: transactions.filter(t => t.network === 'TRC20').length
        }
      }
      
    return NextResponse.json({
      success: true,
      transactions: transactionsWithBlockchainData,
      stats
    })

  } catch (error: any) {
    console.error('Error fetching admin transactions with blockchain data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    )
  }
}
