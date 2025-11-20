import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken, requireAdmin } from '@/middleware/auth'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    // Get all user packages with user details
    const packages = await query<{
      id: string
      userId: string
      packageType: string
      amount: string
      roiPercentage: string
      status: string
      investmentDate: Date | null
      expiryDate: Date | null
      totalRoiPaid: string
      roiPaidCount: number
      depositTxHash: string | null
      network: string | null
      createdAt: Date
      userEmail: string
      userFullName: string
    }>(`
      SELECT
        p.id,
        p."userId",
        p."packageType",
        p.amount,
        p."roiPercentage",
        p.status,
        p."investmentDate",
        p."expiryDate",
        p."totalRoiPaid",
        p."roiPaidCount",
        p."depositTxHash",
        p.network,
        p."createdAt",
        u.email as "userEmail",
        u."fullName" as "userFullName"
      FROM "Package" p
      LEFT JOIN "User" u ON p."userId" = u.id
      ORDER BY p."createdAt" DESC
    `)

    // Transform to expected format
    const transformedPackages = packages.map(pkg => {
      // Helper to ensure ISO string
      const toISOString = (value: any) => {
        if (!value) return new Date().toISOString();
        if (typeof value === 'string') return value;
        if (value instanceof Date) return value.toISOString();
        return new Date().toISOString();
      };

      return {
        id: pkg.id,
        userId: pkg.userId,
        userEmail: pkg.userEmail || 'N/A',
        packageType: pkg.packageType || 'STANDARD',
        amount: Number(pkg.amount),
        roiPercentage: Number(pkg.roiPercentage),
        status: pkg.status || 'PENDING',
        investmentDate: toISOString(pkg.investmentDate || pkg.createdAt),
        expiryDate: toISOString(pkg.expiryDate || pkg.createdAt),
        totalRoiPaid: Number(pkg.totalRoiPaid || 0),
        roiPaidCount: pkg.roiPaidCount || 0,
        depositTxHash: pkg.depositTxHash,
        network: pkg.network,
        createdAt: toISOString(pkg.createdAt)
      };
    });

    return NextResponse.json({
      success: true,
      packages: transformedPackages
    })

  } catch (error) {
    console.error('Get bot packages error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bot packages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = await request.json()
    const { userId, packageType, amount, roiPercentage, network, notes } = body

    // Validate required fields
    if (!userId || !packageType || !amount || !roiPercentage) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, packageType, amount, roiPercentage' },
        { status: 400 }
      )
    }

    // Validate packageType
    const validPackageTypes = ['NEO', 'NEURAL', 'ORACLE']
    if (!validPackageTypes.includes(packageType)) {
      return NextResponse.json(
        { success: false, error: `Invalid packageType. Must be one of: ${validPackageTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Create new package
    const newPackageResult = await query<{
      id: string
      userId: string
      packageType: string
      amount: string
      roiPercentage: string
      status: string
      notes: string | null
      network: string | null
    }>(`
      INSERT INTO "Package" (
        "userId", "packageType", amount, "roiPercentage", network,
        notes, status, "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, "userId", "packageType", amount, "roiPercentage", status, notes, network
    `, [
      userId,
      packageType,
      amount,
      roiPercentage,
      network || null,
      notes || null,
      'PENDING',
      new Date(),
      new Date()
    ])
    const newPackage = newPackageResult[0]

    return NextResponse.json({
      success: true,
      package: {
        id: newPackage.id,
        userId: newPackage.userId,
        packageType: newPackage.packageType,
        amount: Number(newPackage.amount),
        roiPercentage: Number(newPackage.roiPercentage),
        status: newPackage.status,
        network: newPackage.network,
        notes: newPackage.notes
      }
    })

  } catch (error) {
    console.error('Create bot package error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create bot package' },
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
    const { id, packageType, amount, roiPercentage, network, notes, status } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Validate packageType if provided
    if (packageType) {
      const validPackageTypes = ['NEO', 'NEURAL', 'ORACLE']
      if (!validPackageTypes.includes(packageType)) {
        return NextResponse.json(
          { success: false, error: `Invalid packageType. Must be one of: ${validPackageTypes.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['PENDING', 'ACTIVE', 'EXPIRED', 'WITHDRAWN', 'CANCELLED', 'COMPLETED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Build dynamic update query
    const updates: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (packageType !== undefined) {
      updates.push(`"packageType" = $${paramCount}`)
      params.push(packageType)
      paramCount++
    }
    if (amount !== undefined) {
      updates.push(`amount = $${paramCount}`)
      params.push(amount)
      paramCount++
    }
    if (roiPercentage !== undefined) {
      updates.push(`"roiPercentage" = $${paramCount}`)
      params.push(roiPercentage)
      paramCount++
    }
    if (network !== undefined) {
      updates.push(`network = $${paramCount}`)
      params.push(network)
      paramCount++
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`)
      params.push(notes)
      paramCount++
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}::"PackageStatus"`)
      params.push(status)
      paramCount++
    }

    updates.push(`"updatedAt" = $${paramCount}`)
    params.push(new Date())
    paramCount++

    params.push(id)

    // Update package
    const updatedPackageResult = await query<{
      id: string
      packageType: string
      amount: string
      roiPercentage: string
      network: string | null
      notes: string | null
      status: string
    }>(`
      UPDATE "Package"
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, "packageType", amount, "roiPercentage", network, notes, status
    `, params)

    if (updatedPackageResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }

    const updatedPackage = updatedPackageResult[0]

    return NextResponse.json({
      success: true,
      package: {
        id: updatedPackage.id,
        packageType: updatedPackage.packageType,
        amount: Number(updatedPackage.amount),
        roiPercentage: Number(updatedPackage.roiPercentage),
        network: updatedPackage.network,
        notes: updatedPackage.notes,
        status: updatedPackage.status
      }
    })

  } catch (error) {
    console.error('Update bot package error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update bot package' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Soft delete - mark as cancelled
    await execute(`
      UPDATE "Package"
      SET status = 'CANCELLED'::"PackageStatus", "updatedAt" = $2
      WHERE id = $1
    `, [id, new Date()])

    return NextResponse.json({
      success: true,
      message: 'Package cancelled successfully'
    })

  } catch (error) {
    console.error('Delete bot package error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete bot package' },
      { status: 500 }
    )
  }
}

