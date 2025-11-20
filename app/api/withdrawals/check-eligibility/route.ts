import { NextRequest, NextResponse } from 'next/server'
import { neonQuery } from '@/lib/neon-serverless'
import { authenticateToken } from '@/middleware/auth'
import { canWithdraw } from '@/utils/calculations'
import { getWithdrawableBalanceOptimized } from '@/services/roiService'

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    // Get last withdrawal
    const lastWithdrawals = await neonQuery(
      `SELECT * FROM "Withdrawal"
       WHERE "userId" = $1 AND status = 'COMPLETED'
       ORDER BY "createdAt" DESC
       LIMIT 1`,
      [user.userId]
    )

    const lastWithdrawal = lastWithdrawals.length > 0 ? lastWithdrawals[0] : null

    // Check 30-day rule
    const canWithdrawNow = canWithdraw(lastWithdrawal?.createdAt || null)

    let nextWithdrawalDate = null
    if (!canWithdrawNow && lastWithdrawal) {
      nextWithdrawalDate = new Date(lastWithdrawal.createdAt)
      nextWithdrawalDate.setDate(nextWithdrawalDate.getDate() + 30)
    }

    // Get user's withdrawable balance
    const balance = await getWithdrawableBalanceOptimized(user.userId)

    // Get expired packages (capital withdrawal)
    const expiredPackages = await neonQuery(
      `SELECT * FROM "Package"
       WHERE "userId" = $1 AND status = 'EXPIRED'`,
      [user.userId]
    )

    const availableCapital = expiredPackages.reduce(
      (sum, pkg) => sum + Number(pkg.amount),
      0
    )

    return NextResponse.json({
      success: true,
      eligible: canWithdrawNow && balance.totalBalance >= 20,
      reason: !canWithdrawNow
        ? '30-day cooldown period not met'
        : balance.totalBalance < 20
        ? 'Minimum withdrawal is $20'
        : null,
      nextWithdrawalDate,
      availableBalance: balance.totalBalance,
      roiBalance: balance.roiBalance,
      referralBalance: balance.referralBalance,
      levelBalance: balance.levelBalance,
      availableCapital,
      lockedCapital: balance.lockedCapital
    })

  } catch (error) {
    console.error('Check eligibility error:', error)

    // Ensure Next.js build does NOT fail
    return NextResponse.json({
      success: true,
      eligible: false,
      reason: 'Service temporarily unavailable',
      nextWithdrawalDate: null,
      availableBalance: 0,
      roiBalance: 0,
      referralBalance: 0,
      levelBalance: 0,
      availableCapital: 0,
      lockedCapital: 0
    })
  }
}
