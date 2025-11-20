import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken, requireAdmin } from '@/middleware/auth'


export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const settings = await query(`SELECT * FROM "SystemSetting"`)

    return NextResponse.json({
      success: true,
      settings: settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)
    })

  } catch (error) {
    console.error('Get system settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    // Update or create setting
    const existing = await queryOne(
      `SELECT id FROM "SystemSetting" WHERE key = $1`,
      [key]
    )

    if (existing) {
      await execute(
        `UPDATE "SystemSetting" SET value = $1, "updatedAt" = $2 WHERE key = $3`,
        [value, new Date(), key]
      )
    } else {
      await execute(
        `INSERT INTO "SystemSetting" (id, key, value, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4)`,
        [key, value, new Date(), new Date()]
      )
    }

    // Log admin action
    await execute(
      `INSERT INTO "AdminLog" (id, "adminId", action, description, metadata, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)`,
      [user.id, 'UPDATE_SETTING', `Updated system setting: ${key} = ${value}`, JSON.stringify({ key, value }), new Date()]
    )

    return NextResponse.json({
      success: true,
      message: 'System setting updated successfully'
    })

  } catch (error) {
    console.error('Update system setting error:', error)
    return NextResponse.json(
      { error: 'Failed to update system setting' },
      { status: 500 }
    )
  }
}



