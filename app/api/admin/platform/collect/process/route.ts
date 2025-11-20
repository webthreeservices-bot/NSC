import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { query } from '@/lib/db'
import { sendUsdt } from '@/lib/blockchain'

export async function POST(request: NextRequest) {
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult
  if (!user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  // find PLATFORM_COLLECT pending transactions
  const { rows } = await query(
    `SELECT * FROM "Transaction" WHERE type = $1 AND status = $2`,
    ['PLATFORM_COLLECT', 'PENDING']
  )

  if (rows.length === 0) {
    return NextResponse.json({ success: true, message: 'No pending platform collects' })
  }

  const success: any[] = []
  const failed: any[] = []
  for (const tx of rows) {
    try {
      const platformWallet = tx.network === 'BEP20' ? process.env.PLATFORM_WALLET_BSC : process.env.PLATFORM_WALLET_TRON
      if (!platformWallet) throw new Error('Missing platform wallet for network')

      // attempt to send usdt to platform (owner wallet receives, tx stored as same transaction row)
      const txHash = await sendUsdt(platformWallet, Number(tx.amount), tx.network)
      // mark transaction as completed
      await query(`UPDATE "Transaction" SET status = $1, "txHash" = $2, "updatedAt" = $3 WHERE id = $4`, ['COMPLETED', txHash, new Date(), tx.id])
      success.push({ id: tx.id, txHash })
    } catch (err) {
      console.error('[Platform Collect] Failed to process transaction', tx.id, err)
      failed.push({ id: tx.id, error: err.message })
      await query(`UPDATE "Transaction" SET status = $1, "updatedAt" = $2 WHERE id = $3`, ['FAILED', new Date(), tx.id])
    }
  }

  return NextResponse.json({ success, failed })
}

export default { POST }
