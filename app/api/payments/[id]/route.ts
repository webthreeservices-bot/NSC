/**
 * API Route: Get Payment Request Status
 * GET /api/payments/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentRequestStatus } from '@/services/paymentGatewayService'
import { authenticateToken } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'

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

    // Get payment status
    const status = await getPaymentRequestStatus(paymentRequestId)

    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('Error fetching payment request status:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch payment request status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
