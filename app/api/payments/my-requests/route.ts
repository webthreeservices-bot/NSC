/**
 * API Route: Get User Payment Requests
 * GET /api/payments/my-requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserPaymentRequests } from '@/services/paymentGatewayService'
import { authenticateToken } from '@/middleware/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any

    // Get payment requests
    const paymentRequests = await getUserPaymentRequests(user.id, status)

    return NextResponse.json({
      success: true,
      data: paymentRequests,
    })
  } catch (error) {
    console.error('Error fetching payment requests:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch payment requests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
