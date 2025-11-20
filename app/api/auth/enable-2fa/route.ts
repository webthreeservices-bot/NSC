import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'


export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${process.env.TWO_FACTOR_APP_NAME || 'NSC Bot Platform'} (${user.email})`,
      length: 32
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Store secret in database (not enabled yet)
    await execute(
      `UPDATE "User" SET "twoFactorSecret" = $1 WHERE id = $2`,
      [secret.base32, user.userId]
    )

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan the QR code with Google Authenticator and verify to enable 2FA'
    })

  } catch (error) {
    console.error('Enable 2FA error:', error)
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    )
  }
}

