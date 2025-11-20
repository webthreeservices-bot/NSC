/**
 * Admin Rate Limiting Middleware
 * Apply this to all admin routes for rate limiting protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminLimiter, createRateLimitResponse } from '@/lib/rate-limit'
import { authenticateToken, requireAdmin } from './auth'

/**
 * Middleware to apply rate limiting and authentication to admin routes
 * Usage: export const GET = withAdminRateLimit(async (request, user) => { ... })
 */
export function withAdminRateLimit(
  handler: (request: NextRequest, userId: string, isAdmin: boolean) => Promise<NextResponse>
) {
  return async function (request: NextRequest, context?: any) {
    // 1. Apply rate limiting first
    const rateLimitResult = adminLimiter.check(request)
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime)
    }

    // 2. Authenticate token
    const authResult = await authenticateToken(request, { validateSession: true })
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    // 3. Require admin privileges
    const adminCheck = requireAdmin(user)
    if (adminCheck instanceof NextResponse) {
      return adminCheck
    }

    // 4. Execute handler with rate limit headers
    try {
      const response = await handler(request, user.userId, user.isAdmin)
      
      // Add rate limit headers to response
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        response.headers.set(
          'X-RateLimit-Reset',
          new Date(rateLimitResult.resetTime).toISOString()
        )
      }

      return response
    } catch (error) {
      console.error('Admin route error:', error)
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware for admin routes without session validation (less strict)
 */
export function withAdminRateLimitNoSession(
  handler: (request: NextRequest, userId: string, isAdmin: boolean) => Promise<NextResponse>
) {
  return async function (request: NextRequest, context?: any) {
    // 1. Apply rate limiting
    const rateLimitResult = adminLimiter.check(request)
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime)
    }

    // 2. Authenticate token (no session validation)
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    // 3. Require admin privileges
    const adminCheck = requireAdmin(user)
    if (adminCheck instanceof NextResponse) {
      return adminCheck
    }

    // 4. Execute handler
    try {
      const response = await handler(request, user.userId, user.isAdmin)
      
      // Add rate limit headers
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        response.headers.set(
          'X-RateLimit-Reset',
          new Date(rateLimitResult.resetTime).toISOString()
        )
      }

      return response
    } catch (error) {
      console.error('Admin route error:', error)
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  }
}
