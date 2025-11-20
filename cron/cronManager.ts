/**
 * Cron Job Manager
 * Centralized management of all cron jobs
 */

import { startPaymentScanner, getScannerStatus } from './paymentScanner'
import { startRoiPayoutCron, getRoiCronStatus } from './roiPayoutCron'
import referralDistributionCron from './referralDistributionCron'
// Ensure worker process is initialized
import '../queue/workers/referralDistributionWorker'
import { startExpirationCron, getExpirationCronStatus } from './expirationCron'
import { initializePaymentScanner, stopPaymentScanner } from './paymentScannerCron'
import syncBlockchainData from './blockchainSyncCron'
import { SessionManagementCron } from './sessionManagementCron'

interface CronJobStatus {
  name: string
  description: string
  schedule: string
  isRunning: boolean
  lastRunTime: Date | null
  stats?: any
}

let allCronJobs: any = {}
let isInitialized = false

/**
 * Start all cron jobs
 */
export function startAllCronJobs() {
  if (isInitialized) {
    console.log('[Cron Manager] Cron jobs already initialized')
    return
  }

  console.log('[Cron Manager] Starting all cron jobs...')

  try {
    // 1. Payment Scanner (Every 2 minutes)
    console.log('[Cron Manager] Starting Payment Scanner...')
    initializePaymentScanner()

    // 2. Blockchain Payment Scanner (Every 2 minutes - legacy)
    console.log('[Cron Manager] Starting Legacy Payment Scanner...')
    allCronJobs.paymentScanner = startPaymentScanner()

    // 3. ROI Payout (Daily at midnight)
    console.log('[Cron Manager] Starting ROI Payout Cron...')
    allCronJobs.roiPayout = startRoiPayoutCron()

    // 4. Expiration Checker (Daily at 1 AM)
    console.log('[Cron Manager] Starting Expiration Checker...')
    allCronJobs.expirationChecker = startExpirationCron()

    // 5. Blockchain Data Sync (Every 10 minutes)
    console.log('[Cron Manager] Starting Blockchain Data Sync...')
    allCronJobs.blockchainSync = setInterval(async () => {
      try {
        await syncBlockchainData()
      } catch (error) {
        console.error('[Cron Manager] Blockchain sync error:', error)
      }
    }, 10 * 60 * 1000) // Every 10 minutes

    // 6. Session Management (Every 24 hours)
    console.log('[Cron Manager] Starting Session Management...')
    allCronJobs.sessionManagement = setInterval(async () => {
      try {
        await SessionManagementCron.performSessionCleanup()
        await SessionManagementCron.performSessionMonitoring()
      } catch (error) {
        console.error('[Cron Manager] Session management error:', error)
      }
    }, 24 * 60 * 60 * 1000) // Every 24 hours

    // Run session cleanup immediately on startup
      // 7. Referral Distribution Cron (Every 5 minutes)
      console.log('[Cron Manager] Starting Referral Distribution Cron...')
      allCronJobs.referralDistribution = referralDistributionCron.startReferralDistributionCron()

    setTimeout(async () => {
      try {
        console.log('[Cron Manager] Performing initial session cleanup...')
        await SessionManagementCron.performSessionCleanup()
      } catch (error) {
        console.error('[Cron Manager] Initial session cleanup error:', error)
      }
    }, 5000) // Wait 5 seconds after startup

    isInitialized = true

    console.log('[Cron Manager] All cron jobs started successfully')
    console.log('[Cron Manager] Active cron jobs:')
    console.log('  - New Payment Scanner: Every 2 minutes')
    console.log('  - Legacy Payment Scanner: Every 2 minutes')
    console.log('  - ROI Payout: Daily at 00:00')
    console.log('  - Expiration Checker: Daily at 01:00')
    console.log('  - Blockchain Data Sync: Every 10 minutes')
    console.log('  - Session Management: Every 24 hours')
  } catch (error) {
    console.error('[Cron Manager] Error starting cron jobs:', error)
    throw error
  }
}

/**
 * Get status of all cron jobs
 */
export function getAllCronStatus(): CronJobStatus[] {
  const paymentScannerStatus = getScannerStatus()
  const roiStatus = getRoiCronStatus()
  const expirationStatus = getExpirationCronStatus()
  const sessionStats = SessionManagementCron.getCleanupStats()

  return [
    {
      name: 'Payment Scanner',
      description: 'Scans blockchain for incoming payments',
      schedule: 'Every 2 minutes',
      isRunning: !paymentScannerStatus.isScanning,
      lastRunTime: paymentScannerStatus.lastScanTime,
      stats: {
        scanCount: paymentScannerStatus.scanCount,
        uptime: paymentScannerStatus.uptime,
      },
    },
    {
      name: 'ROI Payout',
      description: 'Processes monthly ROI payments',
      schedule: 'Daily at 00:00',
      isRunning: !roiStatus.isProcessing,
      lastRunTime: roiStatus.lastRunTime,
      stats: {
        totalProcessed: roiStatus.totalProcessed,
      },
    },
    {
      name: 'Expiration Checker',
      description: 'Checks and processes expired packages and bots',
      schedule: 'Daily at 01:00',
      isRunning: !expirationStatus.isProcessing,
      lastRunTime: expirationStatus.lastRunTime,
      stats: {
        packagesExpired: expirationStatus.packagesExpired,
        botsExpired: expirationStatus.botsExpired,
      },
    },
    {
      name: 'Session Management',
      description: 'Cleans up expired sessions and monitors security',
      schedule: 'Every 24 hours',
      isRunning: !sessionStats.isCurrentlyRunning,
      lastRunTime: sessionStats.lastCleanup,
      stats: {
        totalCleanups: sessionStats.totalCleanups,
        totalSessionsCleaned: sessionStats.totalSessionsCleaned,
        averageSessionsCleaned: sessionStats.averageSessionsCleaned,
      },
    },
  ]
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopAllCronJobs() {
  console.log('[Cron Manager] Stopping all cron jobs...')

  try {
    // Stop new payment scanner
    stopPaymentScanner()

    // Stop legacy cron jobs
    Object.keys(allCronJobs).forEach((key) => {
      if (allCronJobs[key] && typeof allCronJobs[key].stop === 'function') {
        allCronJobs[key].stop()
        console.log(`[Cron Manager] Stopped ${key}`)
      }
    })

    isInitialized = false
    console.log('[Cron Manager] All cron jobs stopped')
  } catch (error) {
    console.error('[Cron Manager] Error stopping cron jobs:', error)
  }
}

/**
 * Get cron manager status
 */
export function getCronManagerStatus() {
  return {
    isInitialized,
    totalJobs: Object.keys(allCronJobs).length,
    jobs: getAllCronStatus(),
  }
}

// Graceful shutdown handler
process.on('SIGINT', () => {
  console.log('[Cron Manager] Received SIGINT, stopping cron jobs...')
  stopAllCronJobs()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('[Cron Manager] Received SIGTERM, stopping cron jobs...')
  stopAllCronJobs()
  process.exit(0)
})

export default {
  startAllCronJobs,
  stopAllCronJobs,
  getAllCronStatus,
  getCronManagerStatus,
}
