/**
 * Enhanced Bot Service
 * Integrates the new payment gateway system with bot activation
 */

import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { createPaymentRequest } from './paymentGatewayService'
import { v4 as uuidv4 } from 'uuid'

interface ActivateBotWithPaymentParams {
  userId: string
  botType: 'NEO' | 'NEURAL' | 'ORACLE'
  network: 'BEP20' | 'TRC20'
}

/**
 * Get bot activation fee based on bot type
 */
function getBotActivationFee(botType: 'NEO' | 'NEURAL' | 'ORACLE'): number {
  const fees = {
    NEO: 50,
    NEURAL: 75,
    ORACLE: 100,
  }
  return fees[botType]
}

/**
 * Create bot activation with integrated payment system
 */
export async function activateBotWithPayment(params: ActivateBotWithPaymentParams) {
  const { userId, botType, network } = params

  // Get activation fee
  const activationFee = getBotActivationFee(botType)

  // Calculate expiry date (1 year from now)
  const activationDate = new Date()
  const expiryDate = new Date(activationDate)
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  // Check if user already has this bot type active
  const existingBot = await queryOne(
    `SELECT * FROM "BotActivation" WHERE "userId" = $1 AND "botType" = $2`,
    [userId, botType]
  )

  if (existingBot && existingBot.status === 'ACTIVE' && !existingBot.isExpired) {
    throw new Error(`You already have an active ${botType} bot`)
  }

  // Create bot activation record with PENDING status (requires admin approval)
  const bot = await queryOne(
    `INSERT INTO "BotActivation" (id, "userId", "botType", "activationFee", "activationDate", "expiryDate", status, network, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7::"BotStatus", $8::"Network", $9, $10)
     RETURNING *`,
    [uuidv4(), userId, botType, activationFee, activationDate, expiryDate, 'PENDING', network, new Date(), new Date()]
  )

  // Create payment request with QR code
  const paymentRequest = await createPaymentRequest({
    userId,
    purpose: 'BOT_ACTIVATION',
    amount: activationFee,
    network,
    metadata: {
      botId: bot.id,
      botType,
    },
  })

  return {
    bot: {
      id: bot.id,
      botType: bot.botType,
      activationFee: Number(bot.activationFee),
      status: bot.status,
      activationDate: bot.activationDate,
      expiryDate: bot.expiryDate,
      network: bot.network,
    },
    payment: paymentRequest,
  }
}

/**
 * Get bot activation with payment status
 */
export async function getBotWithPaymentStatus(botId: string) {
  const bot = await queryOne(
    `SELECT * FROM "BotActivation" WHERE id = $1`,
    [botId]
  )

  if (!bot) {
    throw new Error('Bot activation not found')
  }

  // Find associated payment request
  const paymentRequest = await query(
    `SELECT * FROM "PaymentRequest"
     WHERE "userId" = $1 AND purpose = $2 AND metadata->>'botId' = $3
     ORDER BY "createdAt" DESC
     LIMIT 1`,
    [bot.userId, 'BOT_ACTIVATION', botId]
  )

  return {
    bot: {
      id: bot.id,
      botType: bot.botType,
      activationFee: Number(bot.activationFee),
      status: bot.status,
      activationDate: bot.activationDate,
      expiryDate: bot.expiryDate,
      paymentTxHash: bot.paymentTxHash,
      network: bot.network,
    },
    paymentRequest: paymentRequest[0] || null,
  }
}

/**
 * Get user's bots with payment status
 */
export async function getUserBotsWithPayment(userId: string) {
  const bots = await query(
    `SELECT * FROM "BotActivation" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
    [userId]
  )

  const botsWithPayment = await Promise.all(
    bots.map(async (bot) => {
      // Find associated payment request
      const paymentRequest = await query(
        `SELECT * FROM "PaymentRequest"
         WHERE "userId" = $1 AND purpose = $2 AND metadata->>'botId' = $3
         ORDER BY "createdAt" DESC
         LIMIT 1`,
        [userId, 'BOT_ACTIVATION', bot.id]
      )

      return {
        id: bot.id,
        botType: bot.botType,
        activationFee: Number(bot.activationFee),
        status: bot.status,
        activationDate: bot.activationDate,
        expiryDate: bot.expiryDate,
        isExpired: bot.isExpired,
        paymentTxHash: bot.paymentTxHash,
        network: bot.network,
        paymentStatus: paymentRequest[0]?.status || null,
        paymentRequestId: paymentRequest[0]?.id || null,
      }
    })
  )

  return botsWithPayment
}

/**
 * Check if user is eligible to activate a bot
 */
export async function checkBotActivationEligibility(userId: string, botType: 'NEO' | 'NEURAL' | 'ORACLE') {
  // Check if user has an active package of the same type
  const activePackage = await queryOne(
    `SELECT * FROM "Package"
     WHERE "userId" = $1 AND "packageType" = $2 AND status = $3 AND "isExpired" = $4
     LIMIT 1`,
    [userId, botType, 'ACTIVE', false]
  )

  if (!activePackage) {
    return {
      eligible: false,
      reason: `You need an active ${botType} package to activate this bot`,
      requiredPackageType: botType,
    }
  }

  // Check if bot is already active
  const existingBot = await queryOne(
    `SELECT * FROM "BotActivation"
     WHERE "userId" = $1 AND "botType" = $2 AND status = $3::"BotStatus" AND "isExpired" = $4
     LIMIT 1`,
    [userId, botType, 'ACTIVE', false]
  )

  if (existingBot) {
    return {
      eligible: false,
      reason: `You already have an active ${botType} bot`,
      expiryDate: existingBot.expiryDate,
    }
  }

  return {
    eligible: true,
    activationFee: getBotActivationFee(botType),
  }
}

export default {
  activateBotWithPayment,
  getBotWithPaymentStatus,
  getUserBotsWithPayment,
  checkBotActivationEligibility,
}
