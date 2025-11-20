import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/utils/auth'

// Proxy route handler to handle authentication
export async function GET(request: NextRequest) {
  return handleRequest(request)
}

export async function POST(request: NextRequest) {
  return handleRequest(request)
}

export async function PUT(request: NextRequest) {
  return handleRequest(request)
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request)
}

async function handleRequest(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Exclude login page and login API from authentication
  if (pathname === '/admin/admin-login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  // Check if this is an admin route
  const isAdminRoute = pathname.startsWith('/admin') ||
                      pathname.startsWith('/api/admin')

  if (isAdminRoute) {
    // Try to get token from cookie or Authorization header
    let token = request.cookies.get('auth_token')?.value

    if (!token) {
      // Try Authorization header
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/admin/admin-login', request.url))
    }

    try {
      // Verify the token
      const decoded = verifyToken(token)
      if (!decoded || !decoded.isAdmin) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }
        return NextResponse.redirect(new URL('/admin/admin-login', request.url))
      }
    } catch (error) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/admin/admin-login', request.url))
    }
  }

  return NextResponse.next()
}

// Remove the config export as it's not needed in the proxy route