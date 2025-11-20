import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'
import { comparePassword } from '@/utils/server-helpers'


export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to disable 2FA' },
        { status: 400 }
      )
    }

    // Get user
    const dbUser = await queryOne(
      `SELECT * FROM "User" WHERE id = $1`,
      [user.userId]
    )

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, dbUser.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Disable 2FA
    await execute(
      `UPDATE "User" SET "twoFactorEnabled" = $1, "twoFactorSecret" = $2 WHERE id = $3`,
      [false, null, user.userId]
    )

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    })

  } catch (error) {
    console.error('Disable 2FA error:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}

