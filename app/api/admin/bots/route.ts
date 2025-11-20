import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken, requireAdmin } from '@/middleware/auth'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    // Get all bot activations with user details
    const bots = await query<{
      id: string
      userId: string
      botType: string
      activationFee: string
      status: string
      activationDate: Date | null
      expiryDate: Date | null
      paymentTxHash: string | null
      network: string | null
      createdAt: Date
      userEmail: string
      userFullName: string
    }>(`
      SELECT
        b.id,
        b."userId",
        b."botType",
        b."activationFee",
        b.status,
        b."activationDate",
        b."expiryDate",
        b."paymentTxHash",
        b.network,
        b."createdAt",
        u.email as "userEmail",
        u."fullName" as "userFullName"
      FROM "BotActivation" b
      LEFT JOIN "User" u ON b."userId" = u.id
      ORDER BY b."createdAt" DESC
    `)

    // Transform to expected format
    const transformedBots = bots.map(bot => {
      // Helper to ensure ISO string
      const toISOString = (value: any) => {
        if (!value) return new Date().toISOString();
        if (typeof value === 'string') return value;
        if (value instanceof Date) return value.toISOString();
        return new Date().toISOString();
      };

      return {
        id: bot.id,
        userId: bot.userId,
        userEmail: bot.userEmail || 'N/A',
        botType: bot.botType || 'NEO',
        activationFee: Number(bot.activationFee),
        status: bot.status || 'PENDING',
        activationDate: toISOString(bot.activationDate || bot.createdAt),
        expiryDate: toISOString(bot.expiryDate || bot.createdAt),
        paymentTxHash: bot.paymentTxHash,
        network: bot.network,
        createdAt: toISOString(bot.createdAt)
      };
    });

    return NextResponse.json({
      success: true,
      bots: transformedBots
    })

  } catch (error) {
    console.error('Get admin bots error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bots' },
      { status: 500 }
    )
  }
}

