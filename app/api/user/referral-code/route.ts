import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'


export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    const dbUser = await queryOne(
      `SELECT "referralCode" FROM "User" WHERE id = $1`,
      [user.userId]
    )

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?ref=${dbUser.referralCode}`

    return NextResponse.json({
      success: true,
      referralCode: dbUser.referralCode,
      referralLink
    })

  } catch (error) {
    console.error('Get referral code error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral code' },
      { status: 500 }
    )
  }
}

