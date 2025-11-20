import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { sendPasswordResetEmail } from '@/utils/email'
import { generateRandomToken } from '@/utils/server-helpers'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await queryOne(
      `SELECT * FROM "User" WHERE email = $1`,
      [email]
    )

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      })
    }

    // Generate reset token
    const resetToken = generateRandomToken()
    
    // In production, store this token in database with expiry
    // For now, send email directly
    await sendPasswordResetEmail(user.email, resetToken)

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

