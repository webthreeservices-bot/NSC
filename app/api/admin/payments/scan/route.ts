/**
 * API Route: Admin - Manual Payment Scan
 * POST /api/admin/payments/scan
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { triggerManualScan, getScannerStatus } from '@/cron/paymentScanner'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    // Check admin
    const adminCheck = requireAdmin(user)
    if (adminCheck instanceof NextResponse) return adminCheck

    // Trigger manual scan
    const status = await triggerManualScan()

    return NextResponse.json({
      success: true,
      message: 'Manual scan triggered successfully',
      data: status,
    })
  } catch (error) {
    console.error('Error triggering manual scan:', error)
    return NextResponse.json(
      {
        error: 'Failed to trigger manual scan',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    // Check admin
    const adminCheck = requireAdmin(user)
    if (adminCheck instanceof NextResponse) return adminCheck

    // Get scanner status
    const status = getScannerStatus()

    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('Error getting scanner status:', error)
    return NextResponse.json(
      {
        error: 'Failed to get scanner status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
