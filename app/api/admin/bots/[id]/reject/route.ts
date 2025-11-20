import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { queryOne } from "@/lib/db"
import { v4 as uuidv4 } from 'uuid'
import pool from '@/lib/db-connection'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate and check admin
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const { id: botId } = await params

    // Get bot activation details
    const bot = await queryOne(
      `SELECT 
        b.*,
        u.email as "userEmail",
        u."fullName" as "userFullName"
      FROM "BotActivation" b
      LEFT JOIN "User" u ON b."userId" = u.id
      WHERE b.id = $1`,
      [botId]
    )

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot activation not found' },
        { status: 404 }
      )
    }

    if (bot.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot reject an active bot' },
        { status: 400 }
      )
    }

    if (bot.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Bot is already rejected' },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Update bot status to REJECTED with proper enum cast
      const updateBotQuery = `
        UPDATE "BotActivation"
        SET
          status = 'REJECTED'::\"BotStatus\",
          "rejectedBy" = $1,
          "rejectedAt" = $2,
          "updatedAt" = $3
        WHERE id = $4
      `

      await client.query(updateBotQuery, [
        user.userId,
        new Date(),
        new Date(),
        botId
      ])

      // Create transaction record for rejection
      const transactionId = uuidv4()
      const now = new Date()

      const createTransactionQuery = `
        INSERT INTO "Transaction" (
          id, "userId", type, amount, "txHash", network,
          status, description, "referenceId", "referenceType", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3::\"TransactionType\", $4, $5, $6::\"Network\", $7::\"TransactionStatus\", $8, $9, $10, $11, $12)
      `

      await client.query(createTransactionQuery, [
        transactionId,
        bot.userId,
        'BOT_ACTIVATION',
        bot.activationFee,
        bot.paymentTxHash || 'ADMIN_REJECTED',
        bot.network || 'MANUAL',
        'FAILED',
        'Bot activation rejected by admin',
        botId,
        'BOT_ACTIVATION',
        now,
        now
      ])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Bot activation rejected successfully',
        bot: {
          id: botId,
          status: 'REJECTED'
        }
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Reject bot error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject bot activation' },
      { status: 500 }
    )
  }
}
