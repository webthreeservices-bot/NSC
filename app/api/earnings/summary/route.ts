import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { getWithdrawableBalanceOptimized } from '@/services/roiService'

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  try {
    // Get complete earnings summary with fallback
    let balance
    try {
      balance = await getWithdrawableBalanceOptimized(user.userId)
    } catch (error) {
      console.error('Optimized balance fetch failed, using fallback:', error)
      // Fallback is already handled in getWithdrawableBalanceOptimized
      // But just in case, return zeros
      balance = {
        roiBalance: 0,
        referralBalance: 0,
        levelBalance: 0,
        totalBalance: 0,
        lockedCapital: 0
      }
    }

    // Ensure all values are numbers
    const safeNumber = (val: any) => Number(val) || 0

    const summary = {
      totalEarnings: safeNumber(balance.roiBalance) + safeNumber(balance.referralBalance) + safeNumber(balance.levelBalance),
      roiEarnings: safeNumber(balance.roiBalance),
      referralEarnings: safeNumber(balance.referralBalance),
      levelEarnings: safeNumber(balance.levelBalance),
      withdrawableBalance: safeNumber(balance.totalBalance),
      lockedCapital: safeNumber(balance.lockedCapital)
    }

    console.log(`📊 Earnings summary for user ${user.userId}:`, summary)

    return NextResponse.json({
      success: true,
      summary
    })

  } catch (error: any) {
    console.error('Get earnings summary error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch earnings summary',
        message: error.message || 'An unexpected error occurred',
        // Return zeros as fallback
        summary: {
          totalEarnings: 0,
          roiEarnings: 0,
          referralEarnings: 0,
          levelEarnings: 0,
          withdrawableBalance: 0,
          lockedCapital: 0
        }
      },
      { status: 500 }
    )
  }
}
