import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'

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

    // Get direct referrals
    const referrals = await query(
      `SELECT id, username, email, "fullName", "createdAt", "isActive"
       FROM "User"
       WHERE "referredBy" = $1
       ORDER BY "createdAt" DESC`,
      [currentUser.referralCode]
    )

    // Get packages for each referral
    for (const referral of referrals) {
      const packages = await query(
        `SELECT amount, status FROM "Package" WHERE "userId" = $1 AND status = $2`,
        [referral.id, 'ACTIVE']
      )
      referral.packages = packages
    }

    // Calculate statistics
    const totalCount = referrals.length
    const totalInvested = referrals.reduce((sum, ref) => {
      const userInvestment = ref.packages.reduce((s, p) => s + Number(p.amount), 0)
      return sum + userInvestment
    }, 0)

    // Get total earned from direct referrals
    const totalEarned = await queryOne(
      `SELECT COALESCE(SUM(amount), 0) as total FROM "Earning" WHERE "userId" = $1 AND "earningType" = $2`,
      [user.userId, 'DIRECT_REFERRAL']
    )

    const response = {
      referrals: referrals.map(ref => ({
        ...ref,
        totalInvested: ref.packages.reduce((s, p) => s + Number(p.amount), 0),
        activePackages: ref.packages.filter(p => p.status === 'ACTIVE').length
      })),
      totalCount,
      totalInvested,
      totalEarned: Number(totalEarned.total || 0)
    }

    console.log(`📊 Direct referrals for user ${user.userId}:`, {
      count: response.totalCount,
      totalInvested: response.totalInvested,
      totalEarned: response.totalEarned
    })

    return NextResponse.json({
      success: true,
      ...response
    })

  } catch (error: any) {
    console.error('Get direct referrals error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch direct referrals',
        message: error.message,
        // Return empty data as fallback
        referrals: [],
        totalCount: 0,
        totalInvested: 0,
        totalEarned: 0
      },
      { status: 500 }
    )
  }
}

