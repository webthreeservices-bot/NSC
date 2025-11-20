import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/utils/server-helpers'
import { neonQuery } from '@/lib/neon-serverless'
import { queryOne } from '@/lib/db'
import { AuthUser, JwtPayload } from '@/types/api'
import SessionManagementService from '@/services/sessionManagementService'
import { createHash } from 'crypto'

export interface AuthRequest extends NextRequest {
  user?: AuthUser
}

/**
 * Authenticate JWT token middleware with session validation
 */
export async function authenticateToken(
  request: NextRequest,
  options: { validateSession?: boolean } = {}
): Promise<{ user: AuthUser } | NextResponse> {
  // Try to get token from cookies first (browser requests)
  const tokenCookie = request.cookies.get('token')?.value
  
  // If not in cookies, try authorization header (API requests)
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.split(' ')[1]
  
  const token = tokenCookie || headerToken
  
  if (!token) {
    return NextResponse.json(
      { error: 'Access token required' },
      { status: 401 }
    )
  }
  
  try {
    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId || !decoded.email) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 403 }
      )
    }

    // Validate session if requested (for critical operations)
    if (options.validateSession) {
      const tokenHash = createHash('sha256').update(token).digest('hex')
      const session = await SessionManagementService.validateSession(tokenHash)
      
      if (!session || !session.isActive) {
        return NextResponse.json(
          { error: 'Session expired or revoked' },
          { status: 401 }
        )
      }

      // Verify user is still active in database
      const user = await queryOne(
        `SELECT id, email, "isActive" FROM "User" WHERE id = $1`,
        [decoded.userId]
      )

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: 'User account is inactive' },
          { status: 403 }
        )
      }
    }
    
    const user: AuthUser = {
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false
    }
    
    return { user }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 403 }
    )
  }
}

/**
 * Require admin role middleware
 */
export function requireAdmin(user: AuthUser): { isAdmin: boolean } | NextResponse {
  if (!user || !user.isAdmin) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }
  
  return { isAdmin: true }
}

/**
 * Require bot activation middleware
 */
export async function requireBotActivation(userId: string, botType: string): Promise<NextResponse | null> {
  try {
    // Use Neon Serverless query to check for active bot activation
    const query = `
      SELECT * FROM "BotActivation"
      WHERE "userId" = $1 AND "botType" = $2
      AND "status" = 'ACTIVE' AND "isExpired" = false
      LIMIT 1
    `;

    const result = await neonQuery(query, [userId, botType]);
    const botActivation = Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!botActivation) {
      return NextResponse.json(
        { error: 'Bot activation required for this action' },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error('Error checking bot activation:', error);
    return NextResponse.json(
      { error: 'Error checking bot activation' },
      { status: 500 }
    );
  }
}

/**
 * Verify authentication from token in cookies or headers
 * Returns user ID if authenticated
 */
export async function verifyAuth(request: NextRequest): Promise<{ success: boolean; userId?: string }> {
  // Try to get token from cookies first
  const tokenCookie = request.cookies.get('token')?.value
  
  // If not in cookies, try authorization header
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader?.split(' ')[1]
  
  const token = tokenCookie || headerToken
  
  if (!token) {
    return { success: false }
  }
  
  try {
    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return { success: false }
    }
    
    return { success: true, userId: decoded.userId }
  } catch (error) {
    return { success: false }
  }
}
