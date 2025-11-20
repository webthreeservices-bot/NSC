import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (for development)
// In production, use Redis-based rate limiting

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

/**
 * Rate limiter middleware
 */
export function rateLimit(options: {
  windowMs: number
  max: number
  message?: string
  keyGenerator?: (request: NextRequest) => string | Promise<string>
}) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Use custom key generator if provided, otherwise use IP + path
    let key: string
    if (options.keyGenerator) {
      const keyResult = options.keyGenerator(request)
      // Handle both synchronous and asynchronous key generators
      key = keyResult instanceof Promise ? await keyResult : keyResult
    } else {
      key = `${ip}:${request.nextUrl.pathname}`
    }
    
    const now = Date.now()
    const record = store[key]
    
    if (!record || now > record.resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      }
      return null
    }
    
    if (record.count >= options.max) {
      return NextResponse.json(
        { error: options.message || 'Too many requests, please try again later' },
        { status: 429 }
      )
    }
    
    record.count++
    return null
  }
}

// Predefined rate limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
})

export const withdrawalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 withdrawals per hour
  message: 'Too many withdrawal requests, please try again later'
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later'
})

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many admin requests, please slow down',
  keyGenerator: async (request: NextRequest) => {
    // Rate limit by user ID if available in headers/auth
    const userId = request.headers.get('x-user-id') || 'unknown'
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    return `admin:${userId}:${ip}`
  }
})

// Special rate limiter for referral registrations
// This limits both by IP address and by referral code to prevent abuse
export const referralRegistrationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 registrations per referral code per day
  message: 'Too many registrations with this referral code. Please try again later or contact support.',
  keyGenerator: async (request: NextRequest) => {
    // Get the IP address for fallback
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const path = request.nextUrl.pathname
    
    // For registration endpoint, try to extract referral code from URL search params first
    if (path.includes('/api/auth/register')) {
      // For GET requests (like when checking if a referral code is valid)
      const url = new URL(request.url)
      const refFromUrl = url.searchParams.get('ref')
      if (refFromUrl) {
        return `${refFromUrl}:${path}`
      }
      
      // For POST requests with JSON body
      if (request.body) {
        try {
          const referralCode = await extractReferralCodeFromBody(request)
          if (referralCode) {
            return `${referralCode}:${path}`
          }
        } catch (e) {
          console.error('Error extracting referral code:', e)
        }
      }
    }
    
    // Default to IP-based rate limiting if we can't get the referral code
    return `${ip}:${path}`
  }
})

// Helper function to extract referral code from request body
async function extractReferralCodeFromBody(request: NextRequest): Promise<string> {
  try {
    // Clone the request to avoid consuming the body
    const clonedRequest = request.clone()
    // Try to parse the body as JSON
    const body = await clonedRequest.json()
    return body?.referralCode || ''
  } catch {
    return ''
  }
}
