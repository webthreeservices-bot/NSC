/**
 * API Route: Payment Webhook Handler
 * POST /api/payments/webhook
 *
 * This endpoint receives webhook notifications from external payment monitoring services
 * or blockchain explorers about new transactions
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// Force dynamic rendering - this route cannot be static
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Secret key for webhook verification (REQUIRED - no fallback for security)
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET

// Only warn at runtime, not during build
if (!WEBHOOK_SECRET && typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  PAYMENT_WEBHOOK_SECRET not configured - webhook verification disabled in development')
}

/**
 * Validate blockchain address format
 */
function isValidAddress(address: string, network: 'BEP20' | 'TRC20'): boolean {
  if (!address || typeof address !== 'string') return false
  
  if (network === 'BEP20') {
    // Ethereum/BSC address: 0x followed by 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  } else if (network === 'TRC20') {
    // TRON address: T followed by 33 base58 characters
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)
  }
  
  return false
}

/**
 * Verify webhook signature using HMAC SHA256
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
  try {
    if (!WEBHOOK_SECRET) {
      console.error('Cannot verify signature: PAYMENT_WEBHOOK_SECRET not configured')
      return false
    }

    const hash = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex')
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    )
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    let body: any

    try {
      body = JSON.parse(rawBody)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    // Verify webhook signature (required in production)
    const signature = request.headers.get('x-webhook-signature')

    if (!signature && process.env.NODE_ENV === 'production') {
      console.error('Missing webhook signature in production')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { network, txHash, fromAddress, toAddress, amount, confirmations, blockNumber, blockHash } = body

    // Validate required fields
    if (!network || !txHash || !toAddress || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate network
    if (!['BEP20', 'TRC20'].includes(network)) {
      return NextResponse.json({ error: 'Invalid network' }, { status: 400 })
    }

    // Validate blockchain address formats
    if (!isValidAddress(toAddress, network)) {
      console.error(`Invalid ${network} address format: ${toAddress}`)
      return NextResponse.json({ error: 'Invalid destination address format' }, { status: 400 })
    }

    if (fromAddress && !isValidAddress(fromAddress, network)) {
      console.error(`Invalid ${network} address format: ${fromAddress}`)
      return NextResponse.json({ error: 'Invalid source address format' }, { status: 400 })
    }

    // IDEMPOTENCY CHECK: Prevent double-processing of the same transaction
    let existingConfirmation
    try {
      existingConfirmation = await queryOne(
        `SELECT * FROM "PaymentConfirmation" WHERE "txHash" = $1`,
        [txHash]
      )
    } catch (dbError) {
      console.error('Database error during idempotency check:', dbError)
      return NextResponse.json(
        {
          error: 'Database error during idempotency check',
          message: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      )
    }

    if (existingConfirmation && existingConfirmation.isConfirmed) {
      console.log(`Transaction ${txHash} already processed (idempotent)`)
      return NextResponse.json(
        {
          success: true,
          message: 'Transaction already processed',
          idempotent: true,
          confirmationId: existingConfirmation.id
        },
        { status: 200 }
      )
    }

    // Log webhook
    let webhook
    try {
      webhook = await queryOne(
        `INSERT INTO "PaymentWebhook" (id, network, "txHash", "fromAddress", "toAddress", amount, confirmations, "blockNumber", "blockHash", payload, processed, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [uuidv4(), network, txHash, fromAddress, toAddress, amount, confirmations, blockNumber, blockHash, JSON.stringify(body), false, new Date()]
      )
    } catch (dbError) {
      console.error('Database error during webhook logging:', dbError)
      return NextResponse.json(
        {
          error: 'Failed to log webhook in database',
          message: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      )
    }

    // Find matching payment request
    const adminWallet =
      network === 'BEP20' ? process.env.ADMIN_WALLET_BSC : process.env.ADMIN_WALLET_TRON

    if (!adminWallet) {
      console.error(`Admin wallet not configured for ${network}`)
      return NextResponse.json(
        { error: 'Server configuration error', message: `Admin wallet not configured for ${network}` },
        { status: 500 }
      )
    }

    if (toAddress.toLowerCase() !== adminWallet.toLowerCase()) {
      return NextResponse.json(
        { success: true, message: 'Transaction not for admin wallet' },
        { status: 200 }
      )
    }

    // Find pending payment requests that match
    // PRIORITY 1: Try to match by txHash first (most specific)
    let txHashMatches, paymentRequests
    try {
      txHashMatches = await query(
        `SELECT * FROM "PaymentRequest"
         WHERE network = $1 AND status = $2 AND "txHash" = $3
         LIMIT 1`,
        [network, 'PENDING', txHash]
      )
    } catch (dbError) {
      console.error('Database error during payment request lookup by txHash:', dbError)
      return NextResponse.json(
        {
          error: 'Database error during payment matching',
          message: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      )
    }

    let matchedRequest = txHashMatches[0] || null

    // PRIORITY 2: Match by exact amount and address (if provided)
    if (!matchedRequest) {
      try {
        paymentRequests = await query(
          `SELECT * FROM "PaymentRequest"
           WHERE network = $1 AND status = $2
           ORDER BY "createdAt" ASC
           LIMIT 100`,
          [network, 'PENDING']
        )
      } catch (dbError) {
        console.error('Database error during payment request lookup by amount:', dbError)
        return NextResponse.json(
          {
            error: 'Database error during payment matching',
            message: dbError instanceof Error ? dbError.message : 'Unknown database error',
          },
          { status: 500 }
        )
      }

      for (const request of paymentRequests) {
        const expectedAmount = Number(request.amount)
        const receivedAmount = Number(amount)
        
        // Exact amount match (no tolerance)
        const amountMatches = Math.abs(receivedAmount - expectedAmount) < 0.000001

        // If fromAddress is available and stored in request, verify exact match
        const addressMatches = !request.fromAddress || 
                              !fromAddress || 
                              request.fromAddress.toLowerCase() === fromAddress.toLowerCase()

        if (amountMatches && addressMatches) {
          // Additional verification: check if this is the oldest pending request
          const olderSameAmountList = await query(
            `SELECT * FROM "PaymentRequest"
             WHERE network = $1 AND status = $2 AND amount = $3 AND "createdAt" < $4
             LIMIT 1`,
            [network, 'PENDING', request.amount, request.createdAt]
          )

          // Only match if this is the oldest pending request for this amount
          if (olderSameAmountList.length === 0) {
            matchedRequest = request
            break
          }
        }
      }
    }

    if (!matchedRequest) {
      console.log(`No matching payment request found for txHash: ${txHash}`)
      return NextResponse.json(
        { success: true, message: 'No matching payment request found' },
        { status: 200 }
      )
    }

    // Update webhook with matched payment request
    await execute(
      `UPDATE "PaymentWebhook" SET "paymentRequestId" = $1 WHERE id = $2`,
      [matchedRequest.id, webhook.id]
    )

    // Check if payment confirmation already exists
    let confirmation = await queryOne(
      `SELECT * FROM "PaymentConfirmation" WHERE "txHash" = $1`,
      [txHash]
    )

    const requiredConfirmations = network === 'BEP20' ? 3 : 19

    if (!confirmation) {
      // Create confirmation record
      confirmation = await queryOne(
        `INSERT INTO "PaymentConfirmation" (id, "paymentRequestId", "txHash", network, confirmations, "requiredConfirmations", "blockNumber", amount, "fromAddress", "toAddress", "isConfirmed", "lastCheckedAt", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [uuidv4(), matchedRequest.id, txHash, network, confirmations || 0, requiredConfirmations, BigInt(blockNumber || 0), Number(amount), fromAddress || '', toAddress || '', (confirmations || 0) >= requiredConfirmations, new Date(), new Date(), new Date()]
      )
    } else {
      // Update confirmation count
      confirmation = await queryOne(
        `UPDATE "PaymentConfirmation"
         SET confirmations = $1, "isConfirmed" = $2, "lastCheckedAt" = $3, "updatedAt" = $4
         WHERE id = $5
         RETURNING *`,
        [confirmations || confirmation.confirmations, (confirmations || 0) >= requiredConfirmations, new Date(), new Date(), confirmation.id]
      )
    }

    // Update payment request status
    if ((confirmations || 0) === 0) {
      // First detection
      await execute(
        `UPDATE "PaymentRequest"
         SET status = $1, "txHash" = $2, confirmations = $3, "amountReceived" = $4, "updatedAt" = $5
         WHERE id = $6`,
        ['CONFIRMING', txHash, confirmations || 0, Number(amount), new Date(), matchedRequest.id]
      )
    } else if ((confirmations || 0) >= requiredConfirmations) {
      // Process payment completion first (will throw on error)
      await processPaymentCompletion(matchedRequest)

      // Only mark as completed if processing succeeded
      await execute(
        `UPDATE "PaymentRequest"
         SET status = $1, confirmations = $2, "completedAt" = $3, "updatedAt" = $4
         WHERE id = $5`,
        ['COMPLETED', confirmations || 0, new Date(), new Date(), matchedRequest.id]
      )

      // Mark webhook as processed
      await execute(
        `UPDATE "PaymentWebhook" SET processed = $1, "processedAt" = $2 WHERE id = $3`,
        [true, new Date(), webhook.id]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      paymentRequestId: matchedRequest.id,
      confirmations: confirmations || 0,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      {
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Process payment completion
 */
async function processPaymentCompletion(paymentRequest: any) {
  const metadata = paymentRequest.metadata || {}

  switch (paymentRequest.purpose) {
    case 'PACKAGE_PURCHASE':
      if (!metadata.packageId) {
        throw new Error(`Missing packageId in payment metadata for request ${paymentRequest.id}`)
      }

      await execute(
        `UPDATE "Package" SET status = $1, "depositTxHash" = $2, "updatedAt" = $3 WHERE id = $4`,
        ['ACTIVE', paymentRequest.txHash, new Date(), metadata.packageId]
      )

      await execute(
        `INSERT INTO "Transaction" (id, "userId", type, amount, status, description, "txHash", network, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [uuidv4(), paymentRequest.userId, 'PACKAGE_PURCHASE', paymentRequest.amount, 'COMPLETED', 'Package purchase confirmed via webhook', paymentRequest.txHash, paymentRequest.network, new Date(), new Date()]
      )
      break

    case 'BOT_ACTIVATION':
      if (!metadata.botId) {
        throw new Error(`Missing botId in payment metadata for request ${paymentRequest.id}`)
      }

      await execute(
        `UPDATE "BotActivation" SET status = $1::"BotStatus", "paymentTxHash" = $2, "updatedAt" = $3 WHERE id = $4`,
        ['ACTIVE', paymentRequest.txHash, new Date(), metadata.botId]
      )

      await execute(
        `INSERT INTO "Transaction" (id, "userId", type, amount, status, description, "txHash", network, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [uuidv4(), paymentRequest.userId, 'BOT_ACTIVATION', paymentRequest.amount, 'COMPLETED', 'Bot activation confirmed via webhook', paymentRequest.txHash, paymentRequest.network, new Date(), new Date()]
      )
      break

    default:
      throw new Error(`Unknown payment purpose: ${paymentRequest.purpose}`)
  }
}

