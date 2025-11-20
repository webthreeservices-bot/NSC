import referralDistributionQueue from '@/lib/queue'
import { distributeReferralEarningsOnChain } from '@/services/referralService'

referralDistributionQueue.process(async (job) => {
  const { packageId, network } = job.data
  try {
    const result = await distributeReferralEarningsOnChain(packageId, network)
    return { success: result.success, failed: result.failed }
  } catch (err) {
    console.error('[Worker] referral distribution worker error: ', err)
    throw err
  }
})

referralDistributionQueue.on('failed', (job, err) => {
  console.error('[Worker] Job failed', job.id, err)
})

referralDistributionQueue.on('completed', (job, result) => {
  console.log(`[Worker] Job ${job.id} completed`, result)
})

export default referralDistributionQueue
