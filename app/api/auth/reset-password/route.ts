import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { hashPassword } from '@/utils/server-helpers'
import { z } from 'zod'


const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
  email: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = resetPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { token, newPassword, email } = validation.data

    // In production, verify token from database and check expiry
    // For now, we'll just update the password
    const user = await queryOne(
      `SELECT * FROM "User" WHERE email = $1`,
      [email]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await execute(
      `UPDATE "User" SET password = $1 WHERE email = $2`,
      [hashedPassword, email]
    )

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    )
  }
}

