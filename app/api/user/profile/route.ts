import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'
import { ALLOWED_USER_FIELDS, validateSelect } from '@/lib/query-validator'
import { updateProfileSchema, validateRequest } from '@/lib/validation-schemas'


export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    // Validate select fields (if provided in query params)
    const { searchParams } = new URL(request.url)
    const selectParam = searchParams.get('select')
    let selectFields: any = undefined
    
    if (selectParam) {
      try {
        const parsedSelect = JSON.parse(selectParam)
        selectFields = validateSelect(parsedSelect, ALLOWED_USER_FIELDS)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid select parameter' },
          { status: 400 }
        )
      }
    }

    // Get user profile with stats
    const profile = await queryOne(
      `SELECT id, email, username, "fullName", phone, "referralCode", "referredBy",
              "bep20Address", "trc20Address", "isEmailVerified", "twoFactorEnabled",
              "kycStatus", "isActive", "createdAt", "lastLogin"
       FROM "User" WHERE id = $1`,
      [user.userId]
    )

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user stats
    const [totalInvestedResult, totalEarningsResult, activePackagesResult, totalReferralsResult] = await Promise.all([
      // Total invested (only count ACTIVE packages with confirmed payments)
      queryOne(
        `SELECT COALESCE(SUM(amount), 0) as total FROM "Package" WHERE "userId" = $1 AND status = $2`,
        [user.userId, 'ACTIVE']
      ),
      // Total earnings
      queryOne(
        `SELECT COALESCE(SUM(amount), 0) as total FROM "Earning" WHERE "userId" = $1`,
        [user.userId]
      ),
      // Active packages count
      queryOne(
        `SELECT COUNT(*)::int as count FROM "Package" WHERE "userId" = $1 AND status = $2`,
        [user.userId, 'ACTIVE']
      ),
      // Total referrals
      queryOne(
        `SELECT COUNT(*)::int as count FROM "User" WHERE "referredBy" = $1`,
        [profile.referralCode]
      )
    ])

    const stats = {
      totalInvested: Number(totalInvestedResult.total || 0),
      totalEarnings: Number(totalEarningsResult.total || 0),
      activePackages: activePackagesResult.count || 0,
      totalReferrals: totalReferralsResult.count || 0
    }

    // Serialize dates properly - handle both Date objects and strings
    const toISOString = (date: any) => {
      if (!date) return null
      if (date instanceof Date) {
        return isNaN(date.getTime()) ? null : date.toISOString()
      }
      if (typeof date === 'string') {
        const parsed = new Date(date)
        return isNaN(parsed.getTime()) ? null : parsed.toISOString()
      }
      return null
    }

    const serializedProfile = {
      ...profile,
      createdAt: toISOString(profile.createdAt),
      lastLogin: toISOString(profile.lastLogin)
    }

    return NextResponse.json({
      success: true,
      user: serializedProfile,
      stats
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  try {
    // Validate request body
    const validation = await validateRequest(request, updateProfileSchema)

    if (!validation.success) {
      console.log('Validation error:', validation.error)
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: validation.error,
          details: validation.error
        },
        { status: 400 }
      )
    }

    const { fullName, phone, bep20Address, trc20Address } = validation.data

    // Build dynamic UPDATE query
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (fullName && fullName.trim() !== '') {
      updates.push(`"fullName" = $${paramIndex++}`)
      values.push(fullName.trim())
    }
    if (phone && phone.trim() !== '') {
      updates.push(`phone = $${paramIndex++}`)
      values.push(phone.trim())
    }
    if (bep20Address !== undefined) {
      const cleanAddress = bep20Address === '' ? null : bep20Address
      updates.push(`"bep20Address" = $${paramIndex++}`)
      values.push(cleanAddress)
    }
    if (trc20Address !== undefined) {
      const cleanAddress = trc20Address === '' ? null : trc20Address
      updates.push(`"trc20Address" = $${paramIndex++}`)
      values.push(cleanAddress)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid fields to update',
          message: 'Please provide at least one field to update'
        },
        { status: 400 }
      )
    }

    updates.push(`"updatedAt" = $${paramIndex++}`)
    values.push(new Date())

    values.push(user.userId)

    // Update user profile
    const updatedUser = await queryOne(
      `UPDATE "User"
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, username, "fullName", phone, "bep20Address", "trc20Address"`,
      values
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error: any) {
    console.error('Update profile error:', error)

    // Provide more specific error messages
    let errorMessage = 'Failed to update profile'
    if (error.message) {
      if (error.message.includes('violates')) {
        errorMessage = 'Invalid data format. Please check your input.'
      } else if (error.message.includes('duplicate')) {
        errorMessage = 'This information is already in use.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: errorMessage,
        details: error.message
      },
      { status: 500 }
    )
  }
}

