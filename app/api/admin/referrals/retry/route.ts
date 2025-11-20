import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { query, queryOne } from '@/lib/db'
import { distributeReferralEarningsOnChain } from '@/services/referralService'

export async function POST(request: NextRequest) {
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult
  if (!user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await request.json()
  const { packageId, earningId } = body

  if (!packageId && !earningId) {
    return NextResponse.json({ error: 'Missing packageId or earningId' }, { status: 400 })
  }

  try {
    if (earningId) {
      const earning = await queryOne(`SELECT e.*, p.network FROM "Earning" e JOIN "Package" p ON e."packageId" = p.id WHERE e.id = $1`, [earningId])
      if (!earning) return NextResponse.json({ error: 'Earning not found' }, { status: 404 })
      // Enqueue retry job instead of immediate call
      const queueModule = await import('@/lib/queue')
      const queue = queueModule.default || queueModule.referralDistributionQueue
      await queue.add({ packageId: earning.packageId, network: earning.network })
      return NextResponse.json({ success: true, message: 'Retry scheduled for earning' })
    } else {
      // retry the whole package
      const pkg = await queryOne(`SELECT * FROM "Package" WHERE id = $1`, [packageId])
      if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
      const queueModule = await import('@/lib/queue')
      const queue = queueModule.default || queueModule.referralDistributionQueue
      await queue.add({ packageId, network: pkg.network })
      return NextResponse.json({ success: true, message: 'Retry scheduled for package' })
    }
  } catch (err) {
    console.error('[Admin Retry] Error:', err)
    return NextResponse.json({ error: 'Failed to schedule retry' }, { status: 500 })
  }
}

export default { POST }
