import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'

import { queryOne, update } from '@/lib/db-queries'
import { notifyUser, notifyAdmin } from '@/lib/notifications'

/**
 * Admin API: Approve a bot activation after payment
 * POST /api/admin/bots/approve
 * Body: { botActivationId: string }
 * Only admin can access
 */
export async function POST(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { botActivationId } = await request.json()
  if (!botActivationId) {
    return NextResponse.json({ error: 'Missing botActivationId' }, { status: 400 })
  }

  // Fetch bot activation
  const botActivation = await queryOne(
    'SELECT * FROM "BotActivation" WHERE id = $1',
    [botActivationId]
  )
  if (!botActivation) {
    return NextResponse.json({ error: 'Bot activation not found' }, { status: 404 })
  }
  if (botActivation.status !== 'AWAITING_ADMIN_APPROVAL') {
    return NextResponse.json({ error: 'Bot activation is not awaiting admin approval' }, { status: 400 })
  }

  // Mark as active
  await update('BotActivation', {
    where: { id: botActivationId },
    data: {
      status: 'ACTIVE',
      activatedAt: new Date(),
      updatedAt: new Date(),
    },
  })
  // Notify user and admin
  await notifyUser(botActivation.userId, 'Bot Activated', 'Your bot activation has been approved and is now active.', 'SUCCESS')
  await notifyAdmin('Bot Activated', `Bot activation for user ${botActivation.userId} approved.`, 'SUCCESS')
  return NextResponse.json({ success: true })
}
