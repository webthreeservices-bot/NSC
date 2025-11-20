/**
 * Email Templates for Payment System
 */

export interface PaymentEmailData {
  userName: string
  amount: number
  network: string
  txHash: string
  purpose: string
  packageType?: string
  botType?: string
}

/**
 * Payment Received Email Template
 */
export function paymentReceivedTemplate(data: PaymentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #4CAF50; margin-bottom: 20px;">Payment Received! 🎉</h1>

    <p>Hello ${data.userName},</p>

    <p>We've received your payment and it's currently being confirmed on the blockchain.</p>

    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #333; font-size: 18px; margin-top: 0;">Payment Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.amount} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Network:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.network}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Purpose:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.purpose}</td>
        </tr>
        ${
          data.packageType
            ? `<tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Package Type:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.packageType}</td>
        </tr>`
            : ''
        }
        ${
          data.botType
            ? `<tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Bot Type:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.botType}</td>
        </tr>`
            : ''
        }
        <tr>
          <td style="padding: 10px 0;"><strong>Transaction Hash:</strong></td>
          <td style="padding: 10px 0; text-align: right; word-break: break-all; font-size: 12px;">${data.txHash}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0;"><strong>⏳ Confirmation in Progress</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your payment is being confirmed on the blockchain. This typically takes a few minutes. We'll send you another email once the payment is fully confirmed.</p>
    </div>

    <p style="margin-top: 30px;">You can track the status of your payment in your dashboard or by clicking the button below:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments"
         style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Payment Status
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      If you have any questions or concerns, please don't hesitate to contact our support team.
    </p>

    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NSC Bot Platform Team</strong>
    </p>
  </div>
</body>
</html>
  `
}

/**
 * Payment Confirmed Email Template
 */
export function paymentConfirmedTemplate(data: PaymentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #4CAF50; margin-bottom: 20px;">Payment Confirmed! ✅</h1>

    <p>Hello ${data.userName},</p>

    <p>Great news! Your payment has been successfully confirmed on the blockchain.</p>

    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #333; font-size: 18px; margin-top: 0;">Confirmation Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.amount} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Network:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.network}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>Transaction Hash:</strong></td>
          <td style="padding: 10px 0; text-align: right; word-break: break-all; font-size: 12px;">${data.txHash}</td>
        </tr>
      </table>
    </div>

    ${
      data.purpose === 'PACKAGE_PURCHASE'
        ? `<div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0;"><strong>🎉 Package Activated!</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your ${data.packageType} package has been activated and will start generating ROI payments monthly.</p>
    </div>`
        : ''
    }

    ${
      data.purpose === 'BOT_ACTIVATION'
        ? `<div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0;"><strong>🤖 Bot Activated!</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your ${data.botType} bot has been activated and is ready to use. You can now access all bot features from your dashboard.</p>
    </div>`
        : ''
    }

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Go to Dashboard
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      Thank you for choosing NSC Bot Platform! If you have any questions, our support team is always here to help.
    </p>

    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NSC Bot Platform Team</strong>
    </p>
  </div>
</body>
</html>
  `
}

/**
 * Payment Expired Email Template
 */
export function paymentExpiredTemplate(userName: string, amount: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Expired</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #ff9800; margin-bottom: 20px;">Payment Request Expired</h1>

    <p>Hello ${userName},</p>

    <p>Your payment request for ${amount} USDT has expired as we did not receive the payment within the time limit.</p>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0;"><strong>⚠️ No Payment Received</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">If you've already sent the payment, please contact our support team immediately with your transaction hash.</p>
    </div>

    <p>If you still want to proceed, please create a new payment request from your dashboard.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Create New Payment
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      If you need assistance, please contact our support team.
    </p>

    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NSC Bot Platform Team</strong>
    </p>
  </div>
</body>
</html>
  `
}
