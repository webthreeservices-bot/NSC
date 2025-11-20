import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { ensureDatabaseConnection } from '@/lib/db-health'

// Delay checking secrets until request time so Next.js build/static analyzer
// does not throw during build (build time doesn't have environment secrets).
// This lets Netlify build run safely; production must still set these values.

export async function POST(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET

  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET environment variable is not set!')
    return NextResponse.json(
      { error: 'JWT_SECRET is not configured' },
      { status: 500 }
    )
  }

  if (!JWT_REFRESH_SECRET) {
    console.error('CRITICAL: JWT_REFRESH_SECRET environment variable is not set!')
    return NextResponse.json(
      { error: 'JWT_REFRESH_SECRET is not configured' },
      { status: 500 }
    )
  }
  try {
    // Check database connection health before proceeding
    try {
      await ensureDatabaseConnection()
    } catch (dbError) {
      console.error('Database health check failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }
    
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Verify refresh token
    let decoded: any
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
    } catch (error) {
      console.error('Refresh token verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Check if user still exists and is active
    const user = await queryOne(
      `SELECT id, email, "isAdmin", "isActive" FROM "User" WHERE id = $1`,
      [decoded.userId]
    )

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Optionally generate new refresh token (rotation strategy)
    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    // Set cookies
    const response = NextResponse.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    })

    response.cookies.set('token', newAccessToken, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Strict in prod, lax in dev for testing
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Strict in prod, lax in dev for testing
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    )
  }
}

