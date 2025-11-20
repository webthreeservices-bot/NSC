import { NextRequest } from 'next/server'
import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || ''

interface JwtPayload {
  userId: string
  email: string
  isAdmin: boolean
  iat?: number
  exp?: number
}

export async function verifyAdminToken(req: NextRequest): Promise<JwtPayload | null> {
  try {
    // Try to get token from cookie or Authorization header
    let token = req.cookies.get('auth_token')?.value

    if (!token) {
      // Try Authorization header
      const authHeader = req.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return null
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET as Secret) as JwtPayload

    // Check if user is admin
    if (!decoded.isAdmin) {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Error verifying admin token:', error)
    return null
  }
}

export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: string | number = '1d'): string {
  return jwt.sign(payload, JWT_SECRET as Secret, { expiresIn } as SignOptions)
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: string | number = '7d'): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || JWT_SECRET
  return jwt.sign(payload, refreshSecret as Secret, { expiresIn } as SignOptions)
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as Secret) as JwtPayload
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || JWT_SECRET
    return jwt.verify(token, refreshSecret as Secret) as JwtPayload
  } catch (error) {
    console.error('Error verifying refresh token:', error)
    return null
  }
}