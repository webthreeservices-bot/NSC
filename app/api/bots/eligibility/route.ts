import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import pool from '@/lib/db-connection'

/**
 * GET /api/bots/eligibility
 * Get user's bot activation eligibility for all bot types
 */
export async function GET(request: NextRequest) {
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult
  const client = await pool.connect()

  try {
    // Get all active packages for the user
    const packagesResult = await client.query(
      `SELECT id, "packageType", amount, status, "expiryDate"
       FROM "Package"
       WHERE "userId" = $1 AND status = 'ACTIVE'
       ORDER BY amount DESC`,
      [user.userId]
    )

    const packages = packagesResult.rows

    // Get all active bot activations
    const botsResult = await client.query(
      `SELECT "botType", status, "expiryDate"
       FROM "BotActivation"
       WHERE "userId" = $1 AND status = 'ACTIVE'`,
      [user.userId]
    )

    const activeBots = botsResult.rows

    // Determine eligibility for each bot type
    const neoPackages = packages.filter(p => p.packageType === 'NEO')
    const neuralPackages = packages.filter(p => p.packageType === 'NEURAL')
    const oraclePackages = packages.filter(p => p.packageType === 'ORACLE')

    const hasNeoBot = activeBots.some(b => b.botType === 'NEO')
    const hasNeuralBot = activeBots.some(b => b.botType === 'NEURAL')
    const hasOracleBot = activeBots.some(b => b.botType === 'ORACLE')

    return NextResponse.json({
      success: true,
      eligibility: {
        NEO: {
          eligible: neoPackages.length > 0,
          isActive: hasNeoBot,
          packages: neoPackages,
          activationFee: 50,
          requiredPackageRange: '$500-$3,000'
        },
        NEURAL: {
          eligible: neuralPackages.length > 0,
          isActive: hasNeuralBot,
          packages: neuralPackages,
          activationFee: 100,
          requiredPackageRange: '$5,000-$10,000'
        },
        ORACLE: {
          eligible: oraclePackages.length > 0,
          isActive: hasOracleBot,
          packages: oraclePackages,
          activationFee: 150,
          requiredPackageRange: '$25,000-$50,000'
        }
      },
      totalPackages: packages.length,
      activeBots: activeBots.length
    })

  } catch (error: any) {
    console.error('Bot eligibility check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check bot eligibility' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
