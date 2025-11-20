import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { ensureDatabaseConnection } from '@/lib/db-health'
import { hashPassword, getNextReferralCode, generateToken, generateRefreshToken, generateRandomToken } from '@/utils/server-helpers'
import { validateRequest, registerSchema } from '@/middleware/validation'
import { validateReferralCode, validateNoCircularReference } from '@/utils/validation-helpers'
import { authLimiter, referralRegistrationLimiter } from '@/middleware/rateLimiter'
import { sendEmailVerification } from '@/utils/email'
import { handleOptions, handleCors } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  // General auth rate limiting
  const authRateLimitResult = await authLimiter(request)
  if (authRateLimitResult) return authRateLimitResult
  
  // Specific referral registration rate limiting
  const referralRateLimitResult = await referralRegistrationLimiter(request)
  if (referralRateLimitResult) return referralRateLimitResult

  try {
    // Check database connection health before proceeding
    try {
      await ensureDatabaseConnection()
    } catch (dbError) {
      console.error('Database health check failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }
    
    const body = await request.json()
    console.log('Registration request body:', body)

    // Validate request
    const validation = validateRequest(body, registerSchema) as { success: boolean; data?: any; error?: NextResponse }
    if (!validation.success) {
      console.error('Validation failed:', validation.error)
      return validation.error
    }
    
    const { email, password, fullName, referralCode } = validation.data

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT * FROM "User" WHERE email = $1',
      [normalizedEmail]
    )

    if (existingUser) {
      console.log('User already exists:', normalizedEmail)
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    console.log('Email is available:', normalizedEmail)

    // Handle referral code logic
    let referredBy: string | null
    let user: any

    // Check if the referral code is the main user's code (NSCREF1000)
    const isMainReferralCode = referralCode === 'NSCREF1000'
    console.log('Referral code is main user code:', isMainReferralCode)
    
    // For the main referral code, we don't need to validate it against a user
    if (isMainReferralCode) {
      console.log('Using main referral code NSCREF1000')
      const mainReferrer = await queryOne(
        'SELECT "referralCode" FROM "User" WHERE "referralCode" = $1',
        ['NSCREF1000']
      )

      if (mainReferrer) {
        referredBy = 'NSCREF1000'
      } else {
        console.warn('Main referral code NSCREF1000 not found in database. Proceeding without referral linkage.')
        referredBy = null
      }
    } else {
      // Validate the referral code using our helper function
      console.log('Validating referral code:', referralCode)
      const referralValidation = await validateReferralCode(referralCode)
      
      if (!referralValidation.isValid) {
        console.log('Invalid referral code:', referralCode)
        return referralValidation.errorResponse
      }
      
      const referrer = referralValidation.referrer
      
      // Check for circular reference (use normalized email)
      const circularValidation = validateNoCircularReference(referrer.email, normalizedEmail)
      if (!circularValidation.isValid) {
        console.log('Circular reference attempt detected:', normalizedEmail)
        return circularValidation.errorResponse
      }
      
      console.log('Valid referral code found for user:', referrer.email)
      referredBy = referralCode
    }
    
    try {

      // Hash password
      const hashedPassword = await hashPassword(password)
      console.log('Password hashed successfully')

      // Generate unique referral code for this new user (NSCREF format)
      const baseUsername = normalizedEmail
        .split('@')[0]
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase() || 'user'
      let username = baseUsername
      let suffix = 1
      while (await queryOne('SELECT id FROM "User" WHERE username = $1', [username])) {
        username = `${baseUsername}${suffix}`
        suffix += 1
      }
      let newReferralCode: string
      
      try {
        newReferralCode = await getNextReferralCode()
        console.log('Generated new referral code:', newReferralCode)
      } catch (refError) {
        console.error('Error getting next referral code:', refError)
        // Fallback to a timestamp-based code
        newReferralCode = `NSCREF${Date.now().toString().slice(-6)}`
      }
      
      console.log('Generated username:', username, 'referral code:', newReferralCode)

      // Create user with a unique ID
      console.log('Creating user in database...')
      const userId = `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
      const now = new Date()
      
      user = await queryOne(
        `INSERT INTO "User" (
          id, email, password, "fullName", "referralCode", "referredBy",
          username, "createdAt", "updatedAt", "isEmailVerified",
          "twoFactorEnabled", "isActive", "isBlocked", "isAdmin", "kycStatus"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, email, "fullName", username, "referralCode", "isEmailVerified", "createdAt"`,
        [
          userId, normalizedEmail, hashedPassword, fullName, newReferralCode,
          referredBy, username, now, now, false, false, true, false, false, 'PENDING'
        ]
      )
      console.log('User created successfully:', user.id)

      // Skip email verification - using JWT authentication only
      // Users can access system immediately after registration
      
      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email })
      const refreshToken = generateRefreshToken({ userId: user.id })
      console.log('Tokens generated successfully')

      console.log('Registration completed successfully for:', user.email)
      const response = NextResponse.json({
        success: true,
        message: 'Registration successful. You can now access your dashboard.',
        user,
        token,
        refreshToken
      }, { status: 201 })
      
      // Set token in cookies for middleware authentication
      response.cookies.set('token', token, {
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Strict in prod, lax in dev for testing
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Strict in prod, lax in dev for testing
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      return handleCors(response)
      
    } catch (dbError) {
      console.error('Database operation error:', dbError)
      return NextResponse.json(
        { error: 'Registration failed due to a database error. Please try again.' },
        { status: 500 }
      )
    }
    
  } catch (error: any) {
    console.error('Registration error:', error)
    console.error('Error details:', error.message)
    if (error.code) {
      console.error('Error code:', error.code)
    }
    return NextResponse.json(
      { error: error.message || 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}

