import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import pool from '@/lib/db-connection'

// Force dynamic rendering - this route cannot be static
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Get user from token
async function getUserFromToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const jwt = require('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET
    
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not configured')
      return null
    }
    
    const payload = jwt.verify(token, JWT_SECRET)
    return payload.userId
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// GET endpoint - Fetch KYC status
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Fetch user's KYC status with retry logic
    let user: any = null
    let retryCount = 3
    let lastError: any = null

    while (retryCount > 0 && !user) {
      try {
        user = await queryOne(
          `SELECT id, email, "fullName", "kycStatus", "kycDocument", "createdAt" FROM "User" WHERE id = $1`,
          [userId]
        )
        break
      } catch (dbError: any) {
        lastError = dbError
        retryCount--
        console.error(`Database query failed (${3 - retryCount}/3):`, dbError)
        
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, (4 - retryCount) * 1000))
        }
      }
    }

    if (!user && lastError) {
      console.error('Database connection failed after retries:', lastError)
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      kycStatus: user.kycStatus,
      kycDocument: user.kycDocument,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    })

  } catch (error: any) {
    console.error('Error fetching KYC status:', error)
    
    let errorMessage = 'Failed to fetch KYC status'
    if (error.message?.includes('timeout')) {
      errorMessage = 'Request timeout. Please try again.'
    } else if (error.message?.includes('connect')) {
      errorMessage = 'Service temporarily unavailable'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// PUT endpoint - Update KYC status (admin only)
export async function PUT(request: NextRequest) {
  let body: any = null

  try {
    body = await request.json()
  } catch (parseError) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  try {
    // Get user from token
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminUser = await queryOne(
      `SELECT "isAdmin" FROM "User" WHERE id = $1`,
      [userId]
    )

    if (!adminUser?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      )
    }

    const { targetUserId, kycStatus, reason } = body

    if (!targetUserId || !kycStatus) {
      return NextResponse.json(
        { error: 'Missing required fields: targetUserId, kycStatus' },
        { status: 400 }
      )
    }

    // Validate KYC status
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(kycStatus)) {
      return NextResponse.json(
        { error: 'Invalid KYC status. Must be PENDING, APPROVED, or REJECTED' },
        { status: 400 }
      )
    }

    // Update user's KYC status
    const updatedUser = await queryOne(
      `UPDATE "User"
       SET "kycStatus" = $1, "updatedAt" = $2
       WHERE id = $3
       RETURNING id, email, "fullName", "kycStatus"`,
      [kycStatus, new Date(), targetUserId]
    )

    // Log admin action
    try {
      await pool.query(
        `INSERT INTO "AdminLog" 
         ("id", "adminId", "action", "targetType", "targetId", "details", "ipAddress", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          `adminlog_${Date.now()}`,
          userId,
          'KYC_STATUS_UPDATE',
          'USER',
          targetUserId,
          JSON.stringify({ newStatus: kycStatus, reason }),
          request.headers.get('x-forwarded-for') || 'unknown'
        ]
      )
    } catch (logError) {
      console.error('Failed to log admin action:', logError)
    }

    return NextResponse.json({
      success: true,
      message: 'KYC status updated successfully',
      user: updatedUser
    })

  } catch (error: any) {
    console.error('Error updating KYC status:', error)
    return NextResponse.json(
      { error: 'Failed to update KYC status' },
      { status: 500 }
    )
  }
}

