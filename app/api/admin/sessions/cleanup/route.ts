import { NextRequest, NextResponse } from 'next/server'
import { handleOptions, handleCors } from '@/lib/cors'
import { logger } from '@/lib/logger'
import SessionManagementService from '@/services/sessionManagementService'
import { SessionManagementCron } from '@/cron/sessionManagementCron'

export async function OPTIONS(request: NextRequest) {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  try {
    // Force cleanup of expired sessions
    const result = await SessionManagementCron.forceCleanup()
    
    return handleCors(NextResponse.json({
      success: true,
      message: 'Session cleanup completed',
      result: {
        cleanedSessions: result.cleanedSessions,
        activeSessionsAfterCleanup: result.activeSessionsAfterCleanup,
        uniqueUsersAfterCleanup: result.uniqueUsersAfterCleanup,
        timestamp: result.timestamp
      }
    }))

  } catch (error: any) {
    logger.error('Error performing session cleanup:', error)
    return NextResponse.json(
      { error: 'Failed to perform session cleanup' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get cleanup statistics
    const stats = SessionManagementCron.getCleanupStats()
    const recentHistory = SessionManagementCron.getRecentCleanupHistory(10)
    const healthCheck = await SessionManagementCron.healthCheck()
    
    return handleCors(NextResponse.json({
      success: true,
      stats,
      recentHistory,
      healthCheck
    }))

  } catch (error: any) {
    logger.error('Error getting session cleanup info:', error)
    return NextResponse.json(
      { error: 'Failed to get session cleanup information' },
      { status: 500 }
    )
  }
}