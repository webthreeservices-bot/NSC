/**
 * Server-only helper functions
 * These use Node.js modules and should only be imported in API routes
 */

import bcrypt from 'bcrypt'
import jwt, { SignOptions, Secret } from 'jsonwebtoken'
import crypto from 'crypto'
import { JwtPayload } from '@/types/api'
import { queryOne, execute, transaction } from '@/lib/db'

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

/**
 * Compare password
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Partial<JwtPayload>, expiresIn: string = '24h'): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  // Cast secret to Secret to satisfy TypeScript overloads
  const secret: Secret = process.env.JWT_SECRET as Secret || 'fallback-secret'
  // jwt.sign typings are picky about the secret type and options; cast to any
  return jwt.sign(payload as any, secret as any, { expiresIn } as any);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: Partial<JwtPayload>): string {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables')
  }
  const tokenPayload = {
    ...payload,
    type: 'refresh'
  }
  const refreshSecret: Secret = process.env.JWT_REFRESH_SECRET as Secret || 'fallback-refresh-secret'
  return jwt.sign(tokenPayload as any, refreshSecret, { expiresIn: '7d' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decoded === 'string') {
      return null;
    }
    return decoded as JwtPayload;
  } catch (error) {
    return null
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables')
    }
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (typeof decoded === 'string') {
      return null;
    }
    return decoded as JwtPayload;
  } catch (error) {
    return null
  }
}

/**
 * Generate random token
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate unique referral code (DEPRECATED - use getNextReferralCode instead)
 * Kept for backward compatibility
 */
export function generateReferralCode(username: string): string {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  const userPrefix = username.substring(0, 3).toUpperCase()
  return `${userPrefix}${random}`
}

/**
 * Get next sequential referral code (NSCREF1001, NSCREF1002, etc.)
 * This is the code users share with others
 * Uses a transaction to prevent race conditions
 */
export async function getNextReferralCode(): Promise<string> {
  // Use a transaction to ensure atomicity and prevent race conditions
  const result = await transaction(async (client: any) => {
    // First, try to find the existing counter
    let counter = await queryOne<any>(
      `SELECT * FROM "ReferralCounter" WHERE "counterType" = 'NSCREF'`,
      []
    );

    // If counter doesn't exist, create it with initial value
    if (!counter) {
      counter = await queryOne<any>(
        `INSERT INTO "ReferralCounter" ("counterType", "currentValue") 
         VALUES ('NSCREF', 1001) RETURNING *`,
        []
      );
    } else {
      // Increment the counter
      counter = await queryOne<any>(
        `UPDATE "ReferralCounter" SET "currentValue" = "currentValue" + 1 
         WHERE "counterType" = 'NSCREF' RETURNING *`,
        []
      );
    }

    return counter;
  });
  
  // The result is the counter object
  const counter = result;
  
  // Double-check that the code is unique
  const codeToUse = `NSCREF${counter.currentValue}`;
  const existingUser = await queryOne<any>(
    `SELECT * FROM "User" WHERE "referralCode" = $1`,
    [codeToUse]
  );
  
  // In the extremely unlikely case of a collision, add a random suffix
  if (existingUser) {
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `NSCREF${counter.currentValue}_${randomSuffix}`;
  }
  
  return codeToUse;
}

// NEWNCS function has been completely removed as it's no longer needed
// All users must now register with a valid referral code
