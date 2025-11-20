import nodemailer from 'nodemailer'
import { PackageType } from '@/types'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function sendRoiNotificationEmail(
  email: string,
  amount: number,
  month: number
): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `ROI Payment - Month ${month}`,
    html: `
      <h2>ROI Payment Received</h2>
      <p>Your monthly ROI payment has been credited to your account.</p>
      <p><strong>Amount:</strong> ${amount} USDT</p>
      <p><strong>Month:</strong> ${month}/12</p>
    `
  })
}

export async function sendPackageActivationEmail(
  email: string,
  amount: number,
  packageType: PackageType
): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Package Activated Successfully',
    html: `
      <h2>Package Activated</h2>
      <p>Your investment package has been activated successfully.</p>
      <p><strong>Amount:</strong> ${amount} USDT</p>
      <p><strong>Type:</strong> ${packageType}</p>
      <p><strong>Duration:</strong> 12 months</p>
    `
  })
}

export async function sendWithdrawalConfirmationEmail(
  email: string,
  amount: number,
  txHash: string
): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Withdrawal Processed',
    html: `
      <h2>Withdrawal Completed</h2>
      <p>Your withdrawal has been processed successfully.</p>
      <p><strong>Amount:</strong> ${amount} USDT</p>
      <p><strong>Transaction Hash:</strong> ${txHash}</p>
    `
  })
}

export async function sendEmailVerification(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `
  })
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  })
}

export async function notifyAdminNewWithdrawal(withdrawal: any): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Withdrawal Request',
    html: `
      <h2>New Withdrawal Request</h2>
      <p><strong>User:</strong> ${withdrawal.userId}</p>
      <p><strong>Amount:</strong> ${withdrawal.amount} USDT</p>
      <p><strong>Net Amount:</strong> ${withdrawal.netAmount} USDT</p>
      <p><strong>Wallet:</strong> ${withdrawal.walletAddress}</p>
      <p><strong>Network:</strong> ${withdrawal.network}</p>
    `
  })
}

export async function sendAdminReminderEmail(withdrawal: any): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: 'Pending Withdrawal Reminder',
    html: `
      <h2>Pending Withdrawal Reminder</h2>
      <p>The following withdrawal has been pending for more than 24 hours:</p>
      <p><strong>ID:</strong> ${withdrawal.id}</p>
      <p><strong>Amount:</strong> ${withdrawal.netAmount} USDT</p>
      <p><strong>User:</strong> ${withdrawal.user.email}</p>
    `
  })
}
