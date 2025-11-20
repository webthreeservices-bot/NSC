import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'
import { comparePassword, hashPassword } from '@/utils/server-helpers'
import { z } from 'zod'


const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
})

export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  try {
    const body = await request.json()

    const validation = changePasswordSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(', ')
      console.log('Password change validation error:', errors)
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: errors,
          details: errors
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error: 'New password must be different from current password',
          message: 'New password must be different from current password'
        },
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
        {
          error: 'User not found',
          message: 'User account not found. Please login again.'
        },
        { status: 404 }
      )
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, dbUser.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: 'Current password is incorrect',
          message: 'The current password you entered is incorrect. Please try again.'
        },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await execute(
      `UPDATE "User" SET password = $1, "updatedAt" = $2 WHERE id = $3`,
      [hashedPassword, new Date(), user.userId]
    )

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error: any) {
    console.error('Change password error:', error)

    // Provide more specific error messages
    let errorMessage = 'Failed to change password'
    if (error.message) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      } else if (error.message.includes('connection')) {
        errorMessage = 'Database connection error. Please try again.'
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: errorMessage,
        details: error.message
      },
      { status: 500 }
    )
  }
}

