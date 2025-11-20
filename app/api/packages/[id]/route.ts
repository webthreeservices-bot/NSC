import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { authenticateToken } from '@/middleware/auth'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  try {
    const { id: packageId } = await params

    // Get package with ROI history
    const pkg = await queryOne(
      `SELECT
        p.*,
        u.id as "userId_user",
        u.email as "user_email",
        u.username as "user_username",
        u."fullName" as "user_fullName"
       FROM "Package" p
       LEFT JOIN "User" u ON p."userId" = u.id
       WHERE p.id = $1`,
      [packageId]
    )

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Get ROI payments separately
    const roiPayments = await query(
      `SELECT * FROM "RoiPayment" WHERE "packageId" = $1 ORDER BY "monthNumber" ASC`,
      [packageId]
    )

    // Reconstruct package object with user and roiPayments
    pkg.user = {
      id: pkg.userId_user,
      email: pkg.user_email,
      username: pkg.user_username,
      fullName: pkg.user_fullName
    }
    pkg.roiPayments = roiPayments

    // Clean up temporary fields
    delete pkg.userId_user
    delete pkg.user_email
    delete pkg.user_username
    delete pkg.user_fullName

    // Check if user owns this package (user.userId from JWT token)
    if (pkg.userId !== user.userId && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access to this package' },
        { status: 403 }
      )
    }

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
    const serializedPackage = {
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
    }

    return NextResponse.json({
      success: true,
      package: serializedPackage,
      roiHistory: serializedPackage.roiPayments,
      nextRoiDate: serializedPackage.nextRoiDate
    })

  } catch (error) {
    console.error('Get package error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package' },
      { status: 500 }
    )
  }
}
