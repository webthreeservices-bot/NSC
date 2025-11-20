/**
 * API Response Caching Middleware
 * Caches API responses to improve performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCache, setCache } from '@/lib/cache'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  key?: string // Custom cache key
  invalidateOn?: string[] // Events that invalidate this cache
}

/**
 * Cache middleware wrapper for API routes
 */
export function withCaching(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: CacheOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return handler(req)
    }

    try {
      // Generate cache key
      const cacheKey =
        options.key || `api:${req.nextUrl.pathname}:${req.nextUrl.searchParams.toString()}`

      // Try to get from cache
      const cached = await getCache(cacheKey)
      if (cached) {
        console.log(`[Cache] HIT: ${cacheKey}`)
        return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          },
        })
      }

      console.log(`[Cache] MISS: ${cacheKey}`)

      // Execute handler
      const response = await handler(req)

      // Cache successful responses
      if (response.ok) {
        const data = await response.json()
        await setCache(cacheKey, data, options.ttl || 300)

        return NextResponse.json(data, {
          headers: {
            'X-Cache': 'MISS',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          },
        })
      }

      return response
    } catch (error) {
      console.error('[Cache Middleware] Error:', error)
      // On error, just execute handler without caching
      return handler(req)
    }
  }
}

/**
 * Set browser caching headers
 */
export function setCacheHeaders(
  response: NextResponse,
  maxAge: number = 3600,
  staleWhileRevalidate: number = 86400
): NextResponse {
  response.headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  )
  return response
}

/**
 * Disable caching
 */
export function setNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

/**
 * Cache tags for invalidation
 */
export const CacheTags = {
  USER: 'user',
  PACKAGE: 'package',
  TRANSACTION: 'transaction',
  EARNING: 'earning',
  BOT: 'bot',
  ADMIN: 'admin',
  STATS: 'stats',
}
