import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db-helpers'
import { authenticateToken, requireAdmin } from '@/middleware/auth'

/**
 * GET /api/admin/roi-settings
 * Get all ROI settings
 */
export async function GET(req: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(req)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    // Fetch ROI settings directly with SQL
    const settings = await sql`
      SELECT * FROM "RoiSettings"
      WHERE "isActive" = true
      ORDER BY "packageAmount" ASC
    `

    return NextResponse.json({
      status: 'success',
      data: settings
    })
  } catch (error) {
    console.error('Error fetching ROI settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ROI settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/roi-settings
 * Update ROI settings for a specific package amount
 */
export async function PUT(req: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(req)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = await req.json()
    const { packageAmount, roiPercentage } = body

    // Validation
    if (!packageAmount || roiPercentage === undefined) {
      return NextResponse.json(
        { error: 'Package amount and ROI percentage are required' },
        { status: 400 }
      )
    }

    // Validate package amount
    const validAmounts = [500, 1000, 3000, 5000, 10000, 25000, 50000]
    if (!validAmounts.includes(packageAmount)) {
      return NextResponse.json(
        { error: 'Invalid package amount' },
        { status: 400 }
      )
    }

    // Validate ROI percentage
    if (roiPercentage < 0 || roiPercentage > 100) {
      return NextResponse.json(
        { error: 'ROI percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Get the existing setting to check max allowed
    const existingSettings = await sql`
      SELECT * FROM "RoiSettings"
      WHERE "packageAmount" = ${packageAmount}
      LIMIT 1
    `

    if (existingSettings.length === 0) {
      return NextResponse.json(
        { error: 'ROI setting not found for this package amount' },
        { status: 404 }
      )
    }

    const existingSetting = existingSettings[0]

    // Check if new percentage exceeds maximum
    if (roiPercentage > existingSetting.maxRoiPercentage) {
      return NextResponse.json(
        {
          error: `ROI percentage cannot exceed ${existingSetting.maxRoiPercentage}% for this package`,
          maxAllowed: existingSetting.maxRoiPercentage
        },
        { status: 400 }
      )
    }

    // Update the ROI setting
    const updatedSettings = await sql`
      UPDATE "RoiSettings"
      SET "roiPercentage" = ${roiPercentage},
          "updatedAt" = NOW()
      WHERE "packageAmount" = ${packageAmount}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: 'ROI setting updated successfully',
      data: updatedSettings[0]
    })
  } catch (error) {
    console.error('Error updating ROI setting:', error)
    return NextResponse.json(
      { error: 'Failed to update ROI setting' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/roi-settings/batch
 * Update multiple ROI settings at once
 */
export async function PATCH(req: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(req)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = await req.json()
    const { settings } = body

    if (!Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { error: 'Settings array is required' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (const setting of settings) {
      try {
        const { packageAmount, roiPercentage } = setting

        // Get existing setting to check max
        const existingSettings = await sql`
          SELECT * FROM "RoiSettings"
          WHERE "packageAmount" = ${packageAmount}
          LIMIT 1
        `

        if (existingSettings.length === 0) {
          errors.push({
            packageAmount,
            error: 'ROI setting not found'
          })
          continue
        }

        const existingSetting = existingSettings[0]

        // Check if exceeds maximum
        if (roiPercentage > existingSetting.maxRoiPercentage) {
          errors.push({
            packageAmount,
            error: `ROI percentage cannot exceed ${existingSetting.maxRoiPercentage}%`
          })
          continue
        }

        // Update the setting
        const updatedSettings = await sql`
          UPDATE "RoiSettings"
          SET "roiPercentage" = ${roiPercentage},
              "updatedAt" = NOW()
          WHERE "packageAmount" = ${packageAmount}
          RETURNING *
        `

        results.push(updatedSettings[0])
      } catch (error) {
        errors.push({
          packageAmount: setting.packageAmount,
          error: 'Failed to update'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.length} ROI settings`,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error batch updating ROI settings:', error)
    return NextResponse.json(
      { error: 'Failed to update ROI settings' },
      { status: 500 }
    )
  }
}
