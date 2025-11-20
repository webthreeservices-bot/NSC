import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { authenticateToken, requireAdmin } from '@/middleware/auth'


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const { id: userId } = await params
    const body = await request.json()
    const { status, reason } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid KYC status' },
        { status: 400 }
      )
    }

    // Update KYC status
    await execute(
      `UPDATE "User" SET "kycStatus" = $1, "updatedAt" = $2 WHERE id = $3`,
      [status, new Date(), userId]
    )

    // Log admin action
    await execute(
      `INSERT INTO "AdminLog" (id, "adminId", action, description, metadata, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)`,
      [user.userId, 'UPDATE_KYC', `${status} KYC for user ${userId}${reason ? ` - Reason: ${reason}` : ''}`, JSON.stringify({ userId, status, reason }), new Date()]
    )

    return NextResponse.json({
      success: true,
      message: `KYC ${status.toLowerCase()} successfully`
    })

  } catch (error) {
    console.error('Update KYC error:', error)
    return NextResponse.json(
      { error: 'Failed to update KYC status' },
      { status: 500 }
    )
  }
}
