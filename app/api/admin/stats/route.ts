import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from "@/lib/db"
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { adminLimiter, createRateLimitResponse } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 0

let cachedStats: any = null
let lastFetch = 0
const CACHE_TTL = 10000

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = adminLimiter.check(request)
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime)
  }

  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const now = Date.now()
    if (cachedStats && (now - lastFetch) < CACHE_TTL) {
      return NextResponse.json({ success: true, cached: true, statistics: cachedStats })
    }

    const platformStats = await queryOne('SELECT * FROM get_platform_statistics()')
    if (!platformStats) {
      return NextResponse.json({ success: false, error: 'Failed to fetch statistics' }, { status: 500 })
    }

    const [recentUsers, recentPackages, recentWithdrawals] = await Promise.all([
      query("SELECT COUNT(*) as count FROM \"User\" WHERE \"createdAt\" >= NOW() - INTERVAL '30 days'"),
      query("SELECT COUNT(*) as count FROM \"Package\" WHERE \"createdAt\" >= NOW() - INTERVAL '30 days'"),
      query("SELECT COUNT(*) as count FROM \"Withdrawal\" WHERE \"createdAt\" >= NOW() - INTERVAL '30 days'")
    ])

    const statistics = {
      totalUsers: Number(platformStats.totalUsers) || 0,
      activeUsers: Number(platformStats.activeUsers) || 0,
      totalPackages: Number(platformStats.totalPackages) || 0,
      activePackages: Number(platformStats.activePackages) || 0,
      totalRevenue: Number(platformStats.totalInvested) || 0,
      totalInvested: Number(platformStats.totalInvested) || 0,
      totalROIPaid: Number(platformStats.totalRoiPaid) || 0,
      totalWithdrawals: Number(platformStats.totalWithdrawals) || 0,
      pendingWithdrawals: Number(platformStats.pendingWithdrawals) || 0,
      recentUsers: Number(recentUsers[0]?.count) || 0,
      recentPackages: Number(recentPackages[0]?.count) || 0,
      recentWithdrawals: Number(recentWithdrawals[0]?.count) || 0,
      monthlyGrowth: { users: 0, revenue: 0, packages: 0 },
      topPackageTypes: []
    }

    cachedStats = statistics
    lastFetch = now
    return NextResponse.json({ success: true, cached: false, statistics })
  } catch (error: any) {
    console.error('Get admin stats error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch admin statistics', details: error.message }, { status: 500 })
  }
}
