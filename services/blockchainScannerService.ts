/**
 * Blockchain Scanner Service
 * Automatically scans blockchain networks for incoming payments to admin wallet
 * Matches transactions to pending payment requests and processes them
 */

// Web3 libs removed - blockchain scanning disabled in offchain mode
const WEB3_DISABLED = process.env.WEB3_DISABLED === 'true' || process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

const REQUIRED_CONFIRMATIONS = {
  BEP20: 3,
  TRC20: 19, // TRON requires more confirmations
}

const SCAN_BATCH_SIZE = 100 // Process 100 blocks per scan

interface TransactionMatch {
  txHash: string
  amount: number
  fromAddress: string
  toAddress: string
  confirmations: number
  blockNumber: number
  network: 'BEP20' | 'TRC20'
}

/**
 * Scan BSC (BEP20) blockchain for incoming USDT transactions
 */
export async function scanBep20Transactions() {
  try {
    if (WEB3_DISABLED) {
      console.warn('WEB3_DISABLED: skip BEP20 blockchain scan')
      return
    }
    // BEP20 scanning is intentionally disabled in offchain mode.
    console.warn('BEP20 scanner is not implemented in this build')
    return
  } catch (error) {
    console.error('Error scanning BEP20:', error)

    // Update error state
    const scanState = await queryOne(
      `SELECT * FROM "BlockchainScanState" WHERE network = $1`,
      ['BEP20']
    )

    if (scanState) {
      await execute(
        `UPDATE "BlockchainScanState"
         SET "isScanning" = $1, "errorCount" = $2, "lastError" = $3, "updatedAt" = $4
         WHERE network = $5`,
        [false, (scanState.errorCount || 0) + 1, error instanceof Error ? error.message : 'Unknown error', new Date(), 'BEP20']
      )
    }

    throw error
  }
}

/**
 * Scan TRON (TRC20) blockchain for incoming USDT transactions
 */
export async function scanTrc20Transactions() {
  try {
    if (WEB3_DISABLED) {
      console.warn('WEB3_DISABLED: skip TRC20 blockchain scan')
      return
    }
    // TRC20 scanning is intentionally disabled in offchain mode.
    console.warn('TRC20 scanner is not implemented in this build')
    return
  } catch (error) {
    console.error('Error scanning TRC20:', error)

    // Update error state
    const scanState = await queryOne(
      `SELECT * FROM "BlockchainScanState" WHERE network = $1`,
      ['TRC20']
    )

    if (scanState) {
      await execute(
        `UPDATE "BlockchainScanState"
         SET "isScanning" = $1, "errorCount" = $2, "lastError" = $3, "updatedAt" = $4
         WHERE network = $5`,
        [false, (scanState.errorCount || 0) + 1, error instanceof Error ? error.message : 'Unknown error', new Date(), 'TRC20']
      )
    }

    throw error
  }
}

/**
 * Process a matched transaction
 */
async function processTransaction(transaction: TransactionMatch) {
  const { txHash, amount, fromAddress, toAddress, confirmations, blockNumber, network } =
    transaction

  console.log(
    `Processing ${network} transaction: ${txHash}, Amount: ${amount}, Confirmations: ${confirmations}`
  )

  // Check if we already processed this webhook
  const existingWebhook = await queryOne(
    `SELECT * FROM "PaymentWebhook" WHERE "txHash" = $1`,
    [txHash]
  )

  if (existingWebhook?.processed) {
    console.log(`Transaction ${txHash} already processed`)
    return
  }

  // Find matching payment request
  const paymentRequests = await query(
    `SELECT * FROM "PaymentRequest" WHERE network = $1 AND status = $2`,
    [network, 'PENDING']
  )

  let matchedRequest = null

  for (const request of paymentRequests) {
    // Match by amount (allow 1% tolerance for fees)
    const expectedAmount = Number(request.amount)
    const amountDiff = Math.abs(amount - expectedAmount)
    const tolerance = expectedAmount * 0.01

    if (amountDiff <= tolerance) {
      matchedRequest = request
      break
    }
  }

  // Log webhook
  const webhookData = {
    id: uuidv4(),
    paymentRequestId: matchedRequest?.id || null,
    network,
    txHash,
    fromAddress,
    toAddress,
    amount,
    confirmations,
    blockNumber,
    payload: {
      transaction,
      matchedRequestId: matchedRequest?.id,
      timestamp: new Date().toISOString(),
    },
    processed: false,
    createdAt: new Date(),
  }

  const webhook = await queryOne(
    `INSERT INTO "PaymentWebhook" (id, "paymentRequestId", network, "txHash", "fromAddress", "toAddress", amount, confirmations, "blockNumber", payload, processed, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [webhookData.id, webhookData.paymentRequestId, webhookData.network, webhookData.txHash, webhookData.fromAddress, webhookData.toAddress, webhookData.amount, webhookData.confirmations, webhookData.blockNumber, JSON.stringify(webhookData.payload), webhookData.processed, webhookData.createdAt]
  )

  if (!matchedRequest) {
    console.log(`No matching payment request found for transaction ${txHash}`)
    return
  }

  // Check if payment already has confirmation tracking
  let confirmation = await queryOne(
    `SELECT * FROM "PaymentConfirmation" WHERE "txHash" = $1`,
    [txHash]
  )

  if (!confirmation) {
    confirmation = await queryOne(
      `INSERT INTO "PaymentConfirmation" (id, "paymentRequestId", "txHash", network, confirmations, "requiredConfirmations", "blockNumber", amount, "fromAddress", "toAddress", "isConfirmed", "lastCheckedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [uuidv4(), matchedRequest.id, txHash, network, confirmations, REQUIRED_CONFIRMATIONS[network], BigInt(blockNumber), amount, fromAddress, toAddress, confirmations >= REQUIRED_CONFIRMATIONS[network], new Date(), new Date(), new Date()]
    )
  } else {
    // Update confirmation count
    confirmation = await queryOne(
      `UPDATE "PaymentConfirmation"
       SET confirmations = $1, "isConfirmed" = $2, "lastCheckedAt" = $3, "updatedAt" = $4
       WHERE id = $5
       RETURNING *`,
      [confirmations, confirmations >= REQUIRED_CONFIRMATIONS[network], new Date(), new Date(), confirmation.id]
    )
  }

  // Update payment request status
  if (confirmations === 0) {
    // First detection - move to CONFIRMING
    await execute(
      `UPDATE "PaymentRequest"
       SET status = $1, "txHash" = $2, confirmations = $3, "amountReceived" = $4, "updatedAt" = $5
       WHERE id = $6`,
      ['CONFIRMING', txHash, confirmations, amount, new Date(), matchedRequest.id]
    )

    // Send payment received notification
    const { sendPaymentReceivedEmail } = await import('./paymentNotificationService')
    await sendPaymentReceivedEmail(matchedRequest.userId, matchedRequest.id, txHash).catch(
      (err) => console.error('Failed to send payment received email:', err)
    )
  } else if (confirmations >= REQUIRED_CONFIRMATIONS[network]) {
    // Sufficient confirmations - mark as COMPLETED
    await execute(
      `UPDATE "PaymentRequest"
       SET status = $1, confirmations = $2, "completedAt" = $3, "updatedAt" = $4
       WHERE id = $5`,
      ['COMPLETED', confirmations, new Date(), new Date(), matchedRequest.id]
    )

    // Mark webhook as processed
    await execute(
      `UPDATE "PaymentWebhook" SET processed = $1, "processedAt" = $2 WHERE id = $3`,
      [true, new Date(), webhook.id]
    )

    // Process the payment (activate package, bot, etc.)
    await processPaymentCompletion(matchedRequest)

    console.log(`Payment request ${matchedRequest.id} completed successfully`)
  } else {
    // Update confirmation count
    await execute(
      `UPDATE "PaymentRequest" SET confirmations = $1, "updatedAt" = $2 WHERE id = $3`,
      [confirmations, new Date(), matchedRequest.id]
    )
  }
}

/**
 * Process TRON event (alternative method)
 */
async function processTronEvent(event: any) {
  // Implementation for real-time TRON event processing
  console.log('TRON event received:', event)
}

/**
 * Process payment completion - activate package, bot, etc.
 */
async function processPaymentCompletion(paymentRequest: any) {
  try {
    const metadata = paymentRequest.metadata || {}

    // Send payment confirmed email
    const { sendPaymentConfirmedEmail } = await import('./paymentNotificationService')
    await sendPaymentConfirmedEmail(
      paymentRequest.userId,
      paymentRequest.id,
      paymentRequest.txHash
    )

    switch (paymentRequest.purpose) {
      case 'PACKAGE_PURCHASE':
        // Activate the package
        if (metadata.packageId) {
          await execute(
            `UPDATE "Package" SET status = $1, "depositTxHash" = $2, "updatedAt" = $3 WHERE id = $4`,
            ['ACTIVE', paymentRequest.txHash, new Date(), metadata.packageId]
          )

          // Create transaction record
          await execute(
            `INSERT INTO "Transaction" (id, "userId", type, amount, status, description, "txHash", network, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [uuidv4(), paymentRequest.userId, 'PACKAGE_PURCHASE', paymentRequest.amount, 'COMPLETED', 'Package purchase confirmed', paymentRequest.txHash, paymentRequest.network, new Date(), new Date()]
          )

          // Trigger referral bonuses
          await triggerReferralBonuses(paymentRequest.userId, metadata.packageId, paymentRequest.amount)

          console.log(`Package ${metadata.packageId} activated`)
        }
        break

      case 'BOT_ACTIVATION':
        // Activate the bot
        if (metadata.botId) {
          await execute(
            `UPDATE "BotActivation" SET status = $1::"BotStatus", "paymentTxHash" = $2, "updatedAt" = $3 WHERE id = $4`,
            ['ACTIVE', paymentRequest.txHash, new Date(), metadata.botId]
          )

          // Create transaction record
          await execute(
            `INSERT INTO "Transaction" (id, "userId", type, amount, status, description, "txHash", network, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [uuidv4(), paymentRequest.userId, 'BOT_ACTIVATION', paymentRequest.amount, 'COMPLETED', 'Bot activation confirmed', paymentRequest.txHash, paymentRequest.network, new Date(), new Date()]
          )

          console.log(`Bot ${metadata.botId} activated`)
        }
        break

      case 'MANUAL_DEPOSIT':
        // Just create a transaction record for manual deposits
        await execute(
          `INSERT INTO "Transaction" (id, "userId", type, amount, status, description, "txHash", network, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [uuidv4(), paymentRequest.userId, 'PACKAGE_PURCHASE', paymentRequest.amount, 'COMPLETED', 'Manual deposit confirmed', paymentRequest.txHash, paymentRequest.network, new Date(), new Date()]
        )
        break
    }
  } catch (error) {
    console.error('Error processing payment completion:', error)
    throw error
  }
}

/**
 * Trigger referral bonuses for package purchase
 */
async function triggerReferralBonuses(userId: string, packageId: string, amount: number) {
  try {
    // Get user's referrer
    const user = await queryOne(
      `SELECT * FROM "User" WHERE id = $1`,
      [userId]
    )

    if (!user || !user.referredBy) {
      return
    }

    // Get referrer
    const referrer = await queryOne(
      `SELECT * FROM "User" WHERE "referralCode" = $1`,
      [user.referredBy]
    )

    if (!referrer) {
      return
    }

    // Import referral service
    const { calculateReferralEarnings } = await import('./referralService')

    // Use the SQL function to calculate and create all referral earnings atomically
    await calculateReferralEarnings(packageId, userId, Number(amount))

    // After earnings have been created in DB, perform on-chain transfers for those earnings
    try {
      const { distributeReferralEarningsOnChain } = await import('./referralService')
      const distributionResult = await distributeReferralEarningsOnChain(packageId, paymentRequest.network)
      console.log(`[Referral] Distributed referral earnings - success: ${distributionResult.success}, failed: ${distributionResult.failed}`)
    } catch (err) {
      console.error('[Referral] Error distributing referral earnings on-chain:', err)
    }

    console.log(`✅ Referral bonuses processed for package ${packageId}`)
  } catch (error) {
    console.error('❌ Error triggering referral bonuses:', error)
    // Don't throw - we don't want to fail the payment if referral bonuses fail
  }
}

/**
 * Scan all networks
 */
export async function scanAllNetworks() {
  console.log('Starting blockchain scan for all networks...')

  try {
    // Scan both networks in parallel
    await Promise.allSettled([scanBep20Transactions(), scanTrc20Transactions()])

    console.log('Blockchain scan completed for all networks')
  } catch (error) {
    console.error('Error scanning blockchains:', error)
    throw error
  }
}

/**
 * Check pending confirmations and update their status
 */
export async function checkPendingConfirmations() {
  try {
    if (WEB3_DISABLED) {
      console.warn('WEB3_DISABLED: skip confirmation checks')
      return
    }

    const pendingConfirmations = await query(
      `SELECT * FROM "PaymentConfirmation" WHERE "isConfirmed" = $1`,
      [false]
    )

    console.log(`Checking ${pendingConfirmations.length} pending confirmations`)

    for (const confirmation of pendingConfirmations) {
      try {
        let currentConfirmations = 0

        // Confirmation checks require a blockchain provider - skip in offchain builds
        // Provide a safe default of zero confirmations
        currentConfirmations = 0

        // Update confirmation
        const isConfirmed =
          currentConfirmations >= REQUIRED_CONFIRMATIONS[confirmation.network]

        await execute(
          `UPDATE "PaymentConfirmation"
           SET confirmations = $1, "isConfirmed" = $2, "lastCheckedAt" = $3, "updatedAt" = $4
           WHERE id = $5`,
          [currentConfirmations, isConfirmed, new Date(), new Date(), confirmation.id]
        )

        if (isConfirmed) {
          // Update payment request and process completion
          const paymentRequest = await queryOne(
            `SELECT * FROM "PaymentRequest" WHERE id = $1`,
            [confirmation.paymentRequestId]
          )

          if (paymentRequest && paymentRequest.status !== 'COMPLETED') {
            await execute(
              `UPDATE "PaymentRequest"
               SET status = $1, confirmations = $2, "completedAt" = $3, "updatedAt" = $4
               WHERE id = $5`,
              ['COMPLETED', currentConfirmations, new Date(), new Date(), paymentRequest.id]
            )

            await processPaymentCompletion(paymentRequest)
          }
        }
      } catch (error) {
        console.error(
          `Error checking confirmation for payment ${confirmation.paymentRequestId}:`,
          error
        )
      }
    }
  } catch (error) {
    console.error('Error checking pending confirmations:', error)
    throw error
  }
}
