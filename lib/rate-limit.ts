import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: NextRequest) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  private cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  private getKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req)
    }
    
    // Default: use IP address
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return `${ip}:${req.nextUrl.pathname}`
  }

  check(req: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(req)
    const now = Date.now()
    const resetTime = now + this.config.windowMs

    if (!this.store[key] || this.store[key].resetTime < now) {
      // First request or window expired
      this.store[key] = {
        count: 1,
        resetTime
      }
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime
      }
    }

    // Increment count
    this.store[key].count++

    const remaining = Math.max(0, this.config.maxRequests - this.store[key].count)
    const allowed = this.store[key].count <= this.config.maxRequests

    return {
      allowed,
      remaining,
      resetTime: this.store[key].resetTime
    }
  }
}

// Create rate limiters for different endpoints
export const generalLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
})

export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return `auth:${ip}`
  }
})

export const withdrawalLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id')
    return `withdrawal:${userId || 'anonymous'}`
  }
})

export const apiLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id')
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return `api:${userId || ip}`
  }
})

// Admin route rate limiter - more restrictive
export const adminLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute for admin operations
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id')
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return `admin:${userId || ip}`
  }
})

// Helper function to create rate limit response
export function createRateLimitResponse(remaining: number, resetTime: number) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  )
}

// Middleware wrapper for API routes
export function withRateLimit(limiter: RateLimiter) {
  return function(handler: Function) {
    return async function(req: NextRequest, ...args: any[]) {
      const result = limiter.check(req)
      
      if (!result.allowed) {
        return createRateLimitResponse(result.remaining, result.resetTime)
      }

      // Add rate limit headers to successful responses
      const response = await handler(req, ...args)
      
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
      }

      return response
    }
  }
}
