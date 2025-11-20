import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { getPaginationParams, createPaginatedResponse } from '@/lib/pagination'

/**
 * Admin endpoint to list all packages pending approval
 * GET /api/admin/packages?status=PENDING
 */
export async function GET(request: NextRequest) {
  // Authenticate and check admin
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const paginationParams = getPaginationParams(request)

    // Build WHERE conditions
    const conditions: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (status === 'PENDING_VERIFICATION') {
      // Packages with txHash submitted, waiting for admin approval
      conditions.push(`p.status = $${paramCount}`)
      params.push('PENDING')
      paramCount++
      conditions.push(`p."depositTxHash" IS NOT NULL`)
    } else if (status === 'PENDING_PAYMENT') {
      // Packages created but user hasn't submitted txHash yet
      conditions.push(`p.status = $${paramCount}`)
      params.push('PENDING')
      paramCount++
      conditions.push(`p."depositTxHash" IS NULL`)
    } else if (status) {
      conditions.push(`p.status = $${paramCount}`)
      params.push(status)
      paramCount++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get packages with user details
    const packagesQuery = `
      SELECT
        p.*,
        u.id as "user_id",
        u.email as "user_email",
        u."fullName" as "user_fullName"
      FROM "Package" p
      LEFT JOIN "User" u ON p."userId" = u.id
      ${whereClause}
      ORDER BY p."createdAt" DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "Package" p
      ${whereClause}
    `

    const [packages, totalResult] = await Promise.all([
      query(packagesQuery, [...params, paginationParams.take, paginationParams.skip]),
      queryScalar(countQuery, params)
    ])

    const total = Number(totalResult) || 0

    const packagesData = packages.map((pkg: any) => ({
      id: pkg.id,
      userId: pkg.userId,
      userName: pkg.user_fullName || 'N/A',
      userEmail: pkg.user_email || 'N/A',
      amount: Number(pkg.amount),
      packageType: pkg.packageType,
      status: pkg.status,
      depositTxHash: pkg.depositTxHash,
      network: pkg.network,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
      hasTxHash: !!pkg.depositTxHash,
      requiresApproval: pkg.status === 'PENDING' && !!pkg.depositTxHash
    }))

    return NextResponse.json(
      createPaginatedResponse(packagesData, total, paginationParams)
    )

  } catch (error) {
    console.error('Get admin packages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}
