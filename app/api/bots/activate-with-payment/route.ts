/**
 * API Route: Activate Bot with Integrated Payment
 * POST /api/bots/activate-with-payment
 *
 * This is the enhanced version that uses the new payment gateway system
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { activateBotWithPayment, checkBotActivationEligibility } from '@/services/enhancedBotService'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    const body = await request.json()
    const { botType, network } = body

    // Validate input
    if (!botType || !network) {
      return NextResponse.json(
        { error: 'Missing required fields: botType, network' },
        { status: 400 }
      )
    }

    if (!['NEO', 'NEURAL', 'ORACLE'].includes(botType)) {
      return NextResponse.json(
        { error: 'Invalid bot type. Must be NEO, NEURAL, or ORACLE' },
        { status: 400 }
      )
    }

    if (!['BEP20', 'TRC20'].includes(network)) {
      return NextResponse.json(
        { error: 'Invalid network. Must be BEP20 or TRC20' },
        { status: 400 }
      )
    }

    // Check eligibility
    const eligibility = await checkBotActivationEligibility(user.userId, botType)

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: 'Not eligible for bot activation',
          reason: eligibility.reason,
          requiredPackageType: eligibility.requiredPackageType,
        },
        { status: 400 }
      )
    }

    // Create bot activation with payment request
    const result = await activateBotWithPayment({
      userId: user.userId,
      botType,
      network,
    })

    return NextResponse.json({
      success: true,
      message: 'Bot activation created successfully. Please complete the payment to activate.',
      data: result,
    })
  } catch (error) {
    console.error('Error activating bot with payment:', error)
    return NextResponse.json(
      {
        error: 'Failed to activate bot',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
