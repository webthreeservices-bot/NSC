/**
 * API Route: Admin - Manually Trigger Expiration Check
 * POST /api/admin/cron/expiration/trigger
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { triggerManualExpiration } from '@/cron/expirationCron'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    // Check admin
    const adminCheck = requireAdmin(user)
    if (adminCheck instanceof NextResponse) return adminCheck

    // Trigger manual expiration check
    console.log(`[Admin] Manual expiration check triggered by admin: ${user.id}`)
    const status = await triggerManualExpiration()

    return NextResponse.json({
      success: true,
      message: 'Expiration check triggered successfully',
      data: status,
    })
  } catch (error) {
    console.error('Error triggering expiration check:', error)
    return NextResponse.json(
      {
        error: 'Failed to trigger expiration check',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
