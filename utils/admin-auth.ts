import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db-helpers'
import { verifyToken } from '@/utils/server-helpers'

interface AuthResult {
  isAuthorized: boolean;
  user?: any;
  response?: NextResponse;
}

/**
 * Verify admin authentication and handle redirects
 */
export async function verifyAdminAccess(request: NextRequest): Promise<AuthResult> {
  // Try to get token from cookie or Authorization header
  let token = request.cookies.get('auth_token')?.value

  if (!token) {
    // Try Authorization header
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  // Check if it's an API request
  const isApiRequest = request.nextUrl.pathname.startsWith('/api/')

  if (!token) {
    if (isApiRequest) {
      return {
        isAuthorized: false,
        response: NextResponse.json(
          { 
            error: 'Unauthorized - Please log in', 
            requiresAuth: true,
            redirectUrl: '/admin/login'
          },
          { status: 401 }
        )
      }
    } else {
      return {
        isAuthorized: false,
        response: NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  }

  try {
    const decoded = verifyToken(token)
    if (!decoded || !decoded.isAdmin) {
      if (isApiRequest) {
        return {
          isAuthorized: false,
          response: NextResponse.json(
            { 
              error: 'Unauthorized - Admin access required',
              requiresAuth: true,
              redirectUrl: '/admin/login'
            },
            { status: 401 }
          )
        }
      } else {
        return {
          isAuthorized: false,
          response: NextResponse.redirect(new URL('/admin/login', request.url))
        }
      }
    }
    
    return {
      isAuthorized: true,
      user: decoded
    }
  } catch (error) {
    if (isApiRequest) {
      return {
        isAuthorized: false,
        response: NextResponse.json(
          { 
            error: 'Invalid token - Please log in again',
            requiresAuth: true,
            redirectUrl: '/admin/login'
          },
          { status: 401 }
        )
      }
    } else {
      return {
        isAuthorized: false,
        response: NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  }
}