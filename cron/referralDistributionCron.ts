import cron from 'node-cron'
import { query } from '@/lib/db'
import { distributeReferralEarningsOnChain } from '@/services/referralService'

const SCHEDULE = '*/5 * * * *' // every 5 minutes
let isProcessing = false

export function startReferralDistributionCron() {
  console.log('[Referral Cron] Initializing referral distribution cron...')

  const job = cron.schedule(SCHEDULE, async () => {
    if (isProcessing) return
    isProcessing = true
    try {
      // find packageIds with earnings present but not yet on-chain delivered
      const { rows } = await query(
        `SELECT DISTINCT e."packageId", p.network FROM "Earning" e JOIN "Transaction" t ON e."transactionId" = t.id JOIN "Package" p ON e."packageId" = p.id WHERE e.status IN ('PAID', 'PENDING') AND (t."txHash" IS NULL OR t."txHash" = '')`)

      for (const r of rows) {
        try {
          console.log(`[Referral Cron] Queueing distribution job for package ${r.packageId} (network: ${r.network})`)
          const queueModule = await import('@/lib/queue')
          const queue = queueModule.default || queueModule.referralDistributionQueue
          await queue.add({ packageId: r.packageId, network: r.network })
        } catch (err) {
          console.error('[Referral Cron] Failed to distribute for package', r.packageId, err)
        }
      }
    } finally {
      isProcessing = false
    }
  })

  job.start()
  console.log('[Referral Cron] Started - runs every 5 minutes')
  return job
}

export default {
  startReferralDistributionCron,
}
