import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { calculateReferralEarnings, payDirectReferralBonus, distributeLevelIncome } from '@/services/referralService'
import { sendPackageActivationEmail } from '@/utils/email'
import pool from '@/lib/db-connection'
import { v4 as uuidv4 } from 'uuid'

/**
 * Admin endpoint to manually approve a package
 * This bypasses blockchain verification for manual admin approval
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate and verify admin
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  // Only admins can approve packages
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

    // Check if package is already active
    if (pkg.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Package is already active' },
        { status: 400 }
      )
    }

    // Transform the result to match expected structure
    pkg.user = {
      id: pkg.userId,
      email: pkg.email,
      referredBy: pkg.referredBy
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Update package status to ACTIVE with proper enum cast
      const updatePackageQuery = `
        UPDATE "Package"
        SET
          status = 'ACTIVE'::"PackageStatus",
          "depositTxHash" = $1,
          "activatedAt" = $2,
          "approvedBy" = $3,
          "approvedAt" = $4,
          "updatedAt" = $5,
          "nextRoiDate" = CASE 
            WHEN "packageType" IN ('TEST_1', 'TEST_2', 'TEST_3') THEN $2 + INTERVAL '15 minutes'
            ELSE $2 + INTERVAL '30 days'
          END
        WHERE id = $6
      `

      await client.query(updatePackageQuery, [
        pkg.depositTxHash || 'ADMIN_APPROVED',
        new Date(),
        user.userId,
        new Date(),
        new Date(),
        packageId
      ])

      // Create deposit transaction record
      const transactionId = uuidv4()
      const now = new Date()

      const createTransactionQuery = `
        INSERT INTO "Transaction" (
          id, "userId", type, amount, "txHash", network,
          status, description, "referenceId", "referenceType", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3::"TransactionType", $4, $5, $6::"Network", $7::"TransactionStatus", $8, $9, $10, $11, $12)
      `

      await client.query(createTransactionQuery, [
        transactionId,
        pkg.userId,
        'PACKAGE_PURCHASE',
        pkg.amount,
        pkg.depositTxHash || 'ADMIN_APPROVED',
        pkg.network || 'MANUAL',
        'COMPLETED',
        'Package approved by admin',
        packageId,
        'PACKAGE',
        now,
        now
      ])

      await client.query('COMMIT')

      // Pay referral bonuses if user has referrer (outside transaction)
      if (pkg.user.referredBy) {
        try {
          // Use the SQL function to calculate and distribute all referral earnings atomically
          await calculateReferralEarnings(packageId, pkg.userId, Number(pkg.amount))
          // Distribute referral earnings on-chain (non-blocking)
          try {
            const { distributeReferralEarningsOnChain } = await import('@/services/referralService')
            await distributeReferralEarningsOnChain(packageId, pkg.network)
          } catch (err) {
            console.error('[Referral] error distributing referral earnings on-chain:', err)
          }
          console.log(`✅ Referral earnings processed for package ${packageId}`)
        } catch (error) {
          console.error('❌ Error paying referral bonuses:', error)
          // Don't fail the approval if referral payment fails
        }
      }

      // Send confirmation email
      try {
        await sendPackageActivationEmail(pkg.user.email, Number(pkg.amount), pkg.packageType)
      } catch (error) {
        console.error('Error sending activation email:', error)
        // Don't fail the approval if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Package approved and activated successfully',
        package: {
          id: pkg.id,
          status: 'ACTIVE',
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
    console.error('Package approval error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve package' },
      { status: 500 }
    )
  }
}
