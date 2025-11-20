import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { getReferralTreeOptimized } from '@/services/referralService'

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const maxLevel = level ? parseInt(level) : 6

    // Get referral tree
    const tree = await getReferralTreeOptimized(user.userId, maxLevel)

    return NextResponse.json({
      success: true,
      tree
    })

  } catch (error) {
    console.error('Get referral tree error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral tree' },
      { status: 500 }
    )
  }
}
