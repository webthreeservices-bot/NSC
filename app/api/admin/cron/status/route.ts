/**
 * API Route: Admin - Get Cron Jobs Status
 * GET /api/admin/cron/status
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { getCronManagerStatus } from '@/cron/cronManager'

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

    // Get cron manager status
    const status = getCronManagerStatus()

    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('Error getting cron status:', error)
    return NextResponse.json(
      {
        error: 'Failed to get cron status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
