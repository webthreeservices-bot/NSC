/**
 * Payment Scanner Cron Job
 * Periodically scans blockchain for new payments and checks pending confirmations
 */

import cron from 'node-cron'
import {
  scanAllNetworks,
  checkPendingConfirmations,
} from '@/services/blockchainScannerService'
import { expireOldPaymentRequests } from '@/services/paymentGatewayService'

let isScanning = false
let lastScanTime: Date | null = null
let scanCount = 0

/**
 * Main scan function
 */
async function performScan() {
  if (isScanning) {
    console.log('Scan already in progress, skipping...')
    return
  }

  try {
    isScanning = true
    console.log(`[Payment Scanner] Starting scan #${scanCount + 1}...`)

    // Run all tasks in parallel
    const results = await Promise.allSettled([
      scanAllNetworks(),
      checkPendingConfirmations(),
      expireOldPaymentRequests(),
    ])

    // Log results
    results.forEach((result, index) => {
      const taskName = ['scanAllNetworks', 'checkPendingConfirmations', 'expireOldPaymentRequests'][
        index
      ]
      if (result.status === 'fulfilled') {
        console.log(`[Payment Scanner] ${taskName} completed successfully`)
      } else {
        console.error(`[Payment Scanner] ${taskName} failed:`, result.reason)
      }
    })

    lastScanTime = new Date()
    scanCount++

    console.log(
      `[Payment Scanner] Scan #${scanCount} completed at ${lastScanTime.toISOString()}`
    )
  } catch (error) {
    console.error('[Payment Scanner] Error during scan:', error)
  } finally {
    isScanning = false
  }
}

/**
 * Start the payment scanner cron job
 */
export function startPaymentScanner() {
  console.log('[Payment Scanner] Initializing payment scanner cron job...')

  // Scan every 2 minutes for new payments
  // Cron format: */2 * * * * (every 2 minutes)
  const scanJob = cron.schedule('*/2 * * * *', async () => {
    await performScan()
  })

  // Start the job
  scanJob.start()

  console.log('[Payment Scanner] Cron job started - scanning every 2 minutes')

  // Perform initial scan after 10 seconds
  setTimeout(async () => {
    console.log('[Payment Scanner] Performing initial scan...')
    await performScan()
  }, 10000)

  return scanJob
}

/**
 * Get scanner status
 */
export function getScannerStatus() {
  return {
    isScanning,
    lastScanTime,
    scanCount,
    uptime: process.uptime(),
  }
}

/**
 * Manual trigger for scan (for admin use)
 */
export async function triggerManualScan() {
  console.log('[Payment Scanner] Manual scan triggered')
  await performScan()
  return getScannerStatus()
}

export default {
  startPaymentScanner,
  getScannerStatus,
  triggerManualScan,
}
