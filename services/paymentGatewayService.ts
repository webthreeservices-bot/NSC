/**
 * Payment Gateway Service
 * Handles payment request creation with QR code generation
 * Supports BEP20 (BSC) and TRC20 (TRON) networks
 */

import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import { findUnique, findMany, create, update, count } from '@/lib/db-queries'

const PAYMENT_EXPIRY_MINUTES = 30 // Payment requests expire after 30 minutes

interface CreatePaymentRequestParams {
  userId: string
  purpose: 'PACKAGE_PURCHASE' | 'BOT_ACTIVATION' | 'MANUAL_DEPOSIT'
  amount: number
  network: 'BEP20' | 'TRC20'
  metadata?: {
    packageId?: string
    packageType?: string
    botId?: string
    botType?: string
    [key: string]: any
  }
}

interface PaymentRequestResponse {
  id: string
  userId: string
  purpose: string
  amount: number
  network: string
  depositAddress: string
  qrCode: string // Base64 data URL
  qrCodeImageUrl: string // Alternative: URL to QR code image
  status: string
  expiresAt: Date
  expiresIn: number // seconds
  instructions: {
    step1: string
    step2: string
    step3: string
    step4: string
  }
  networkInfo: {
    name: string
    token: string
    decimals: number
    confirmationsRequired: number
  }
  metadata?: any
}

/**
 * Create a new payment request with QR code
 */
export async function createPaymentRequest(
  params: CreatePaymentRequestParams
): Promise<PaymentRequestResponse> {
  const { userId, purpose, amount, network, metadata = {} } = params

  // Validate amount
  if (amount <= 0) {
    throw new Error('Invalid payment amount')
  }

  // Get admin wallet address for the network
  const depositAddress = getDepositAddress(network)

  // Create expiry time (30 minutes from now)
  const expiresAt = new Date(Date.now() + PAYMENT_EXPIRY_MINUTES * 60 * 1000)

  // Generate QR code data
  const qrData = generateQRData(network, depositAddress, amount)

  // Generate QR code image (base64)
  const qrCode = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })

  // Create payment request in database
  const paymentRequest = await create('PaymentRequest', {
    data: {
      id: uuidv4(),
      userId,
      purpose,
      amount,
      network,
      depositAddress,
      qrCodeData: qrCode,
      status: 'PENDING',
      expiresAt,
      metadata: metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Calculate expires in seconds
  const expiresIn = Math.floor((expiresAt.getTime() - Date.now()) / 1000)

  // Get network info
  const networkInfo = getNetworkInfo(network)

  // Generate instructions
  const instructions = generateInstructions(network, depositAddress, amount, paymentRequest.id)

  return {
    id: paymentRequest.id,
    userId: paymentRequest.userId,
    purpose: paymentRequest.purpose,
    amount: Number(paymentRequest.amount),
    network: paymentRequest.network,
    depositAddress: paymentRequest.depositAddress,
    qrCode,
    qrCodeImageUrl: `/api/payments/${paymentRequest.id}/qr`, // API endpoint to fetch QR code
    status: paymentRequest.status,
    expiresAt: paymentRequest.expiresAt,
    expiresIn,
    instructions,
    networkInfo,
    metadata: paymentRequest.metadata,
  }
}

/**
 * Get payment request status
 */
export async function getPaymentRequestStatus(paymentRequestId: string) {
  const paymentRequest = await findUnique('PaymentRequest', {
    where: { id: paymentRequestId },
  })

  if (!paymentRequest) {
    throw new Error('Payment request not found')
  }

  // Check if expired
  if (
    paymentRequest.status === 'PENDING' &&
    new Date() > new Date(paymentRequest.expiresAt)
  ) {
    // Mark as expired
    await update('PaymentRequest', {
      where: { id: paymentRequestId },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date(),
      },
    })

    paymentRequest.status = 'EXPIRED'
  }

  // Get confirmation info if available
  let confirmationInfo = null
  if (paymentRequest.txHash) {
    const confirmation = await findUnique('TransactionConfirmation', {
      where: { txHash: paymentRequest.txHash },
    })

    if (confirmation) {
      confirmationInfo = {
        txHash: confirmation.txHash,
        confirmations: confirmation.confirmations,
        requiredConfirmations: confirmation.requiredConfirmations,
        isConfirmed: confirmation.isConfirmed,
        progress: Math.min(
          100,
          (confirmation.confirmations / confirmation.requiredConfirmations) * 100
        ),
      }
    }
  }

  return {
    id: paymentRequest.id,
    status: paymentRequest.status,
    amount: Number(paymentRequest.amount),
    amountReceived: paymentRequest.amountReceived ? Number(paymentRequest.amountReceived) : null,
    network: paymentRequest.network,
    txHash: paymentRequest.txHash,
    confirmations: paymentRequest.confirmations,
    confirmationInfo,
    expiresAt: paymentRequest.expiresAt,
    completedAt: paymentRequest.completedAt,
    createdAt: paymentRequest.createdAt,
  }
}

/**
 * Get all payment requests for a user
 */
export async function getUserPaymentRequests(
  userId: string,
  status?: 'PENDING' | 'CONFIRMING' | 'COMPLETED' | 'EXPIRED' | 'FAILED'
) {
  const where: any = { userId }
  if (status) {
    where.status = status
  }

  const paymentRequests = await findMany('PaymentRequest', {
    where,
    orderBy: { createdAt: 'desc' },
  })

  return paymentRequests.map((pr) => ({
    id: pr.id,
    purpose: pr.purpose,
    amount: Number(pr.amount),
    network: pr.network,
    status: pr.status,
    txHash: pr.txHash,
    confirmations: pr.confirmations,
    expiresAt: pr.expiresAt,
    completedAt: pr.completedAt,
    createdAt: pr.createdAt,
  }))
}

/**
 * Cancel a pending payment request
 */
export async function cancelPaymentRequest(paymentRequestId: string, userId: string) {
  const paymentRequest = await findUnique('PaymentRequest', {
    where: { id: paymentRequestId },
  })

  if (!paymentRequest) {
    throw new Error('Payment request not found')
  }

  if (paymentRequest.userId !== userId) {
    throw new Error('Unauthorized')
  }

  if (paymentRequest.status !== 'PENDING') {
    throw new Error('Cannot cancel payment request in current status')
  }

  await update('PaymentRequest', {
    where: { id: paymentRequestId },
    data: {
      status: 'FAILED',
      updatedAt: new Date(),
    },
  })

  return { success: true, message: 'Payment request cancelled' }
}

/**
 * Manually verify a payment (for user-submitted txHash)
 */

import { Network } from '@/types'

export async function manuallyVerifyPayment(paymentRequestId: string, txHash: string) {
  const paymentRequest = await findUnique('PaymentRequest', {
    where: { id: paymentRequestId },
  })

  if (!paymentRequest) {
    throw new Error('Payment request not found')
  }

  if (paymentRequest.status !== 'PENDING') {
    throw new Error('Payment request is not pending')
  }

  // Import blockchain verification functions
  const { verifyBep20Transaction, verifyTrc20Transaction } = await import('@/lib/blockchain')

  let verified = false
  let confirmations = 0
  let blockNumber = 0
  let amountReceived = 0
  let fromAddress = ''
  let toAddress = ''
  let errorMsg = ''

  try {
    if (paymentRequest.network === 'BEP20') {
      // Use secure verification: check txHash, recipient, and amount
      verified = await verifyBep20Transaction(
        txHash,
        Number(paymentRequest.amount),
        paymentRequest.depositAddress
      )
      // Optionally, fetch more tx details for logging
    } else if (paymentRequest.network === 'TRC20') {
      verified = await verifyTrc20Transaction(
        txHash,
        Number(paymentRequest.amount),
        paymentRequest.depositAddress
      )
    } else {
      throw new Error('Unsupported network')
    }

    if (!verified) {
      throw new Error('Transaction verification failed or does not match required criteria')
    }

    // Update payment request: set to AWAITING_ADMIN_APPROVAL
    await update('PaymentRequest', {
      where: { id: paymentRequestId },
      data: {
        status: 'AWAITING_ADMIN_APPROVAL',
        txHash,
        updatedAt: new Date(),
      },
    })

    // Create confirmation tracking (minimal, as details are not fetched here)
    await create('TransactionConfirmation', {
      data: {
        id: uuidv4(),
        paymentRequestId: paymentRequest.id,
        txHash,
        network: paymentRequest.network,
        confirmations: 0,
        requiredConfirmations: paymentRequest.network === 'BEP20' ? 3 : 19,
        blockNumber: 0,
        amount: Number(paymentRequest.amount),
        fromAddress: '',
        toAddress: paymentRequest.depositAddress,
        isConfirmed: false,
        lastCheckedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return {
      success: true,
      message: 'Payment verification initiated',
      confirmations: 0,
    }
  } catch (error) {
    throw new Error(
      `Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get deposit address for network
 */
function getDepositAddress(network: 'BEP20' | 'TRC20'): string {
  if (network === 'BEP20') {
    return process.env.ADMIN_WALLET_BSC || ''
  } else if (network === 'TRC20') {
    return process.env.ADMIN_WALLET_TRON || ''
  }

  throw new Error('Invalid network')
}

/**
 * Generate QR code data based on network
 */
function generateQRData(network: 'BEP20' | 'TRC20', address: string, amount: number): string {
  if (network === 'BEP20') {
    // EIP-681 format for Ethereum/BSC
    // Format: ethereum:<address>@<chainId>?value=<amount>&token=<tokenAddress>
    const usdtContract = process.env.USDT_CONTRACT_BSC
    return `ethereum:${address}@56?value=0&token=${usdtContract}&amount=${amount}`
  } else if (network === 'TRC20') {
    // TRON format
    // Format: tron:<address>?amount=<amount>&token=<tokenAddress>
    const usdtContract = process.env.USDT_CONTRACT_TRON
    return `tron:${address}?amount=${amount}&token=${usdtContract}`
  }

  // Fallback: just the address
  return address
}

/**
 * Get network information
 */
function getNetworkInfo(network: 'BEP20' | 'TRC20') {
  if (network === 'BEP20') {
    return {
      name: 'Binance Smart Chain (BSC)',
      token: 'USDT (BEP20)',
      decimals: 18,
      confirmationsRequired: 3,
      chainId: 56,
      explorer: 'https://bscscan.com',
    }
  } else if (network === 'TRC20') {
    return {
      name: 'TRON',
      token: 'USDT (TRC20)',
      decimals: 6,
      confirmationsRequired: 19,
      chainId: null,
      explorer: 'https://tronscan.org',
    }
  }

  throw new Error('Invalid network')
}

/**
 * Generate payment instructions
 */
function generateInstructions(
  network: 'BEP20' | 'TRC20',
  address: string,
  amount: number,
  paymentRequestId: string
) {
  const networkName = network === 'BEP20' ? 'BEP20 (BSC)' : 'TRC20 (TRON)'

  return {
    step1: `Open your crypto wallet and select ${networkName} network`,
    step2: `Scan the QR code or copy the deposit address: ${address}`,
    step3: `Send exactly ${amount} USDT to the address`,
    step4: `Wait for confirmation. You can track the status on this page.`,
  }
}

/**
 * Expire old pending payment requests
 */
export async function expireOldPaymentRequests() {
  const now = new Date()

  const expiredRequests = await findMany('PaymentRequest', {
    where: {
      status: 'PENDING',
      expiresAt: {
        lt: now,
      },
    },
  })

  for (const request of expiredRequests) {
    await update('PaymentRequest', {
      where: { id: request.id },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date(),
      },
    })
  }

  console.log(`Expired ${expiredRequests.length} old payment requests`)
  return expiredRequests.length
}

/**
 * Get payment statistics
 */
export async function getPaymentStatistics(userId?: string) {
  const where: any = userId ? { userId } : {}

  const [total, pending, confirming, completed, expired, failed] = await Promise.all([
    count('PaymentRequest', { where }),
    count('PaymentRequest', { where: { ...where, status: 'PENDING' } }),
    count('PaymentRequest', { where: { ...where, status: 'CONFIRMING' } }),
    count('PaymentRequest', { where: { ...where, status: 'COMPLETED' } }),
    count('PaymentRequest', { where: { ...where, status: 'EXPIRED' } }),
    count('PaymentRequest', { where: { ...where, status: 'FAILED' } }),
  ])

  // Get total amount processed
  const completedPayments = await findMany('PaymentRequest', {
    where: { ...where, status: 'COMPLETED' },
    select: { amount: true },
  })

  const totalAmount = completedPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  )

  return {
    total,
    pending,
    confirming,
    completed,
    expired,
    failed,
    totalAmount,
    successRate: total > 0 ? ((completed / total) * 100).toFixed(2) : '0.00',
  }
}

export default {
  createPaymentRequest,
  getPaymentRequestStatus,
  getUserPaymentRequests,
  cancelPaymentRequest,
  manuallyVerifyPayment,
  expireOldPaymentRequests,
  getPaymentStatistics,
}
