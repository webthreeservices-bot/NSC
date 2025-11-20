/**
 * API Route: Admin - Manually Trigger ROI Payout
 * POST /api/admin/cron/roi/trigger
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { triggerManualRoiPayout } from '@/cron/roiPayoutCron'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    // Check admin
    const adminCheck = requireAdmin(user)
    if (adminCheck instanceof NextResponse) return adminCheck

    // Trigger manual ROI payout
    console.log(`[Admin] Manual ROI payout triggered by admin: ${user.id}`)
    const status = await triggerManualRoiPayout()

    return NextResponse.json({
      success: true,
      message: 'ROI payout triggered successfully',
      data: status,
    })
  } catch (error) {
    console.error('Error triggering ROI payout:', error)
    return NextResponse.json(
      {
        error: 'Failed to trigger ROI payout',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
