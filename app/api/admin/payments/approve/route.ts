import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'

import { queryOne, update } from '@/lib/db-queries'
import { sendUsdt } from '@/lib/blockchain'
import { Network } from '@/types'
import { notifyUser, notifyAdmin } from '@/lib/notifications'

/**
 * Admin API: Approve a payment and trigger payout
 * POST /api/admin/payments/approve
 * Body: { paymentRequestId: string, userWallet: string }
 * Only admin can access
 */
export async function POST(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { paymentRequestId, userWallet } = await request.json()
  if (!paymentRequestId || !userWallet) {
    return NextResponse.json({ error: 'Missing paymentRequestId or userWallet' }, { status: 400 })
  }

  // Fetch payment request
  const paymentRequest = await queryOne(
    'SELECT * FROM "PaymentRequest" WHERE id = $1',
    [paymentRequestId]
  )
  if (!paymentRequest) {
    return NextResponse.json({ error: 'Payment request not found' }, { status: 404 })
  }
  if (paymentRequest.status !== 'AWAITING_ADMIN_APPROVAL') {
    return NextResponse.json({ error: 'Payment is not awaiting admin approval' }, { status: 400 })
  }

  // Send USDT payout to user
  try {
    const txHash = await sendUsdt(
      userWallet,
      Number(paymentRequest.amount),
      paymentRequest.network as Network
    )
    // Mark as completed
    await update('PaymentRequest', {
      where: { id: paymentRequestId },
      data: {
        status: 'COMPLETED',
        payoutTxHash: txHash,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    })
    // Notify user and admin
    await notifyUser(paymentRequest.userId, 'Payment Approved', `Your payment has been approved and payout sent. Tx: ${txHash}`, 'SUCCESS')
    await notifyAdmin('Payment Approved', `Payment for user ${paymentRequest.userId} approved and payout sent. Tx: ${txHash}`, 'SUCCESS')
    return NextResponse.json({ success: true, txHash })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send payout' }, { status: 500 })
  }
}
