import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { findMany } from '@/lib/db-queries'

export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Get all bot activations awaiting admin approval
  const bots = await findMany('BotActivation', {
    where: { status: 'AWAITING_ADMIN_APPROVAL' },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ bots })
}
