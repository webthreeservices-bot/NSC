import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute, toCamelCase } from '@/lib/db'
import { comparePassword, generateToken, generateRefreshToken } from '@/utils/server-helpers'
import { validateRequest, loginSchema } from '@/middleware/validation'
import { authLimiter } from '@/middleware/rateLimiter'
import speakeasy from 'speakeasy'
import { handleOptions, handleCors } from '@/lib/cors'
import { logger } from '@/lib/logger'
import { logAuthEvent, logSecurityEvent } from '@/lib/audit-logger'
import LoginSecurityService from '@/services/loginSecurityService'
import SessionManagementService from '@/services/sessionManagementService'

// Account lockout configuration
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 30

export async function OPTIONS(request: NextRequest) {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  // Rate limiting FIRST - before reading body
  const rateLimitResult = await authLimiter(request)
  if (rateLimitResult) return rateLimitResult

  let body: any = null

  try {
    // Parse body after rate limiting
    body = await request.json()
  } catch (parseError) {
    logger.error('Body parsing error:', parseError)
    return NextResponse.json(
      { error: 'Invalid request body. Please check your input and try again.' },
      { status: 400 }
    )
  }

  try {
    
    // Validate request
    const validation = validateRequest(body, loginSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data. Please check your email and password.' },
        { status: 400 }
      )
    }
    
    const { email, password, twoFactorCode } = validation.data

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase()
    
    // Get client information for security tracking
    const clientIP = LoginSecurityService.getClientIP(request)
    const userAgent = LoginSecurityService.getUserAgent(request)
    
    // Check for brute-force attempts BEFORE database queries
    const blockingCheck = await LoginSecurityService.checkBlocking(normalizedEmail, clientIP)
    
    if (blockingCheck.isBlocked) {
      // Record the blocked attempt
      await LoginSecurityService.recordAttempt(
        normalizedEmail,
        clientIP,
        userAgent,
        false,
        `Blocked: ${blockingCheck.blockReason}`
      )
      
      const minutesRemaining = blockingCheck.blockUntil 
        ? Math.ceil((blockingCheck.blockUntil.getTime() - Date.now()) / (1000 * 60))
        : 15
      
      await logSecurityEvent('BRUTE_FORCE_BLOCKED', undefined, {
        email: normalizedEmail,
        ipAddress: clientIP,
        failedAttempts: blockingCheck.failedAttempts,
        blockReason: blockingCheck.blockReason
      }, 'HIGH')
      
      return NextResponse.json(
        { 
          error: `Too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
          blockedUntil: blockingCheck.blockUntil
        },
        { status: 429 } // 429 Too Many Requests
      )
    }

    // Find user with retry logic for database issues
    let user: any = null
    let retryCount = 3
    let lastError: any = null

    while (retryCount > 0 && !user) {
      try {
        user = await queryOne<any>(
          'SELECT * FROM "User" WHERE "email" = $1',
          [normalizedEmail]
        )
        if (user) user = toCamelCase(user)
        break // Success, exit retry loop
      } catch (dbError: any) {
        lastError = dbError
        retryCount--
        logger.error(`Database query failed (${3 - retryCount}/3):`, dbError)
        
        if (retryCount > 0) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, (4 - retryCount) * 1000))
        }
      }
    }

    if (!user && lastError) {
      logger.error('Database connection failed after retries:', lastError)
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }

    if (!user) {
      // Record failed login attempt (invalid email)
      await LoginSecurityService.recordAttempt(
        normalizedEmail,
        clientIP,
        userAgent,
        false,
        'Invalid email'
      )
      
      await logAuthEvent('LOGIN_FAILED', undefined, { 
        email: normalizedEmail, 
        reason: 'Invalid email',
        ipAddress: clientIP
      }, request)
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if account is locked due to failed attempts
    const now = new Date()
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > now) {
      const minutesRemaining = Math.ceil(
        (new Date(user.accountLockedUntil).getTime() - now.getTime()) / (1000 * 60)
      )
      
      await logSecurityEvent('ACCOUNT_LOCKED', user.id, {
        email: normalizedEmail,
        lockedUntil: user.accountLockedUntil,
        failedAttempts: user.failedLoginAttempts
      }, 'HIGH')
      
      return NextResponse.json(
        { 
          error: `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
          lockedUntil: user.accountLockedUntil
        },
        { status: 423 } // 423 Locked
      )
    }

    // Check if user is blocked (permanent block by admin)
    if (user.isBlocked) {
      await logSecurityEvent('ACCOUNT_LOCKED', user.id, {
        email: normalizedEmail,
        reason: 'Account blocked by admin'
      }, 'CRITICAL')
      
      return NextResponse.json(
        { error: 'Your account has been blocked. Please contact support.' },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      // Record failed login attempt (invalid password)
      await LoginSecurityService.recordAttempt(
        normalizedEmail,
        clientIP,
        userAgent,
        false,
        'Invalid password'
      )
      
      // Increment failed login attempts in user record (legacy support)
      const failedAttempts = (user.failedLoginAttempts || 0) + 1
      const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS
      
      const updateData: any = {
        failedLoginAttempts: failedAttempts,
        lastFailedLoginAt: now
      }
      
      if (shouldLock) {
        const lockoutUntil = new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
        updateData.accountLockedUntil = lockoutUntil
        
        await logSecurityEvent('ACCOUNT_LOCKED', user.id, {
          email: normalizedEmail,
          failedAttempts,
          lockedUntil: lockoutUntil,
          ipAddress: clientIP
        }, 'HIGH')
      }
      
      // FIX #3: Use separate prepared statements instead of dynamic SQL to prevent injection
      try {
        if (shouldLock) {
          await execute(
            `UPDATE "User" SET "failedLoginAttempts" = $1, "lastFailedLoginAt" = $2, "accountLockedUntil" = $3 WHERE "id" = $4`,
            [failedAttempts, now, updateData.accountLockedUntil, user.id]
          )
        } else {
          await execute(
            `UPDATE "User" SET "failedLoginAttempts" = $1, "lastFailedLoginAt" = $2 WHERE "id" = $3`,
            [failedAttempts, now, user.id]
          )
        }
      } catch (updateError) {
        logger.error('Failed to update failed login attempts:', updateError)
      }
      
      await logAuthEvent('LOGIN_FAILED', user.id, {
        email: normalizedEmail,
        reason: 'Invalid password',
        failedAttempts,
        accountLocked: shouldLock,
        ipAddress: clientIP
      }, request)
      
      if (shouldLock) {
        return NextResponse.json(
          { 
            error: `Too many failed login attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
            lockedUntil: updateData.accountLockedUntil
          },
          { status: 423 } // 423 Locked
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          remainingAttempts: MAX_FAILED_ATTEMPTS - failedAttempts
        },
        { status: 401 }
      )
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorCode) {
        return NextResponse.json(
          { error: '2FA code required', requires2FA: true },
          { status: 401 }
        )
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      })

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 401 }
        )
      }
    }

    // Update last login and reset failed attempts on successful login
    try {
      await execute(
        'UPDATE "User" SET "lastLogin" = $1, "failedLoginAttempts" = 0, "accountLockedUntil" = NULL, "lastFailedLoginAt" = NULL WHERE "id" = $2',
        [new Date(), user.id]
      )
    } catch (updateError) {
      // Log but don't fail the login if update fails
      logger.error('Failed to update last login:', updateError)
    }

    // Record successful login attempt
    await LoginSecurityService.recordAttempt(
      normalizedEmail,
      clientIP,
      userAgent,
      true,
      '2FA enabled: ' + user.twoFactorEnabled
    )

    // Log successful login
    await logAuthEvent('LOGIN_SUCCESS', user.id, {
      email: user.email,
      twoFactorUsed: user.twoFactorEnabled,
      ipAddress: clientIP
    }, request)

    // Generate session ID
    const sessionId = SessionManagementService.generateSessionId()
    
    // Generate tokens with session ID
    const token = generateToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin, sessionId })
    const refreshToken = generateRefreshToken({ userId: user.id, sessionId })

    // Create session record with token hashes
    try {
      const session = await SessionManagementService.createSession(
        user.id,
        token, // Use the actual JWT token as the token hash
        refreshToken, // Use the actual refresh token as the refresh token hash
        clientIP,
        userAgent,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      )
      
      if (session) {
        console.log(`✅ Session created successfully: ${session.sessionId}`)
      } else {
        console.log('⚠️ Session creation returned null but continuing with login')
      }
    } catch (sessionError) {
      logger.error('Failed to create session:', sessionError)
      // Don't fail the login if session creation fails
      console.log('⚠️ Session creation failed but continuing with login')
    }

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      referralCode: user.referralCode,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      isAdmin: user.isAdmin,
      kycStatus: user.kycStatus
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token,
      refreshToken
    })
    
    // Set token in cookies for middleware authentication
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Use lax for better mobile compatibility
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Use lax for better mobile compatibility
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return handleCors(response)

  } catch (error: any) {
    logger.error('Login error:', error)
    
    // Provide user-friendly error messages
    let errorMessage = 'Login failed. Please try again.'
    
    if (error.message) {
      // Check for specific error types
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Connection timeout. Please check your internet and try again.'
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        errorMessage = 'Service temporarily unavailable. Please try again in a moment.'
      } else if (error.message.includes('JSON') || error.message.includes('parse')) {
        errorMessage = 'Invalid request format. Please try again.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
