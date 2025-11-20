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
    const { block, reason } = body

    // Update user status
    await execute(
      `UPDATE "User" SET "isBlocked" = $1, "isActive" = $2, "updatedAt" = $3 WHERE id = $4`,
      [block, !block, new Date(), userId]
    )

    // Log admin action
    await execute(
      `INSERT INTO "AdminLog" (id, "adminId", action, description, metadata, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)`,
      [user.userId, block ? 'BLOCK_USER' : 'UNBLOCK_USER', `${block ? 'Blocked' : 'Unblocked'} user ${userId}${reason ? ` - Reason: ${reason}` : ''}`, JSON.stringify({ userId, reason }), new Date()]
    )

    return NextResponse.json({
      success: true,
      message: `User ${block ? 'blocked' : 'unblocked'} successfully`
    })

  } catch (error) {
    console.error('Block user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}
