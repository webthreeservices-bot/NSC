import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { queryWithTimeout } from '@/lib/db-connection'
import { authenticateToken } from '@/middleware/auth'


export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    // Use direct SQL query with timeout protection for better performance
    const botsQuery = `
      SELECT id, "userId", "packageId", "botType", status, "activationFee",
             "paymentTxHash", "activationDate", "expiryDate", network,
             "isExpired", "totalEarnings", "createdAt", "updatedAt"
      FROM "BotActivation"
      WHERE "userId" = $1
      ORDER BY "activationDate" DESC
    `;

    const botsResult = await queryWithTimeout(botsQuery, [user.userId], 20000); // Increased to 20 seconds for cloud database
    const bots = botsResult.rows;

    console.log(`📊 Found ${bots.length} bots for user ${user.userId}:`, bots.map(b => ({ type: b.botType, status: b.status, isExpired: b.isExpired })))

    // Get eligible packages for each bot type using direct queries
    const [neoResult, neuralResult, oracleResult, test1Result, test2Result, test3Result] = await Promise.all([
      queryWithTimeout(
        `SELECT COUNT(*) as count FROM "Package" WHERE "userId" = $1 AND "packageType" = 'NEO' AND status = 'ACTIVE'`,
        [user.userId],
        3000
      ),
      queryWithTimeout(
        `SELECT COUNT(*) as count FROM "Package" WHERE "userId" = $1 AND "packageType" = 'NEURAL' AND status = 'ACTIVE'`,
        [user.userId],
        3000
      ),
      queryWithTimeout(
        `SELECT COUNT(*) as count FROM "Package" WHERE "userId" = $1 AND "packageType" = 'ORACLE' AND status = 'ACTIVE'`,
        [user.userId],
        3000
      ),
      queryWithTimeout(
        `SELECT COUNT(*) as count FROM "Package" WHERE "userId" = $1 AND "packageType" = 'TEST_1' AND status = 'ACTIVE'`,
        [user.userId],
        3000
      ),
      queryWithTimeout(
        `SELECT COUNT(*) as count FROM "Package" WHERE "userId" = $1 AND "packageType" = 'TEST_2' AND status = 'ACTIVE'`,
        [user.userId],
        3000
      ),
      queryWithTimeout(
        `SELECT COUNT(*) as count FROM "Package" WHERE "userId" = $1 AND "packageType" = 'TEST_3' AND status = 'ACTIVE'`,
        [user.userId],
        3000
      )
    ]);

    const response = {
      success: true,
      bots: bots.map(bot => ({
        id: bot.id,
        botType: bot.botType,
        activationFee: Number(bot.activationFee),
        activationDate: bot.activationDate,
        expiryDate: bot.expiryDate,
        status: bot.status,
        isExpired: bot.isExpired || bot.status === 'EXPIRED',
        paymentTxHash: bot.paymentTxHash,
        network: bot.network,
        totalEarnings: Number(bot.totalEarnings || 0)
      })),
      eligibility: {
        NEO: parseInt(neoResult.rows[0].count) > 0,
        NEURAL: parseInt(neuralResult.rows[0].count) > 0,
        ORACLE: parseInt(oracleResult.rows[0].count) > 0,
        TEST_1: parseInt(test1Result.rows[0].count) > 0,
        TEST_2: parseInt(test2Result.rows[0].count) > 0,
        TEST_3: parseInt(test3Result.rows[0].count) > 0
      }
    }

    console.log(`✅ Returning ${response.bots.length} bots to frontend`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get my bots error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bots' },
      { status: 500 }
    )
  }
}

