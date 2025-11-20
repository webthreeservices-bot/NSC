import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import pool from '@/lib/db-connection'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const activateSchema = z.object({
  botType: z.enum(['NEO', 'NEURAL', 'ORACLE']),
  packageId: z.string().uuid(),
  txHash: z.string().optional(),
  network: z.enum(['BEP20', 'TRC20']).optional()
})

/**
 * POST /api/bots/activate-selected
 * Activate a bot for a user based on their selected package
 */
export async function POST(request: NextRequest) {
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult
  const client = await pool.connect()

  try {
    const body = await request.json()
    
    const validation = activateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { botType, packageId, txHash, network } = validation.data

    // Verify the package belongs to the user and is active
    const pkgResult = await client.query(
      `SELECT * FROM "Package" 
       WHERE id = $1 AND "userId" = $2 AND status = 'ACTIVE' AND "isExpired" = false`,
      [packageId, user.userId]
    )

    if (pkgResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Package not found or not active' },
        { status: 404 }
      )
    }

    const pkg = pkgResult.rows[0]

    // Verify package type matches bot type
    if (pkg.packageType !== botType) {
      return NextResponse.json(
        { 
          error: `This package is for ${pkg.packageType} bot, not ${botType} bot`,
          packageType: pkg.packageType 
        },
        { status: 400 }
      )
    }

    // Check if bot is already active for this user
    const existingBotResult = await client.query(
      `SELECT * FROM "BotActivation" 
       WHERE "userId" = $1 AND "botType" = $2 AND status = 'ACTIVE' AND "isExpired" = false`,
      [user.userId, botType]
    )

    if (existingBotResult.rows.length > 0) {
      return NextResponse.json(
        { error: `You already have an active ${botType} bot`, botActivation: existingBotResult.rows[0] },
        { status: 400 }
      )
    }

    // Determine activation fee
    const activationFees = {
      NEO: 50,
      NEURAL: 100,
      ORACLE: 150
    }
    const activationFee = activationFees[botType]

    // Calculate expiry date (12 months from now)
    const now = new Date()
    const activationDate = new Date(now)
    const expiryDate = new Date(now)
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)

    await client.query('BEGIN')

    // Create bot activation
    const botId = uuidv4()
    const botResult = await client.query(
      `INSERT INTO "BotActivation" (
        id, "userId", "botType", "activationFee", "activationDate",
        "expiryDate", status, "isExpired", network, "paymentTxHash", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5::timestamp, $6::timestamp, $7, $8, $9, $10, $11::timestamp, $12::timestamp)
      RETURNING *`,
      [
        botId,
        user.userId,
        botType,
        activationFee,
        now.toISOString(),
        expiryDate.toISOString(),
        'ACTIVE',
        false,
        network || pkg.network,
        txHash || `BOT-${Date.now()}`,
        now.toISOString(),
        now.toISOString()
      ]
    )

    const botActivation = botResult.rows[0]

    // Create transaction record
    await client.query(
      `INSERT INTO "Transaction" (
        id, "userId", type, amount, status, description, "txHash", network, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamp, $10::timestamp)`,
      [
        uuidv4(),
        user.userId,
        'BOT_ACTIVATION',
        activationFee,
        'COMPLETED',
        `${botType} bot activation - Fee: $${activationFee}`,
        txHash || null,
        network || pkg.network,
        now.toISOString(),
        now.toISOString()
      ]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      message: `${botType} bot activated successfully!`,
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
    await client.query('ROLLBACK')
    console.error('Bot activation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to activate bot' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
