import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'


export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build WHERE conditions
    const conditions: string[] = [`"userId" = $1`]
    const params: any[] = [user.userId]

    if (type && type !== 'ALL') {
      conditions.push(`type = $2`)
      params.push(type)
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`

    // Get transactions with pagination
    const transactionsQuery = `
      SELECT *
      FROM "Transaction"
      ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "Transaction"
      ${whereClause}
    `

    const [transactions, totalResult] = await Promise.all([
      query(transactionsQuery, [...params, limit, skip]),
      queryScalar(countQuery, params)
    ])

    const total = Number(totalResult) || 0

    return NextResponse.json({
      success: true,
      transactions: transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        status: tx.status,
        description: tx.description,
        txHash: tx.txHash,
        network: tx.network,
        createdAt: tx.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get transaction history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    )
  }
}

