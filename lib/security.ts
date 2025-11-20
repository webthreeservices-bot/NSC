import { NextResponse } from 'next/server'

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.trongrid.io https://bsc-dataseed.binance.org wss:",
    "frame-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')

  // Security headers
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export function validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*')
}

export function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function isValidWalletAddress(address: string, network: 'BSC' | 'TRON'): boolean {
  if (network === 'BSC') {
    // Ethereum/BSC address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  } else if (network === 'TRON') {
    // TRON address validation
    return /^T[A-Za-z1-9]{33}$/.test(address)
  }
  return false
}

export function maskSensitiveData(data: any): any {
  const sensitiveFields = [
    'password',
    'privateKey',
    'secret',
    'token',
    'key',
    'hash',
    'signature'
  ]

  if (typeof data === 'string') {
    return '***'
  }

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item))
  }

  if (typeof data === 'object' && data !== null) {
    const masked: any = {}
    Object.keys(data).forEach(key => {
      const lowerKey = key.toLowerCase()
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field))
      
      if (isSensitive) {
        masked[key] = '***'
      } else {
        masked[key] = maskSensitiveData(data[key])
      }
    })
    return masked
  }

  return data
}

// Rate limiting by IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  ip: string, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const key = `rate_limit:${ip}`
  
  const current = rateLimitMap.get(key)
  
  if (!current || current.resetTime < now) {
    // First request or window expired
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  current.count++
  
  if (current.count > maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  
  return { allowed: true, remaining: maxRequests - current.count }
}

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now()
  rateLimitMap.forEach((value, key) => {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  })
}, 60000) // Clean up every minute
