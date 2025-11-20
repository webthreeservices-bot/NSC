/**
 * API Route: Manually Verify Payment
 * POST /api/payments/[id]/verify
 */

import { NextRequest, NextResponse } from 'next/server'
import { manuallyVerifyPayment } from '@/services/paymentGatewayService'
import { authenticateToken } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    const { id: paymentRequestId } = await params
    const body = await request.json()
    const { txHash } = body

    if (!txHash) {
      return NextResponse.json({ error: 'Transaction hash is required' }, { status: 400 })
    }

    // Verify payment request belongs to user
    const paymentRequest = await queryOne(
      `SELECT * FROM "PaymentRequest" WHERE id = $1`,
      [paymentRequestId]
    )

    if (!paymentRequest) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 })
    }

    if (paymentRequest.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify payment
    const result = await manuallyVerifyPayment(paymentRequestId, txHash)

    return NextResponse.json({
      success: true,
      message: 'Payment verification initiated successfully',
      data: result,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      {
        error: 'Failed to verify payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
