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
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause - ONLY show ACTIVE packages to users
    // PENDING packages are hidden until admin approves after payment verification
    const where: any = { 
      userId: user.userId,
      status: 'ACTIVE' // Only show activated packages
    }
    
    // Optional: Allow filtering by expired status
    if (status === 'EXPIRED') {
      where.status = 'EXPIRED'
      where.isExpired = true
    }

    // Get packages with pagination
    const packagesQuery = `
      SELECT
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', rp.id,
              'packageId', rp."packageId",
              'userId', rp."userId",
              'amount', rp.amount,
              'monthNumber', rp."monthNumber",
              'paymentDate', rp."paymentDate",
              'status', rp.status,
              'createdAt', rp."createdAt",
              'paidAt', rp."paidAt",
              'scheduledDate', rp."scheduledDate"
            ) ORDER BY rp."monthNumber" ASC
          ) FILTER (WHERE rp.id IS NOT NULL),
          '[]'::json
        ) as "roiPayments"
      FROM "Package" p
      LEFT JOIN "RoiPayment" rp ON rp."packageId" = p.id
      WHERE p."userId" = $1 AND p.status = $2
      GROUP BY p.id
      ORDER BY p."createdAt" DESC
      LIMIT $3 OFFSET $4
    `

    const countQuery = `
      SELECT COUNT(*)::integer as count
      FROM "Package"
      WHERE "userId" = $1 AND status = $2
    `

    const [packagesResult, countResult] = await Promise.all([
      query(packagesQuery, [user.userId, where.status, limit, skip]),
      query(countQuery, [user.userId, where.status])
    ])

    const packages = packagesResult.map((pkg: any) => ({
      ...pkg,
      roiPayments: typeof pkg.roiPayments === 'string' ? JSON.parse(pkg.roiPayments) : pkg.roiPayments
    }))
    const total = countResult[0]?.count || 0

    // Safe date serialization helper
    const toISOString = (date: any) => {
      if (!date) return null
      if (date instanceof Date) {
        return isNaN(date.getTime()) ? null : date.toISOString()
      }
      if (typeof date === 'string') {
        const parsed = new Date(date)
        return isNaN(parsed.getTime()) ? null : parsed.toISOString()
      }
      return null
    }

    // Serialize dates and convert Decimal types to numbers
    const serializedPackages = packages.map((pkg: any) => ({
      ...pkg,
      amount: pkg.amount ? Number(pkg.amount) : 0,
      roiPercentage: pkg.roiPercentage ? Number(pkg.roiPercentage) : 0,
      totalRoiPaid: pkg.totalRoiPaid ? Number(pkg.totalRoiPaid) : 0,
      createdAt: toISOString(pkg.createdAt),
      updatedAt: toISOString(pkg.updatedAt),
      investmentDate: toISOString(pkg.investmentDate),
      expiryDate: toISOString(pkg.expiryDate),
      nextRoiDate: toISOString(pkg.nextRoiDate),
      roiPayments: pkg.roiPayments?.map((payment: any) => ({
        ...payment,
        amount: payment.amount ? Number(payment.amount) : 0,
        createdAt: toISOString(payment.createdAt),
        paidAt: toISOString(payment.paidAt),
        scheduledDate: toISOString(payment.scheduledDate)
      }))
    }))

    return NextResponse.json({
      success: true,
      packages: serializedPackages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get packages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

