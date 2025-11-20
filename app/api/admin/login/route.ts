import { NextRequest, NextResponse } from 'next/server'
import { comparePassword, generateToken, generateRefreshToken } from '@/utils/server-helpers'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { handleOptions, handleCors } from '@/lib/cors'
import { logger } from '@/lib/logger'
import { logAuthEvent } from '@/lib/audit-logger'
import LoginSecurityService from '@/services/loginSecurityService'
import SessionManagementService from '@/services/sessionManagementService'
import { CriticalConnectionManager } from '@/lib/db-health-manager'
import speakeasy from 'speakeasy'

export async function OPTIONS(request: NextRequest) {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, twoFactorCode } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Check for security blocks (same security as regular login)
    const blockingCheck = await CriticalConnectionManager.executeWithConnection(
      () => LoginSecurityService.checkBlocking(normalizedEmail, clientIP),
      'Admin login blocking check'
    )
    
    if (blockingCheck.isBlocked) {
      const minutesRemaining = Math.ceil((blockingCheck.blockUntil!.getTime() - Date.now()) / (60 * 1000))
      
      await logAuthEvent('LOGIN_FAILED', undefined, {
        email: normalizedEmail,
        reason: 'IP/Email blocked',
        ipAddress: clientIP,
        blockedUntil: blockingCheck.blockUntil
      }, request)
      
      return NextResponse.json(
        { 
          error: `Too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
          blockedUntil: blockingCheck.blockUntil
        },
        { status: 429 }
      )
    }

    // Find admin user
    const user = await CriticalConnectionManager.executeWithConnection(
      () => queryOne(
        'SELECT * FROM "User" WHERE "email" = $1 AND "isAdmin" = true',
        [normalizedEmail]
      ),
      'Admin user lookup'
    )

    if (!user) {
      // Record failed login attempt
      await LoginSecurityService.recordAttempt(
        normalizedEmail,
        clientIP,
        userAgent,
        false,
        'Invalid admin credentials'
      )

      await logAuthEvent('LOGIN_FAILED', undefined, {
        email: normalizedEmail,
        reason: 'Invalid admin credentials',
        ipAddress: clientIP
      }, request)

      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      // Record failed login attempt
      await LoginSecurityService.recordAttempt(
        normalizedEmail,
        clientIP,
        userAgent,
        false,
        'Invalid password'
      )

      await logAuthEvent('LOGIN_FAILED', user.id, {
        email: normalizedEmail,
        reason: 'Invalid password',
        ipAddress: clientIP
      }, request)

      return NextResponse.json(
        { error: 'Invalid admin credentials' },
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
        await LoginSecurityService.recordAttempt(
          normalizedEmail,
          clientIP,
          userAgent,
          false,
          'Invalid 2FA code'
        )

        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 401 }
        )
      }
    }

    // Generate session ID and tokens
    const sessionId = SessionManagementService.generateSessionId()
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      isAdmin: true, 
      sessionId 
    })
    const refreshToken = generateRefreshToken({ 
      userId: user.id, 
      sessionId 
    })

    // Create session record
    try {
      const session = await SessionManagementService.createSession(
        user.id,
        token,
        refreshToken,
        clientIP,
        userAgent,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      )
      
      if (session) {
        console.log(`âœ… Admin session created: ${session.sessionId}`)
      }
    } catch (sessionError) {
      logger.error('Failed to create admin session:', sessionError)
      // Continue with login but log the error
    }

    // Record successful login
    await LoginSecurityService.recordAttempt(
      normalizedEmail,
      clientIP,
      userAgent,
      true,
      'Admin login successful'
    )

    await logAuthEvent('LOGIN_SUCCESS', user.id, {
      email: user.email,
      isAdmin: true,
      twoFactorUsed: user.twoFactorEnabled,
      ipAddress: clientIP
    }, request)

    // Return user data
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isAdmin: true,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled
    }

    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
      user: userData,
      token,
      refreshToken
    })

    // Set consistent cookie names (same as regular login)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return handleCors(response)

  } catch (error: any) {
    logger.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
