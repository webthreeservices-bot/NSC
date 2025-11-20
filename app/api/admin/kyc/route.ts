import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken, requireAdmin } from '@/middleware/auth'

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
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build WHERE conditions
    const conditions: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (status) {
      conditions.push(`u."kycStatus" = $${paramCount}`)
      params.push(status.toUpperCase())
      paramCount++
    }

    if (search) {
      conditions.push(`(
        u.email ILIKE $${paramCount} OR
        u.username ILIKE $${paramCount} OR
        u."fullName" ILIKE $${paramCount}
      )`)
      params.push(`%${search}%`)
      paramCount++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get users with their KYC status
    const usersQuery = `
      SELECT
        u.id,
        u.email,
        u.username,
        u."fullName",
        u."kycStatus",
        u."createdAt",
        u."updatedAt"
      FROM "User" u
      ${whereClause}
      ORDER BY u."createdAt" DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "User" u
      ${whereClause}
    `

    const [users, totalResult] = await Promise.all([
      query(usersQuery, [...params, limit, skip]),
      queryScalar(countQuery, params)
    ])

    const total = Number(totalResult) || 0

    // Map to KYC submission format
    const filteredSubmissions = users.map((user: any) => ({
      id: user.id,
      userId: user.id,
      status: user.kycStatus,
      documentType: 'NATIONAL_ID',
      documentNumber: '',
      documentFrontUrl: '',
      documentBackUrl: '',
      selfieUrl: '',
      rejectionReason: null,
      verifiedBy: null,
      verifiedAt: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      user: {
        id: user.id,
        email: user.email,
        username: user.username || 'N/A',
        fullName: user.fullName || 'N/A'
      }
    }))

    return NextResponse.json({
      success: true,
      submissions: filteredSubmissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get KYC submissions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KYC submissions' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = await request.json()
    const { userId, status, rejectionReason } = body

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      )
    }

    // Update user KYC status
    await execute(`
      UPDATE "User"
      SET "kycStatus" = $1, "updatedAt" = $2
      WHERE id = $3
    `, [status, new Date(), userId])

    return NextResponse.json({
      success: true,
      message: 'KYC status updated successfully'
    })

  } catch (error) {
    console.error('Update KYC status error:', error)
    return NextResponse.json(
      { error: 'Failed to update KYC status' },
      { status: 500 }
    )
  }
}
