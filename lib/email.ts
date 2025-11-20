import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'NSC Bot Platform <noreply@nscbot.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Email sent successfully to ${options.to}`)
      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - NSC Bot Platform</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 10px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #00ff00; font-size: 24px; font-weight: bold; }
          .button { display: inline-block; background-color: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NSC Bot Platform</div>
          </div>
          
          <h2>Verify Your Email Address</h2>
          
          <p>Welcome to NSC Bot Platform! Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00ff00;">${verificationUrl}</p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <div class="footer">
            <p>If you didn't create an account with NSC Bot Platform, please ignore this email.</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - NSC Bot Platform',
      html,
      text: `Welcome to NSC Bot Platform! Please verify your email by visiting: ${verificationUrl}`
    })
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - NSC Bot Platform</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 10px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #00ff00; font-size: 24px; font-weight: bold; }
          .button { display: inline-block; background-color: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NSC Bot Platform</div>
          </div>
          
          <h2>Reset Your Password</h2>
          
          <p>We received a request to reset your password for your NSC Bot Platform account.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00ff00;">${resetUrl}</p>
          
          <p>This reset link will expire in 1 hour for security reasons.</p>
          
          <div class="footer">
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - NSC Bot Platform',
      html,
      text: `Reset your NSC Bot Platform password by visiting: ${resetUrl}`
    })
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to NSC Bot Platform</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 10px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #00ff00; font-size: 24px; font-weight: bold; }
          .button { display: inline-block; background-color: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .feature { margin: 15px 0; padding: 15px; background-color: #1a1a1a; border-radius: 5px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NSC Bot Platform</div>
          </div>
          
          <h2>Welcome to NSC Bot Platform, ${fullName}!</h2>
          
          <p>Congratulations! Your account has been successfully created and verified.</p>
          
          <div class="feature">
            <h3 style="color: #00ff00; margin-top: 0;">🚀 What's Next?</h3>
            <ul>
              <li>Explore our investment packages (NEO, NEURAL, ORACLE)</li>
              <li>Activate trading bots to earn referral commissions</li>
              <li>Build your network and earn up to 6 levels deep</li>
              <li>Start earning monthly ROI on your investments</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Access Your Dashboard</a>
          </div>
          
          <div class="feature">
            <h3 style="color: #00ff00; margin-top: 0;">💰 Investment Packages</h3>
            <p><strong>NEO:</strong> $500-$3,000 | 3% monthly ROI</p>
            <p><strong>NEURAL:</strong> $5,000-$10,000 | 4% monthly ROI</p>
            <p><strong>ORACLE:</strong> $25,000-$50,000 | 5% monthly ROI</p>
          </div>
          
          <div class="footer">
            <p>Need help? Contact our support team at ${process.env.SUPPORT_EMAIL || 'support@nscbot.com'}</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: 'Welcome to NSC Bot Platform - Start Your Journey!',
      html,
      text: `Welcome to NSC Bot Platform, ${fullName}! Your account is ready. Login at: ${loginUrl}`
    })
  }

  async sendWithdrawalNotification(email: string, amount: number, status: string): Promise<boolean> {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Withdrawal ${status} - NSC Bot Platform</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 10px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #00ff00; font-size: 24px; font-weight: bold; }
          .status { padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-weight: bold; }
          .approved { background-color: #00ff00; color: #000; }
          .rejected { background-color: #ff4444; color: #fff; }
          .pending { background-color: #ffaa00; color: #000; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NSC Bot Platform</div>
          </div>
          
          <h2>Withdrawal Update</h2>
          
          <div class="status ${status.toLowerCase()}">
            Withdrawal ${status.toUpperCase()}: $${amount} USDT
          </div>
          
          <p>Your withdrawal request for $${amount} USDT has been ${status.toLowerCase()}.</p>
          
          ${status === 'APPROVED' ? 
            '<p>Your funds have been processed and sent to your wallet address. Please check your wallet and allow up to 30 minutes for the transaction to confirm on the blockchain.</p>' :
            status === 'REJECTED' ? 
            '<p>Your withdrawal request was rejected. Please contact support for more information or check your dashboard for details.</p>' :
            '<p>Your withdrawal request is being reviewed by our team. You will receive another notification once it has been processed.</p>'
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a>
          </div>
          
          <div class="footer">
            <p>Questions? Contact support at ${process.env.SUPPORT_EMAIL || 'support@nscbot.com'}</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `Withdrawal ${status} - NSC Bot Platform`,
      html,
      text: `Your withdrawal request for $${amount} USDT has been ${status.toLowerCase()}.`
    })
  }
}

export const emailService = new EmailService()
export const sendEmail = emailService.sendEmail.bind(emailService)
export default emailService
