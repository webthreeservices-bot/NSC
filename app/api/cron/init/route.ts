import { NextRequest, NextResponse } from 'next/server'
import { initializeCronJobs } from '@/cron/jobs'

let cronInitialized = false

/**
 * Cron Job Initialization Endpoint
 * 
 * @route GET /api/cron/init
 * @access Public (System Only - Should be Protected in Production)
 * @description One-time initialization endpoint for automated business logic cron jobs.
 *              NOT called by frontend. Usage scenarios:
 *              - Manual trigger via admin tool/script
 *              - Server startup initialization (if using pm2/docker)
 *              - Vercel deployment hooks (post-deploy)
 * 
 * ⚠️ PRODUCTION WARNING: Add authentication/IP whitelist before deploying to production.
 * 
 * Initialized Jobs:
 * - ROI Distribution: Daily at 05:30 IST (00:00 UTC)
 * - Bot Expiry Check: Daily at 06:30 IST (01:00 UTC)
 * - Package Expiry: Daily at 07:30 IST (02:00 UTC)
 * 
 * NOT handled here (use managed services):
 * - Database backups → Use Neon/PlanetScale automated backups
 * - Email digests → Use Vercel Cron or external scheduler
 * - Health monitoring → Use /api/health endpoint
 * 
 * @returns {Object} Initialization status and cron schedule details
 * 
 * @example
 * // Example response (already initialized):
 * {
 *   "success": true,
 *   "message": "Cron jobs already initialized"
 * }
 * 
 * @example
 * // Example response (first initialization):
 * {
 *   "success": true,
 *   "message": "Essential cron jobs initialized successfully",
 *   "schedule": {
 *     "roiDistribution": "Daily at 05:30 IST (00:00 UTC)"
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  if (cronInitialized) {
    return NextResponse.json({
      success: true,
      message: 'Cron jobs already initialized'
    })
  }

  try {
    initializeCronJobs()
    cronInitialized = true

    return NextResponse.json({
      success: true,
      message: 'Essential cron jobs initialized successfully',
      schedule: {
        roiDistribution: 'Daily at 05:30 IST (00:00 UTC)',
        botExpiry: 'Daily at 06:30 IST (01:00 UTC)',
        packageExpiry: 'Daily at 07:30 IST (02:00 UTC)'
      },
      note: 'Only essential business logic automation. Database backups, health monitoring, and email digests should be handled by managed services or admin dashboard.'
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initialize cron jobs'
      },
      { status: 500 }
    )
  }
}
