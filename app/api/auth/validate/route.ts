import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/utils/server-helpers'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Try to get token from multiple sources
    let token: string | null = null

    // 1. Try Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    // 2. Try from cookies if not in header
    if (!token) {
      token = request.cookies.get('token')?.value
    }

    // 3. Try from request body (for POST requests)
    if (!token) {
      try {
        const body = await request.json()
        token = body.token
      } catch {
        // Ignore JSON parsing errors
      }
    }

    if (!token) {
      return NextResponse.json({ 
        valid: false, 
        error: 'No authentication token provided',
        debug: 'Token not found in headers, cookies, or body'
      }, { status: 401 })
    }

    // Verify the token
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired token',
        debug: 'Token verification failed'
      }, { status: 401 })
    }

    // Token is valid - return user info
    return NextResponse.json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin || false,
        sessionId: decoded.sessionId
      }
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Token validation failed',
      debug: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
