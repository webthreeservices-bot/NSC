import { NextRequest, NextResponse } from 'next/server'
import { handleOptions, handleCors } from '@/lib/cors'
import { logger } from '@/lib/logger'
import SessionManagementService from '@/services/sessionManagementService'

export async function OPTIONS(request: NextRequest) {
  return handleOptions()
}

export async function GET(request: NextRequest) {
  try {
    // Get session statistics
    const stats = await SessionManagementService.getSessionStats()
    
    return handleCors(NextResponse.json({
      success: true,
      stats
    }))

  } catch (error: any) {
    logger.error('Error getting session stats:', error)
    return NextResponse.json(
      { error: 'Failed to get session statistics' },
      { status: 500 }
    )
  }
}