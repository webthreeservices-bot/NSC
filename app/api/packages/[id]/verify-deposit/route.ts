import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { z } from 'zod'

const verifyDepositSchema = z.object({
  txHash: z.string().min(1, 'Transaction hash is required'),
  network: z.enum(['BEP20', 'TRC20'])
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  try {
    const body = await request.json()
    const { id: packageId } = await params
    
    const validation = verifyDepositSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { txHash, network } = validation.data

    // Verify package ownership - CRITICAL security check
    const packageData = await queryOne(
      `SELECT "userId", status, amount FROM "Package" WHERE id = $1`,
      [packageId]
    )

    if (!packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Only the package owner can submit txHash
    if (packageData.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only submit transaction hash for your own packages' },
        { status: 403 }
      )
    }

    // Check if package is still pending
    if (packageData.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This package has already been processed' },
        { status: 400 }
      )
    }

    // CRITICAL: Check if this transaction hash has been used before
    const existingTx = await queryOne(
      `SELECT id, "userId" FROM "Package" WHERE "depositTxHash" = $1 AND id != $2`,
      [txHash, packageId]
    )

    if (existingTx) {
      return NextResponse.json(
        { error: 'This transaction hash has already been used for another package' },
        { status: 400 }
      )
    }

    // Check for duplicate in bot activations as well
    const existingBotTx = await queryOne(
      `SELECT id, "userId" FROM "BotActivation" WHERE "paymentTxHash" = $1`,
      [txHash]
    )

    if (existingBotTx) {
      return NextResponse.json(
        { error: 'This transaction hash has already been used for a bot activation' },
        { status: 400 }
      )
    }

    // Update package with txHash - Status remains PENDING until admin approves
    await execute(
      `UPDATE "Package" SET "depositTxHash" = $1, network = $2, "updatedAt" = $3 WHERE id = $4`,
      [txHash, network, new Date(), packageId]
    )

    // TODO: Send notification to admin for manual verification
    // await notifyAdminForPackageVerification(packageId, user.userId, txHash, network, packageData.amount)

    return NextResponse.json({
      success: true,
      message: 'Transaction hash submitted successfully. Your package will be activated once admin verifies your payment.',
      data: {
        packageId,
        txHash,
        status: 'PENDING_VERIFICATION'
      }
    })

  } catch (error: any) {
    console.error('Submit transaction hash error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit transaction hash' },
      { status: 500 }
    )
  }
}
