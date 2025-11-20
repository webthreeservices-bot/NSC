import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'


export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    // Get package statistics
    const [totalInvested, activePackages, expiredPackages, totalRoiEarned] = await Promise.all([
      // Total invested
      queryOne({
        where: { userId: user.userId },
        _sum: { amount: true }
      }),
      // Active packages count
      queryScalar({
        where: { userId: user.userId, status: 'ACTIVE' }
      }),
      // Expired packages count
      queryScalar({
        where: { userId: user.userId, status: 'EXPIRED' }
      }),
      // Total ROI earned
      queryOne({
        where: { userId: user.userId },
        _sum: { totalRoiPaid: true }
      })
    ])

    // Get packages by type using raw SQL query
    const packagesByTypeResult = await query(
      `SELECT "packageType", COUNT(*) as count, SUM("amount") as "totalAmount" 
       FROM "Package" 
       WHERE "userId" = $1 
       GROUP BY "packageType"`,
      user.userId
    )

    return NextResponse.json({
      success: true,
      stats: {
        totalInvested: Number(totalInvested._sum.amount || 0),
        activePackages,
        expiredPackages,
        totalRoiEarned: Number(totalRoiEarned._sum.totalRoiPaid || 0),
        packagesByType: packagesByTypeResult.map((p: any) => ({
          type: p.packageType,
          count: Number(p.count),
          totalAmount: Number(p.totalAmount || 0)
        }))
      }
    })

  } catch (error) {
    console.error('Get package stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package statistics' },
      { status: 500 }
    )
  }
}

