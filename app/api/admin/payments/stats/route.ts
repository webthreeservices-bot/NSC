/**
 * API Route: Admin - Payment Statistics
 * GET /api/admin/payments/stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { getPaymentStatistics } from '@/services/paymentGatewayService'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    // Check admin
    const adminCheck = requireAdmin(user)
    if (adminCheck instanceof NextResponse) return adminCheck

    // Get payment statistics
    const stats = await getPaymentStatistics()

    // Get webhook stats
    const [webhookTotal, webhookProcessed, webhookUnprocessed] = await Promise.all([
      query<{ count: number }>(`SELECT COUNT(*)::int as count FROM "PaymentWebhook"`),
      query<{ count: number }>(`SELECT COUNT(*)::int as count FROM "PaymentWebhook" WHERE processed = true`),
      query<{ count: number }>(`SELECT COUNT(*)::int as count FROM "PaymentWebhook" WHERE processed = false`)
    ])

    const webhookStats = {
      total: webhookTotal[0]?.count || 0,
      processed: webhookProcessed[0]?.count || 0,
      unprocessed: webhookUnprocessed[0]?.count || 0,
    }

    // Get confirmation stats
    const [confirmTotal, confirmConfirmed, confirmPending] = await Promise.all([
      query<{ count: number }>(`SELECT COUNT(*)::int as count FROM "PaymentConfirmation"`),
      query<{ count: number }>(`SELECT COUNT(*)::int as count FROM "PaymentConfirmation" WHERE "isConfirmed" = true`),
      query<{ count: number }>(`SELECT COUNT(*)::int as count FROM "PaymentConfirmation" WHERE "isConfirmed" = false`)
    ])

    const confirmationStats = {
      total: confirmTotal[0]?.count || 0,
      confirmed: confirmConfirmed[0]?.count || 0,
      pending: confirmPending[0]?.count || 0,
    }

    // Get blockchain scan state
    const scanStates = await query<{
      network: string
      lastScannedBlock: string
      lastScanTime: Date | null
      isScanning: boolean
      errorCount: number
      lastError: string | null
    }>(`SELECT * FROM "BlockchainScanState"`)

    // Get recent payments
    const recentPayments = await query<{
      id: string
      userId: string
      purpose: string
      amount: string
      network: string
      status: string
      txHash: string | null
      confirmations: number
      createdAt: Date
      completedAt: Date | null
    }>(`
      SELECT
        id,
        "userId",
        purpose,
        amount,
        network,
        status,
        "txHash",
        confirmations,
        "createdAt",
        "completedAt"
      FROM "PaymentRequest"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `)

    return NextResponse.json({
      success: true,
      data: {
        payments: stats,
        webhooks: webhookStats,
        confirmations: confirmationStats,
        scanStates: scanStates.map((state) => ({
          network: state.network,
          lastScannedBlock: Number(state.lastScannedBlock),
          lastScanTime: state.lastScanTime,
          isScanning: state.isScanning,
          errorCount: state.errorCount,
          lastError: state.lastError,
        })),
        recentPayments: recentPayments.map((payment) => ({
          ...payment,
          amount: Number(payment.amount),
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching payment statistics:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch payment statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

