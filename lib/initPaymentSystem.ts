/**
 * Initialize Payment System
 * This file initializes the payment monitoring system when the server starts
 */

import { startAllCronJobs } from '@/cron/cronManager'
import pool from '@/lib/db-init'
import fs from 'fs'
import path from 'path'

let isInitialized = false

/**
 * Initialize payment system
 */
export async function initPaymentSystem() {
  if (isInitialized) {
    console.log('[Payment System] Already initialized')
    return
  }

  try {
    console.log('[Payment System] Initializing payment processing system...')

    // 1. Check if payment tables exist
    const tablesExist = await checkPaymentTables()

    if (!tablesExist) {
      console.log('[Payment System] Payment tables not found. Running migration...')
      await runPaymentMigration()
    }

    // 2. Start all cron jobs (payment scanner, ROI payouts, expiration checker)
    console.log('[Payment System] Starting all cron jobs...')
    startAllCronJobs()

    // 3. Verify environment variables
    verifyEnvironmentVariables()

    isInitialized = true
    console.log('[Payment System] Initialization completed successfully')
    console.log('[Payment System] Active Services:')
    console.log('  ✓ Payment Scanner (every 2 minutes)')
    console.log('  ✓ ROI Payout (daily at midnight)')
    console.log('  ✓ Expiration Checker (daily at 1 AM)')
  } catch (error) {
    console.error('[Payment System] Initialization failed:', error)
    throw error
  }
}

/**
 * Check if payment tables exist
 */
async function checkPaymentTables(): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'PaymentRequest'
      );
    `)

    return result.rows[0].exists
  } catch (error) {
    console.error('Error checking payment tables:', error)
    return false
  }
}

/**
 * Run payment migration
 */
async function runPaymentMigration() {
  try {
    const migrationPath = path.join(process.cwd(), 'lib', 'db-payment-schema.sql')

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('[Payment System] Executing payment schema migration...')
    await pool.query(migrationSQL)

    console.log('[Payment System] Payment tables created successfully')
  } catch (error) {
    console.error('[Payment System] Migration failed:', error)
    throw error
  }
}

/**
 * Verify required environment variables
 */
function verifyEnvironmentVariables() {
  const required = [
    'BSC_RPC_URL',
    'ADMIN_WALLET_BSC',
    'USDT_CONTRACT_BSC',
    'TRON_RPC_URL',
    'ADMIN_WALLET_TRON',
    'USDT_CONTRACT_TRON',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(
      `[Payment System] Warning: Missing environment variables: ${missing.join(', ')}`
    )
    console.warn('[Payment System] Payment processing may not work correctly')
  } else {
    console.log('[Payment System] All required environment variables are set')
  }
}

/**
 * Get payment system status
 */
export function getPaymentSystemStatus() {
  return {
    initialized: isInitialized,
    timestamp: new Date().toISOString(),
  }
}

export default {
  initPaymentSystem,
  getPaymentSystemStatus,
}
