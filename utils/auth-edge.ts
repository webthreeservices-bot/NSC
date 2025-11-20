import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { JwtPayload } from '@/types/api'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret'
)

/**
 * Edge-compatible JWT token verification
 */
export async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      isAdmin: Boolean(payload.isAdmin),
      sessionId: payload.sessionId ? String(payload.sessionId) : undefined,
      iat: payload.iat as number,
      exp: payload.exp as number
    } as JwtPayload
  } catch {
    return null
  }
}

/**
 * Edge-compatible admin access verification
 */
export async function verifyAdminAccessEdge(request: NextRequest): Promise<JwtPayload | null> {
  // Try to get token from cookie or Authorization header
  let token = request.cookies.get('token')?.value

  if (!token) {
    // Try Authorization header
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    return null
  }

  const payload = await verifyTokenEdge(token)
  if (!payload || !payload.isAdmin) {
    return null
  }

  // Note: In edge runtime, we can't easily validate sessions against database
  // Session validation will be handled in API routes with full Node.js runtime

  return payload
}