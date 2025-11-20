import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { getPaginationParams, createPaginatedResponse, getSortParams } from '@/lib/pagination'
import { logAdminAction } from '@/lib/audit-logger'
import { adminLimiter } from '@/middleware/rateLimiter'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ALLOWED_SORT_FIELDS = ['email', 'username', 'createdAt', 'lastLogin', 'kycStatus']

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    // Check admin
    const adminCheck = requireAdmin(user)
    if (adminCheck instanceof NextResponse) return adminCheck

    // Get all users with basic info using raw SQL
    const users = await query(`
      SELECT
        u.id,
        u.email,
        u."fullName",
        u."referralCode",
        u."isEmailVerified",
        u."isAdmin",
        u."createdAt",
        u."kycStatus",
        u."isActive",
        u."isBlocked",
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'ACTIVE') as "activePackages",
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'ACTIVE'), 0) as "totalInvested"
      FROM "User" u
      LEFT JOIN "Package" p ON p."userId" = u.id
      GROUP BY u.id, u.email, u."fullName", u."referralCode", u."isEmailVerified",
               u."isAdmin", u."createdAt", u."kycStatus", u."isActive", u."isBlocked"
      ORDER BY u."createdAt" DESC
    `)

    // Format response with calculated stats
    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      referralCode: user.referralCode,
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.isAdmin,
      kycStatus: user.kycStatus,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      activePackages: parseInt(user.activePackages) || 0,
      totalInvested: parseFloat(user.totalInvested) || 0
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}



