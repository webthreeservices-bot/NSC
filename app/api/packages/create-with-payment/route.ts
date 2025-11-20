/**
 * API Route: Create Package with Integrated Payment
 * POST /api/packages/create-with-payment
 *
 * This is the enhanced version that uses the new payment gateway system
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { createPackageWithPayment } from '@/services/enhancedPackageService'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    const body = await request.json()
    const { amount, network } = body

    // Validate input
    if (!amount || !network) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, network' },
        { status: 400 }
      )
    }

    if (!['BEP20', 'TRC20'].includes(network)) {
      return NextResponse.json(
        { error: 'Invalid network. Must be BEP20 or TRC20' },
        { status: 400 }
      )
    }

    const validAmounts = [500, 1000, 3000, 5000, 10000, 25000, 50000]
    if (!validAmounts.includes(Number(amount))) {
      return NextResponse.json(
        {
          error: 'Invalid package amount',
          validAmounts,
          message: `Please select one of the valid package amounts: ${validAmounts.join(', ')} USDT`,
        },
        { status: 400 }
      )
    }

    // Create package with payment request
    const result = await createPackageWithPayment({
      userId: user.userId,
      amount: Number(amount),
      network,
    })

    return NextResponse.json({
      success: true,
      message: 'Package created successfully. Please complete the payment to activate.',
      data: result,
    })
  } catch (error) {
    console.error('Error creating package with payment:', error)
    return NextResponse.json(
      {
        error: 'Failed to create package',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
