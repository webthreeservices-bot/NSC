/**
 * API Route: Payment System Status (Real-time tracking)
 * GET /api/payments/status?paymentRequestId=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentRequestStatus } from '@/services/paymentGatewayService'
import { authenticateToken } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    // Get query params
    const { searchParams } = new URL(request.url)
    const paymentRequestId = searchParams.get('paymentRequestId')

    if (!paymentRequestId) {
      return NextResponse.json({ error: 'paymentRequestId is required' }, { status: 400 })
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

    // Get detailed status
    const status = await getPaymentRequestStatus(paymentRequestId)

    // Get additional context for the UI
    const context = {
      canRetry: status.status === 'FAILED' || status.status === 'EXPIRED',
      canCancel: status.status === 'PENDING',
      showQR: status.status === 'PENDING',
      showProgress: status.status === 'CONFIRMING',
      isComplete: status.status === 'COMPLETED',
      isFailed: status.status === 'FAILED' || status.status === 'EXPIRED',
    }

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        context,
      },
    })
  } catch (error) {
    console.error('Error fetching payment status:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch payment status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

