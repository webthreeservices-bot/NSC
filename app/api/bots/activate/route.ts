import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { validateRequest, botActivationSchema } from '@/middleware/validation'
import { activateBot } from '@/services/botService'
import { z } from 'zod'

const activateBotSchema = z.object({
  botType: z.enum(['NEO', 'NEURAL', 'ORACLE', 'TEST_1', 'TEST_2', 'TEST_3']),
  network: z.enum(['BEP20', 'TRC20']),
  txHash: z.string().min(1, 'Transaction hash is required')
})

export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    const body = await request.json()
    
    const validation = activateBotSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { botType, network, txHash } = validation.data

    // Activate bot
    const botActivation = await activateBot(
      user.id,
      botType as any,
      network as any,
      txHash
    )

    return NextResponse.json({
      success: true,
      message: `${botType} bot activated successfully! You can now earn referral commissions.`,
      botActivation: {
        id: botActivation.id,
        botType: botActivation.botType,
        activationFee: Number(botActivation.activationFee),
        activationDate: botActivation.activationDate,
        expiryDate: botActivation.expiryDate,
        status: botActivation.status
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Bot activation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to activate bot' },
      { status: 500 }
    )
  }
}
