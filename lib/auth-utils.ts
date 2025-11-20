import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key'

export function generateToken(payload: { userId: string; email: string; isAdmin: boolean }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as jwt.JwtPayload
  } catch (error) {
    return null
  }
}

export function generateTwoFactorSecret() {
  return randomBytes(32).toString('base64')
}

// Re-export existing functions
export * from './auth'