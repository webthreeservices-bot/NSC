import pool from '@/lib/db-connection'
import { NextResponse } from 'next/server'

/**
 * Validates if a referral code exists in the database
 * @param referralCode The referral code to validate
 * @returns Object with validation result and error response if invalid
 */
export async function validateReferralCode(referralCode: string): Promise<{ 
  isValid: boolean; 
  errorResponse?: NextResponse;
  referrer?: any;
}> {
  if (!referralCode || referralCode.trim() === '') {
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        { error: 'Referral code is required for registration' },
        { status: 400 }
      )
    }
  }

  // Special case for the main user's referral code
  if (referralCode === 'NSCREF1000') {
    // For the main referral code, we always consider it valid
    // This allows anyone to register using the main referral code
    // even if the main user hasn't been created yet
    return {
      isValid: true,
      referrer: {
        email: 'olly@gmail.com', // Main user's email
        referralCode: 'NSCREF1000'
      }
    }
  }

  // Check if the referral code exists using direct SQL query
  const query = `
    SELECT * FROM "User" WHERE "referralCode" = $1 LIMIT 1
  `;
  
  const { rows } = await pool.query(query, [referralCode]);
  const referrer = rows[0] || null;

  if (!referrer) {
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      )
    }
  }

  return {
    isValid: true,
    referrer
  }
}

/**
 * Checks if a user is trying to use their own referral code (circular reference)
 * @param referrerEmail The email of the referrer
 * @param userEmail The email of the user being registered
 * @returns Object with validation result and error response if invalid
 */
export function validateNoCircularReference(referrerEmail: string, userEmail: string): {
  isValid: boolean;
  errorResponse?: NextResponse;
} {
  if (referrerEmail === userEmail) {
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        { error: 'You cannot use your own referral code' },
        { status: 400 }
      )
    }
  }

  return {
    isValid: true
  }
}
