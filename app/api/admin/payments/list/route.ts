/**
 * API Route: Admin - List All Payment Requests
 * GET /api/admin/payments/list
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    // Check admin
    const adminCheck = requireAdmin(user)
    if (adminCheck instanceof NextResponse) return adminCheck

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const network = searchParams.get('network')
    const purpose = searchParams.get('purpose')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      whereClause += ` AND pr.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    if (network) {
      whereClause += ` AND pr.network = $${paramIndex}`
      params.push(network)
      paramIndex++
    }
    if (purpose) {
      whereClause += ` AND pr.purpose = $${paramIndex}`
      params.push(purpose)
      paramIndex++
    }

    // Get total count
    const totalResult = await query<{ count: number }>(`
      SELECT COUNT(*)::int as count
      FROM "PaymentRequest" pr
      ${whereClause}
    `, params)
    const total = totalResult[0]?.count || 0

    // Get payments with user info
    const paymentsWithUsers = await query<{
      id: string
      userId: string
      purpose: string
      amount: string
      amountReceived: string | null
      network: string
      status: string
      txHash: string | null
      address: string
      confirmations: number
      createdAt: Date
      expiresAt: Date
      completedAt: Date | null
      userEmail: string
      username: string
    }>(`
      SELECT
        pr.*,
        u.email as "userEmail",
        u.username
      FROM "PaymentRequest" pr
      LEFT JOIN "User" u ON pr."userId" = u.id
      ${whereClause}
      ORDER BY pr."createdAt" DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `, [...params, limit, (page - 1) * limit])

    // Transform the results
    const paymentsTransformed = paymentsWithUsers.map(payment => ({
      ...payment,
      amount: Number(payment.amount),
      amountReceived: payment.amountReceived ? Number(payment.amountReceived) : null,
      user: {
        id: payment.userId,
        email: payment.userEmail,
        username: payment.username
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        payments: paymentsTransformed,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching payment requests:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch payment requests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

