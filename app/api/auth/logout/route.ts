import { NextRequest, NextResponse } from 'next/server'
import { handleOptions, handleCors } from '@/lib/cors'
import { logger } from '@/lib/logger'
import { logAuthEvent } from '@/lib/audit-logger'
import SessionManagementService from '@/services/sessionManagementService'
import jwt from 'jsonwebtoken'

export async function OPTIONS(request: NextRequest) {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header and cookie
    const authHeader = request.headers.get('Authorization')
    const tokenCookie = request.cookies.get('token')?.value

    let token: string | null = null
    let sessionId: string | null = null
    let userId: string | null = null

    // Try to extract session info from token
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
      try {
        const decoded = jwt.decode(token) as any
        sessionId = decoded?.sessionId
        userId = decoded?.userId
      } catch (error) {
        logger.error('Error decoding logout token:', error)
      }
    } else if (tokenCookie) {
      token = tokenCookie
      try {
        const decoded = jwt.decode(tokenCookie) as any
        sessionId = decoded?.sessionId
        userId = decoded?.userId
      } catch (error) {
        logger.error('Error decoding logout cookie:', error)
      }
    }

    // Revoke session using the actual token
    if (token) {
      try {
        // First, validate the session to get session details
        const session = await SessionManagementService.validateSession(token)
        
        if (session) {
          // Now revoke the session using the session ID
          const revoked = await SessionManagementService.revokeSession(session.sessionId)
          
          if (revoked && session.userId) {
            await logAuthEvent('LOGOUT', session.userId, {
              sessionId: session.sessionId,
              method: 'session_revocation'
            })
            logger.info(`Session ${session.sessionId} revoked for user ${session.userId}`)
          }
        }
      } catch (sessionError) {
        logger.error('Error revoking session during logout:', sessionError)
        // Continue with logout even if session revocation fails
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear cookies properly
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Immediately expire
    })

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Immediately expire
    })

    return handleCors(response)

  } catch (error: any) {
    logger.error('Logout error:', error)
    
    // Even if logout fails, clear cookies for security
    const response = NextResponse.json({
      success: true, // Still return success to clear frontend state
      message: 'Logged out (with errors)'
    }, { status: 200 })

    // Clear cookies
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })

    return handleCors(response)
  }
}
