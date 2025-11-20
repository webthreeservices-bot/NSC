import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { neonQuery } from '@/lib/neon-serverless'

/**
 * GET /api/transactions
 * Get all transactions for the authenticated user
 */
export async function GET(request: NextRequest) {
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    console.log('[Transactions API] Fetching for user:', user.userId, user.email)

    // Get all transactions for this user, ordered by most recent first
    const result = await neonQuery(
      `SELECT * FROM "Transaction"
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC`,
      [user.userId]
    )

    // Ensure result is an array (neonQuery should return array)
    const transactions = Array.isArray(result) ? result : []

    console.log('[Transactions API] Found transactions:', transactions.length)
    if (transactions.length > 0) {
      console.log('[Transactions API] Sample:', transactions[0])
    }

    return NextResponse.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        status: tx.status,
        description: tx.description || '',
        txHash: tx.txHash,
        network: tx.network,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt
      }))
    })
  } catch (error: any) {
    console.error('[Transactions API] Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
