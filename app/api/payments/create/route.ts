/**
 * API Route: Create Payment Request
 * POST /api/payments/create
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPaymentRequest } from '@/services/paymentGatewayService'
import { authenticateToken } from '@/middleware/auth'
import { handleOptions } from '@/lib/cors'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    const body = await request.json()
    const { purpose, amount, network, metadata } = body

    // Validate input
    if (!purpose || !amount || !network) {
      return NextResponse.json(
        { error: 'Missing required fields: purpose, amount, network' },
        { status: 400 }
      )
    }

    if (!['PACKAGE_PURCHASE', 'BOT_ACTIVATION', 'MANUAL_DEPOSIT'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid payment purpose' }, { status: 400 })
    }

    if (!['BEP20', 'TRC20'].includes(network)) {
      return NextResponse.json({ error: 'Invalid network. Must be BEP20 or TRC20' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Create payment request
    const paymentRequest = await createPaymentRequest({
      userId: user.userId,
      purpose,
      amount: Number(amount),
      network,
      metadata: metadata || {},
    })

    return NextResponse.json({
      success: true,
      message: 'Payment request created successfully',
      data: paymentRequest,
    })
  } catch (error) {
    console.error('Error creating payment request:', error)
    return NextResponse.json(
      {
        error: 'Failed to create payment request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
