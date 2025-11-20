/**
 * Payment Notification Service
 * Sends email notifications for payment events
 */

import { sendEmail } from '@/lib/email'
import {
  paymentReceivedTemplate,
  paymentConfirmedTemplate,
  paymentExpiredTemplate,
  PaymentEmailData,
} from '@/utils/paymentEmailTemplates'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'

/**
 * Send payment received notification
 */
export async function sendPaymentReceivedEmail(
  userId: string,
  paymentRequestId: string,
  txHash: string
) {
  try {
    // Get user details
    const user = await queryOne(
      `SELECT * FROM "User" WHERE id = $1`,
      [userId]
    )

    if (!user) {
      throw new Error('User not found')
    }

    // Get payment request details
    const paymentRequest = await queryOne(
      `SELECT * FROM "PaymentRequest" WHERE id = $1`,
      [paymentRequestId]
    )

    if (!paymentRequest) {
      throw new Error('Payment request not found')
    }

    const metadata = paymentRequest.metadata || {}

    const emailData: PaymentEmailData = {
      userName: user.fullName || user.username,
      amount: Number(paymentRequest.amount),
      network: paymentRequest.network,
      txHash,
      purpose:
        paymentRequest.purpose === 'PACKAGE_PURCHASE'
          ? 'Package Purchase'
          : paymentRequest.purpose === 'BOT_ACTIVATION'
          ? 'Bot Activation'
          : 'Manual Deposit',
      packageType: metadata.packageType,
      botType: metadata.botType,
    }

    await sendEmail({
      to: user.email,
      subject: 'Payment Received - Confirmation in Progress',
      html: paymentReceivedTemplate(emailData),
    })

    console.log(`Payment received email sent to ${user.email}`)
  } catch (error) {
    console.error('Error sending payment received email:', error)
  }
}

/**
 * Send payment confirmed notification
 */
export async function sendPaymentConfirmedEmail(
  userId: string,
  paymentRequestId: string,
  txHash: string
) {
  try {
    // Get user details
    const user = await queryOne(
      `SELECT * FROM "User" WHERE id = $1`,
      [userId]
    )

    if (!user) {
      throw new Error('User not found')
    }

    // Get payment request details
    const paymentRequest = await queryOne(
      `SELECT * FROM "PaymentRequest" WHERE id = $1`,
      [paymentRequestId]
    )

    if (!paymentRequest) {
      throw new Error('Payment request not found')
    }

    const metadata = paymentRequest.metadata || {}

    const emailData: PaymentEmailData = {
      userName: user.fullName || user.username,
      amount: Number(paymentRequest.amount),
      network: paymentRequest.network,
      txHash,
      purpose:
        paymentRequest.purpose === 'PACKAGE_PURCHASE'
          ? 'Package Purchase'
          : paymentRequest.purpose === 'BOT_ACTIVATION'
          ? 'Bot Activation'
          : 'Manual Deposit',
      packageType: metadata.packageType,
      botType: metadata.botType,
    }

    await sendEmail({
      to: user.email,
      subject: 'Payment Confirmed - Account Activated!',
      html: paymentConfirmedTemplate(emailData),
    })

    console.log(`Payment confirmed email sent to ${user.email}`)
  } catch (error) {
    console.error('Error sending payment confirmed email:', error)
  }
}

/**
 * Send payment expired notification
 */
export async function sendPaymentExpiredEmail(userId: string, paymentRequestId: string) {
  try {
    // Get user details
    const user = await queryOne(
      `SELECT * FROM "User" WHERE id = $1`,
      [userId]
    )

    if (!user) {
      throw new Error('User not found')
    }

    // Get payment request details
    const paymentRequest = await queryOne(
      `SELECT * FROM "PaymentRequest" WHERE id = $1`,
      [paymentRequestId]
    )

    if (!paymentRequest) {
      throw new Error('Payment request not found')
    }

    await sendEmail({
      to: user.email,
      subject: 'Payment Request Expired',
      html: paymentExpiredTemplate(
        user.fullName || user.username,
        Number(paymentRequest.amount)
      ),
    })

    console.log(`Payment expired email sent to ${user.email}`)
  } catch (error) {
    console.error('Error sending payment expired email:', error)
  }
}

export default {
  sendPaymentReceivedEmail,
  sendPaymentConfirmedEmail,
  sendPaymentExpiredEmail,
}
