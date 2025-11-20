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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const network = searchParams.get('network')
    const skip = (page - 1) * limit

    // Build WHERE conditions
    const conditions: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (status) {
      conditions.push(`w.status = $${paramCount}`)
      params.push(status.toUpperCase())
      paramCount++
    }

    if (network) {
      conditions.push(`w.network = $${paramCount}`)
      params.push(network.toUpperCase())
      paramCount++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get withdrawals with pagination
    const withdrawalsQuery = `
      SELECT
        w.*,
        u.email as "userEmail",
        u."fullName" as "userFullName"
      FROM "Withdrawal" w
      LEFT JOIN "User" u ON w."userId" = u.id
      ${whereClause}
      ORDER BY w."createdAt" DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `
    params.push(limit, skip)

    const totalQuery = `
      SELECT COUNT(*) as count
      FROM "Withdrawal" w
      ${whereClause}
    `

    const [withdrawals, totalResult] = await Promise.all([
      query(withdrawalsQuery, params),
      queryScalar(totalQuery, conditions.length > 0 ? params.slice(0, -2) : [])
    ])

    const total = Number(totalResult) || 0

    // Helper to convert dates safely
    const toSafeDate = (date: any) => {
      if (!date) return null;
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return date;
    };

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map((w: any) => ({
        id: w.id,
        userId: w.userId,
        userEmail: w.userEmail || 'N/A',
        userFullName: w.userFullName || 'N/A',
        amount: Number(w.amount),
        netAmount: Number(w.netAmount || w.amount),
        fee: Number(w.fee || 0),
        status: w.status,
        walletAddress: w.walletAddress,
        network: w.network,
        txHash: w.txHash,
        rejectionReason: w.rejectionReason,
        requestedAt: toSafeDate(w.requestDate || w.createdAt),
        processedAt: toSafeDate(w.processedDate),
        processedBy: w.processedBy || w.approvedBy,
        createdAt: toSafeDate(w.createdAt),
        updatedAt: toSafeDate(w.updatedAt)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get withdrawals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    )
  }
}

