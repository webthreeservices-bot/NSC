import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'
import speakeasy from 'speakeasy'


export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: '2FA code is required' },
        { status: 400 }
      )
    }

    // Get user's secret
    const dbUser = await queryOne(
      `SELECT "twoFactorSecret" FROM "User" WHERE id = $1`,
      [user.userId]
    )

    if (!dbUser?.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA not set up. Please enable 2FA first.' },
        { status: 400 }
      )
    }

    // Verify code
    const isValid = speakeasy.totp.verify({
      secret: dbUser.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid 2FA code' },
        { status: 401 }
      )
    }

    // Enable 2FA
    await execute(
      `UPDATE "User" SET "twoFactorEnabled" = $1 WHERE id = $2`,
      [true, user.userId]
    )

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully'
    })

  } catch (error) {
    console.error('Verify 2FA error:', error)
    return NextResponse.json(
      { error: 'Failed to verify 2FA code' },
      { status: 500 }
    )
  }
}

