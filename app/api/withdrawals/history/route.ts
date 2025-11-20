import { NextRequest, NextResponse } from 'next/server'
import { neonQuery } from '@/lib/neon-serverless'
import { authenticateToken } from '@/middleware/auth'


export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    let whereClause = `"userId" = $1`
    const params: any[] = [user.userId]
    
    if (status) {
      whereClause += ` AND status = $2`
      params.push(status)
    }

    // Get withdrawals with pagination
    const [withdrawals, totalResult] = await Promise.all([
      neonQuery(
        `SELECT * FROM "Withdrawal" 
         WHERE ${whereClause}
         ORDER BY "createdAt" DESC 
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, skip]
      ),
      neonQuery(
        `SELECT COUNT(*) as count FROM "Withdrawal" WHERE ${whereClause}`,
        params
      )
    ])

    const total = totalResult[0]?.count ? parseInt(totalResult[0].count) : 0

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        amount: Number(w.amount),
        fee: Number(w.fee),
        netAmount: Number(w.netAmount),
        withdrawalType: w.withdrawalType,
        walletAddress: w.walletAddress,
        network: w.network,
        status: w.status,
        txHash: w.txHash,
        rejectionReason: w.rejectionReason,
        requestDate: w.requestDate,
        processedDate: w.processedDate
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get withdrawal history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal history' },
      { status: 500 }
    )
  }
}
