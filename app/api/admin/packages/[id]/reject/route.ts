import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import pool from '@/lib/db-connection'
import { v4 as uuidv4 } from 'uuid'

/**
 * Admin endpoint to reject a package
 * This marks the package as rejected and creates a transaction record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate and verify admin
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  // Only admins can reject packages
  if (!user.isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    )
  }

  try {
    const { id: packageId } = await params

    // Get package with user details
    const findPackageQuery = `
      SELECT p.*, u.id AS "userId", u.email, u."referredBy"
      FROM "Package" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p.id = $1
    `

    const { rows } = await pool.query(findPackageQuery, [packageId])

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    const pkg = rows[0]

    // Check if package is already processed
    if (pkg.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot reject an active package' },
        { status: 400 }
      )
    }

    if (pkg.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Package is already rejected' },
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Update package status to REJECTED with proper enum cast
      const updatePackageQuery = `
        UPDATE "Package"
        SET
          status = 'REJECTED'::\"PackageStatus\",
          "rejectedBy" = $1,
          "rejectedAt" = $2,
          "updatedAt" = $3
        WHERE id = $4
      `

      await client.query(updatePackageQuery, [
        user.userId,
        new Date(),
        new Date(),
        packageId
      ])

      // Create transaction record for rejection
      const transactionId = uuidv4()
      const now = new Date()

      const createTransactionQuery = `
        INSERT INTO "Transaction" (
          id, "userId", type, amount, "txHash", network,
          status, description, "referenceId", "referenceType", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3::\"TransactionType\", $4, $5, $6::\"Network\", $7::\"TransactionStatus\", $8, $9, $10, $11, $12)
      `

      await client.query(createTransactionQuery, [
        transactionId,
        pkg.userId,
        'PACKAGE_PURCHASE',
        pkg.amount,
        pkg.depositTxHash || 'ADMIN_REJECTED',
        pkg.network || 'MANUAL',
        'FAILED',
        'Package rejected by admin',
        packageId,
        'PACKAGE',
        now,
        now
      ])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Package rejected successfully',
        package: {
          id: pkg.id,
          status: 'REJECTED',
          amount: Number(pkg.amount),
          packageType: pkg.packageType
        }
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error: any) {
    console.error('Package rejection error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject package' },
      { status: 500 }
    )
  }
}
