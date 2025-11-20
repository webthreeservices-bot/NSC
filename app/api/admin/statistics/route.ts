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
    // Get platform statistics
    const [
      totalUsersResult,
      activeUsersResult,
      totalPackagesResult,
      activePackagesResult,
      totalInvestedResult,
      totalWithdrawalsResult,
      pendingWithdrawalsResult,
      totalEarningsResult,
      activeBotsResult
    ] = await Promise.all([
      // Total users
      query<{ count: number }>(`SELECT COUNT(*)::int as count FROM "User"`),
      // Active users (logged in last 30 days)
      query<{ count: number }>(`
        SELECT COUNT(*)::int as count
        FROM "User"
        WHERE "lastLogin" >= $1
      `, [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]),
      // Total packages
      query<{ count: number }>(`SELECT COUNT(*)::int as count FROM "UserPackage"`),
      // Active packages
      query<{ count: number }>(`
        SELECT COUNT(*)::int as count
        FROM "UserPackage"
        WHERE status = 'ACTIVE'
      `),
      // Total invested (only confirmed packages)
      query<{ total: string }>(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM "UserPackage"
        WHERE status = 'ACTIVE'
      `),
      // Total withdrawals
      query<{ total: string }>(`
        SELECT COALESCE(SUM("netAmount"), 0) as total
        FROM "Withdrawal"
        WHERE status = 'COMPLETED'
      `),
      // Pending withdrawals
      query<{ count: number }>(`
        SELECT COUNT(*)::int as count
        FROM "Withdrawal"
        WHERE status = 'PENDING'
      `),
      // Total earnings paid
      query<{ total: string }>(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM "ROIPayment"
      `),
      // Active bots
      query<{ count: number }>(`
        SELECT COUNT(*)::int as count
        FROM "UserPackage"
        WHERE status = 'ACTIVE' AND "isExpired" = false
      `)
    ])

    const totalUsers = totalUsersResult[0]?.count || 0
    const activeUsers = activeUsersResult[0]?.count || 0
    const totalPackages = totalPackagesResult[0]?.count || 0
    const activePackages = activePackagesResult[0]?.count || 0
    const totalInvested = { _sum: { amount: totalInvestedResult[0]?.total || '0' } }
    const totalWithdrawals = { _sum: { netAmount: totalWithdrawalsResult[0]?.total || '0' } }
    const pendingWithdrawals = pendingWithdrawalsResult[0]?.count || 0
    const totalEarnings = { _sum: { amount: totalEarningsResult[0]?.total || '0' } }
    const activeBots = activeBotsResult[0]?.count || 0

    // Get recent activity
    const recentUsers = await query<{
      id: string
      email: string
      username: string
      createdAt: Date
    }>(`
      SELECT id, email, username, "createdAt"
      FROM "User"
      ORDER BY "createdAt" DESC
      LIMIT 5
    `)

    const recentPackagesRaw = await query<{
      id: string
      amount: string
      packageType: string
      status: string
      createdAt: Date
      userId: string
      userEmail: string
      username: string
    }>(`
      SELECT
        up.id,
        up.amount,
        up."packageType",
        up.status,
        up."createdAt",
        up."userId",
        u.email as "userEmail",
        u.username
      FROM "UserPackage" up
      LEFT JOIN "User" u ON up."userId" = u.id
      ORDER BY up."createdAt" DESC
      LIMIT 5
    `)

    const recentPackages = recentPackagesRaw.map(pkg => ({
      id: pkg.id,
      amount: pkg.amount,
      packageType: pkg.packageType,
      status: pkg.status,
      createdAt: pkg.createdAt,
      user: {
        email: pkg.userEmail,
        username: pkg.username
      }
    }))

    // Get packages by type
    const packagesByType = await query<{
      packageType: string
      count: number
      totalAmount: string
    }>(`
      SELECT
        "packageType",
        COUNT(*)::int as count,
        COALESCE(SUM(amount), 0) as "totalAmount"
      FROM "UserPackage"
      GROUP BY "packageType"
    `)

    return NextResponse.json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        packages: {
          total: totalPackages,
          active: activePackages,
          expired: totalPackages - activePackages
        },
        financial: {
          totalInvested: Number(totalInvested._sum.amount || 0),
          totalWithdrawals: Number(totalWithdrawals._sum.netAmount || 0),
          totalEarnings: Number(totalEarnings._sum.amount || 0),
          pendingWithdrawals
        },
        bots: {
          active: activeBots
        },
        packagesByType: packagesByType.map(p => ({
          type: p.packageType,
          count: p.count,
          totalAmount: Number(p.totalAmount || 0)
        }))
      },
      recentActivity: {
        users: recentUsers,
        packages: recentPackages
      }
    })

  } catch (error) {
    console.error('Get statistics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

