import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken, requireAdmin } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    console.log('Starting financial stats fetch...')
    
    // Set a timeout for financial stats
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Financial stats timeout')), 10000) // 10 second timeout
    })

    // Get financial data with error handling
    const financialStatsPromise = async () => {
      try {
        // Direct SQL queries for financial stats
        const [
          totalInvested,
          totalWithdrawals,
          pendingWithdrawals,
          totalEarnings,
          activeBots
        ] = await Promise.all([
          // Total invested (sum of Package amounts)
          queryOne<{ total: number }>('SELECT COALESCE(SUM(amount), 0)::int AS total FROM "Package"')
            .then(res => res?.total || 0)
            .catch(() => 0),
          
          // Total completed withdrawals
          queryOne<{ total: number }>('SELECT COALESCE(SUM("netAmount"), 0)::int AS total FROM "Withdrawal" WHERE status = \'COMPLETED\'')
            .then(res => res?.total || 0)
            .catch(() => 0),
          
          // Pending withdrawals count
          queryOne<{ count: number }>('SELECT COUNT(*)::int FROM "Withdrawal" WHERE status = \'PENDING\'')
            .then(res => res?.count || 0)
            .catch(() => 0),
          
          // Total earnings (sum of Earning amounts)
          queryOne<{ total: number }>('SELECT COALESCE(SUM(amount), 0)::int AS total FROM "Earning"')
            .then(res => res?.total || 0)
            .catch(() => 0),
          
          // Active bots count
          queryOne<{ count: number }>('SELECT COUNT(*)::int FROM "Bot" WHERE status = \'ACTIVE\' AND "isExpired" = false')
            .then(res => res?.count || 0)
            .catch(() => 0)
        ])

        return {
          totalInvested,
          totalWithdrawals,
          pendingWithdrawals,
          totalEarnings,
          activeBots
        }
      } catch (error) {
        console.error('Error in financial stats promise:', error)
        throw error
      }
    }

    // Race against timeout
    const financialData = await Promise.race([
      financialStatsPromise(),
      timeoutPromise
    ]) as any

    console.log('Financial stats fetched successfully')

    return NextResponse.json({
      success: true,
      financial: financialData
    })

  } catch (error) {
    console.error('Get financial stats error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch financial statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
        financial: {
          totalInvested: 0,
          totalWithdrawals: 0,
          totalEarnings: 0,
          pendingWithdrawals: 0,
          activeBots: 0
        }
      },
      { status: 200 } // Return 200 with fallback data instead of 500
    )
  }
}
