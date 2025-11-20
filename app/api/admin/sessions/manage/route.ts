import { NextRequest, NextResponse } from 'next/server'
import { handleOptions, handleCors } from '@/lib/cors'
import { logger } from '@/lib/logger'
import SessionManagementService from '@/services/sessionManagementService'

export async function OPTIONS(request: NextRequest) {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, sessionId, action } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing userId or action' },
        { status: 400 }
      )
    }

    let result: any = {}

    switch (action) {
      case 'revoke_session':
        if (!sessionId) {
          return NextResponse.json(
            { error: 'sessionId required for revoke_session action' },
            { status: 400 }
          )
        }
        result.revoked = await SessionManagementService.revokeSession(sessionId)
        break

      case 'revoke_all':
        result.revokedCount = await SessionManagementService.revokeAllUserSessions(userId)
        break

      case 'revoke_others':
        if (!sessionId) {
          return NextResponse.json(
            { error: 'sessionId required for revoke_others action' },
            { status: 400 }
          )
        }
        result.revokedCount = await SessionManagementService.revokeOtherSessions(userId, sessionId)
        break

      case 'get_sessions':
        result.sessions = await SessionManagementService.getUserSessions(userId)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return handleCors(NextResponse.json({
      success: true,
      action,
      result
    }))

  } catch (error: any) {
    logger.error('Error managing session:', error)
    return NextResponse.json(
      { error: 'Failed to manage session' },
      { status: 500 }
    )
  }
}