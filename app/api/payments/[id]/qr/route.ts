/**
 * API Route: Get Payment QR Code
 * GET /api/payments/[id]/qr
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { authenticateToken } from '@/middleware/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult
    const { id: paymentRequestId } = await params

    // Get payment request with user verification
    const paymentRequest = await queryOne(
      `SELECT "qrCodeData", "userId" FROM "PaymentRequest" WHERE id = $1`,
      [paymentRequestId]
    )

    if (!paymentRequest || !paymentRequest.qrCodeData) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Verify ownership - only the user who created the payment or an admin can access the QR
    if (paymentRequest.userId !== user.userId && !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
    }

    // Extract base64 data
    const base64Data = paymentRequest.qrCodeData.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Return image
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching QR code:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch QR code',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
