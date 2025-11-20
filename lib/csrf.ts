import { randomBytes, createHash } from 'crypto'

const CSRF_TOKEN_LENGTH = 32
const CSRF_SECRET = process.env.CSRF_SECRET || 'nsc-csrf-secret-change-in-production'

/**
 * Generate a CSRF token for a user session
 */
export function generateCSRFToken(userId: string): string {
  const timestamp = Date.now()
  const random = randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
  const payload = `${userId}:${timestamp}:${random}`
  
  const hash = createHash('sha256')
    .update(payload + CSRF_SECRET)
    .digest('hex')
  
  const token = Buffer.from(`${payload}:${hash}`).toString('base64')
  return token
}

/**
 * Verify a CSRF token for a user session
 */
export function verifyCSRFToken(token: string, userId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    
    if (parts.length !== 4) return false
    
    const [tokenUserId, timestamp, random, hash] = parts
    
    // Verify user ID matches
    if (tokenUserId !== userId) return false
    
    // Verify token is not older than 1 hour
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 3600000) return false
    
    // Verify hash
    const payload = `${tokenUserId}:${timestamp}:${random}`
    const expectedHash = createHash('sha256')
      .update(payload + CSRF_SECRET)
      .digest('hex')
    
    return hash === expectedHash
  } catch (error) {
    console.error('CSRF token verification failed:', error)
    return false
  }
}

/**
 * Middleware to validate CSRF token from request headers
 */
export function validateCSRFMiddleware(request: Request, userId: string): boolean {
  const csrfToken = request.headers.get('X-CSRF-Token')
  
  if (!csrfToken) {
    return false
  }
  
  return verifyCSRFToken(csrfToken, userId)
}
