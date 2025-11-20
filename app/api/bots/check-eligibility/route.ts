import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'
import { getBotFee } from '@/utils/calculations'
import { z } from 'zod'


const checkSchema = z.object({
  botType: z.enum(['NEO', 'NEURAL', 'ORACLE'])
})

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    const { searchParams } = new URL(request.url)
    const botType = searchParams.get('botType')
    
    if (!botType) {
      return NextResponse.json(
        { error: 'Bot type is required' },
        { status: 400 }
      )
    }

    const validation = checkSchema.safeParse({ botType })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid bot type' },
        { status: 400 }
      )
    }

    // Check if user has eligible packages for this bot type
    const eligiblePackages = await query(
      `SELECT * FROM "Package"
       WHERE "userId" = $1 AND "packageType" = $2 AND status = $3`,
      [user.userId, botType, 'ACTIVE']
    )

    if (eligiblePackages.length === 0) {
      return NextResponse.json({
        success: true,
        eligible: false,
        reason: `You need an active ${botType} package to activate this bot`,
        requiredAmount: botType === 'NEO' ? 500 : botType === 'NEURAL' ? 5000 : 25000
      })
    }

    // Check if bot is already activated
    const existingBot = await queryOne(
      `SELECT * FROM "Bot"
       WHERE "userId" = $1 AND "botType" = $2`,
      [user.userId, botType]
    )

    if (existingBot && existingBot.status === 'ACTIVE' && !existingBot.isExpired) {
      return NextResponse.json({
        success: true,
        eligible: false,
        reason: 'Bot already activated',
        expiryDate: existingBot.expiryDate
      })
    }

    const activationFee = getBotFee(botType as any)

    return NextResponse.json({
      success: true,
      eligible: true,
      activationFee,
      eligiblePackages: eligiblePackages.length
    })

  } catch (error) {
    console.error('Check bot eligibility error:', error)
    return NextResponse.json(
      { error: 'Failed to check bot eligibility' },
      { status: 500 }
    )
  }
}

