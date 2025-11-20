import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose' // jose is edge-compatible

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret'
)

/**
 * Verify JWT token in Edge Runtime
 */
export async function verifyTokenEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

/**
 * Verify admin access in Edge Runtime
 */
export async function verifyAdminAccessEdge(request: NextRequest) {
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
    return null
  }

  const payload = await verifyTokenEdge(token)
  if (!payload || !payload.isAdmin) {
    return null
  }

  return payload
}