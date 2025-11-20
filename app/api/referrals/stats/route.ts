import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'

// Helper function to get network at a specific level
async function getNetworkAtLevel(referralCode: string, targetLevel: number): Promise<any[]> {
  try {
    if (targetLevel === 1) {
      return await query(
        `SELECT id, "referralCode" FROM "User" WHERE "referredBy" = $1`,
        [referralCode]
      )
    }

    const previousLevel = await getNetworkAtLevel(referralCode, targetLevel - 1)
    if (previousLevel.length === 0) return []

    const referralCodes = previousLevel.map(u => u.referralCode)
    const placeholders = referralCodes.map((_, i) => `$${i + 1}`).join(',')
    return await query(
      `SELECT id, "referralCode" FROM "User" WHERE "referredBy" IN (${placeholders})`,
      referralCodes
    )
  } catch (error) {
    console.error(`Error getting network at level ${targetLevel}:`, error)
    return []
  }
}

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    // Get user's referral code
    const currentUser = await queryOne(
      `SELECT "referralCode" FROM "User" WHERE id = $1`,
      [user.userId]
    )

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get total network size (all 6 levels)
    let totalNetwork = 0
    let networkValue = 0

    for (let level = 1; level <= 6; level++) {
      const usersAtLevel = await getNetworkAtLevel(currentUser.referralCode, level)
      totalNetwork += usersAtLevel.length

      if (usersAtLevel.length > 0) {
        const userIds = usersAtLevel.map(u => u.id)
        const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',')
        const levelInvestment = await queryOne(
          `SELECT COALESCE(SUM(amount), 0) as total FROM "Package" WHERE "userId" IN (${placeholders})`,
          userIds
        )
        networkValue += Number(levelInvestment.total || 0)
      }
    }

    // Get direct referrals count
    const directReferralsResult = await queryOne(
      `SELECT COUNT(*)::int as count FROM "User" WHERE "referredBy" = $1`,
      [currentUser.referralCode]
    )
    const directReferrals = directReferralsResult.count || 0

    // Get active bots
    const activeBotsResult = await queryOne(
      `SELECT COUNT(*)::int as count FROM "BotActivation" WHERE "userId" = $1 AND status = $2 AND "isExpired" = $3 LIMIT 1`,
      [user.userId, 'ACTIVE', false]
    )
    const activeBots = activeBotsResult.count > 0 ? 1 : 0

    // Get total referral earnings
    const totalReferralEarnings = await queryOne(
      `SELECT COALESCE(SUM(amount), 0) as total FROM "Earning" WHERE "userId" = $1 AND "earningType" IN ($2, $3)`,
      [user.userId, 'DIRECT_REFERRAL', 'LEVEL_INCOME']
    )

    const stats = {
      directReferrals,
      totalNetwork,
      networkValue,
      activeBots,
      totalReferralEarnings: Number(totalReferralEarnings.total || 0)
    }

    console.log(`📊 Referral stats for user ${user.userId}:`, stats)

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error('Get referral stats error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch referral statistics',
        message: error.message,
        // Return zeros as fallback
        stats: {
          directReferrals: 0,
          totalNetwork: 0,
          networkValue: 0,
          activeBots: 0,
          totalReferralEarnings: 0
        }
      },
      { status: 500 }
    )
  }
}

