import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { z } from 'zod'

const verifyPaymentSchema = z.object({
  txHash: z.string().min(1, 'Transaction hash is required'),
  network: z.enum(['BEP20', 'TRC20'])
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  try {
    const body = await request.json()
    const { id: botId } = await params
    
    const validation = verifyPaymentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { txHash, network } = validation.data

    // Verify bot ownership - CRITICAL security check
    const botData = await queryOne(
      `SELECT "userId", status, "activationFee" FROM "BotActivation" WHERE id = $1`,
      [botId]
    )

    if (!botData) {
      return NextResponse.json(
        { error: 'Bot activation not found' },
        { status: 404 }
      )
    }

    // Only the bot owner can submit txHash
    if (botData.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only submit transaction hash for your own bots' },
        { status: 403 }
      )
    }

    // Check if bot is still pending
    if (botData.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This bot activation has already been processed' },
        { status: 400 }
      )
    }

    // CRITICAL: Check if this transaction hash has been used before
    const existingTx = await queryOne(
      `SELECT id, "userId" FROM "Package" WHERE "depositTxHash" = $1 AND id != $2`,
      [txHash, botId]
    )

    if (existingTx) {
      return NextResponse.json(
        { error: 'This transaction hash has already been used for another package' },
        { status: 400 }
      )
    }

    // Check for duplicate in bot activations as well
    const existingBotTx = await queryOne(
      `SELECT id, "userId" FROM "BotActivation" WHERE "paymentTxHash" = $1 AND id != $2`,
      [txHash, botId]
    )

    if (existingBotTx) {
      return NextResponse.json(
        { error: 'This transaction hash has already been used for another bot activation' },
        { status: 400 }
      )
    }

    // Update bot with txHash - Status remains PENDING until admin approves
    await execute(
      `UPDATE "BotActivation" SET "paymentTxHash" = $1, network = $2, "updatedAt" = $3 WHERE id = $4`,
      [txHash, network, new Date(), botId]
    )

    return NextResponse.json({
      success: true,
      message: 'Transaction hash submitted successfully. Your bot will be activated once admin verifies your payment.',
      data: {
        botId,
        txHash,
        status: 'PENDING_VERIFICATION'
      }
    })

  } catch (error: any) {
    console.error('Submit bot transaction hash error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit transaction hash' },
      { status: 500 }
    )
  }
}

