import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'

// Helper function to get users at specific level
async function getNetworkAtLevel(referralCode: string, targetLevel: number): Promise<any[]> {
  try {
    if (targetLevel === 1) {
      // Direct referrals
      return await query(
        `SELECT id, "referralCode" FROM "User" WHERE "referredBy" = $1`,
        [referralCode]
      )
    }

    // Get previous level
    const previousLevel = await getNetworkAtLevel(referralCode, targetLevel - 1)

    if (previousLevel.length === 0) return []

    // Get referrals of previous level
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

    // Get all users in network (up to 6 levels deep)
    const levels = []

    for (let level = 1; level <= 6; level++) {
      try {
        // Get users at this level
        const usersAtLevel = await getNetworkAtLevel(currentUser.referralCode, level)
        
        // Calculate total invested at this level (all packages)
        let totalInvested = 0
        if (usersAtLevel.length > 0) {
          const userIds = usersAtLevel.map(u => u.id)
          const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',')
          const investment = await queryOne(
            `SELECT COALESCE(SUM(amount), 0) as total FROM "Package" WHERE "userId" IN (${placeholders})`,
            userIds
          )
          totalInvested = Number(investment.total || 0)
        }

        // Get total earned from this level
        let totalEarned = 0
        const earnings = await queryOne(
          `SELECT COALESCE(SUM(amount), 0) as total FROM "Earning" WHERE "userId" = $1 AND "earningType" = $2 AND level = $3`,
          [user.userId, 'LEVEL_INCOME', level]
        )
        totalEarned = Number(earnings.total || 0)

        levels.push({
          level,
          count: usersAtLevel.length,
          totalInvested,
          totalEarned
        })
      } catch (levelError) {
        console.error(`Error processing level ${level}:`, levelError)
        // Add empty level data to maintain the structure
        levels.push({
          level,
          count: 0,
          totalInvested: 0,
          totalEarned: 0
        })
      }
    }

    console.log(`📊 Level breakdown for user ${user.userId}:`, levels)

    return NextResponse.json({
      success: true,
      levels
    })

  } catch (error: any) {
    console.error('Get level breakdown error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch level breakdown',
        message: error.message,
        // Return empty levels array as fallback
        levels: Array.from({ length: 6 }, (_, i) => ({
          level: i + 1,
          count: 0,
          totalInvested: 0,
          totalEarned: 0
        }))
      },
      { status: 500 }
    )
  }
}

