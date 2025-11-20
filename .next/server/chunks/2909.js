"use strict";exports.id=2909,exports.ids=[2909,7108],exports.modules={37108:(a,b,c)=>{c.d(b,{sendEmail:()=>g});var d=c(35924);class e{constructor(){this.transporter=d.createTransport({host:process.env.SMTP_HOST,port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})}async sendEmail(a){try{let b={from:process.env.SMTP_FROM||"NSC Bot Platform <noreply@nscbot.com>",to:a.to,subject:a.subject,html:a.html,text:a.text};return await this.transporter.sendMail(b),console.log(`Email sent successfully to ${a.to}`),!0}catch(a){return console.error("Email sending failed:",a),!1}}async sendVerificationEmail(a,b){let c=`http://localhost:3000/verify-email?token=${b}`,d=`
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
            <a href="${c}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00ff00;">${c}</p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <div class="footer">
            <p>If you didn't create an account with NSC Bot Platform, please ignore this email.</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({to:a,subject:"Verify Your Email - NSC Bot Platform",html:d,text:`Welcome to NSC Bot Platform! Please verify your email by visiting: ${c}`})}async sendPasswordResetEmail(a,b){let c=`http://localhost:3000/reset-password?token=${b}`,d=`
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
            <a href="${c}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00ff00;">${c}</p>
          
          <p>This reset link will expire in 1 hour for security reasons.</p>
          
          <div class="footer">
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({to:a,subject:"Reset Your Password - NSC Bot Platform",html:d,text:`Reset your NSC Bot Platform password by visiting: ${c}`})}async sendWelcomeEmail(a,b){let c="http://localhost:3000/login",d=`
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
          
          <h2>Welcome to NSC Bot Platform, ${b}!</h2>
          
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
            <a href="${c}" class="button">Access Your Dashboard</a>
          </div>
          
          <div class="feature">
            <h3 style="color: #00ff00; margin-top: 0;">💰 Investment Packages</h3>
            <p><strong>NEO:</strong> $500-$3,000 | 3% monthly ROI</p>
            <p><strong>NEURAL:</strong> $5,000-$10,000 | 4% monthly ROI</p>
            <p><strong>ORACLE:</strong> $25,000-$50,000 | 5% monthly ROI</p>
          </div>
          
          <div class="footer">
            <p>Need help? Contact our support team at ${process.env.SUPPORT_EMAIL||"support@nscbot.com"}</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({to:a,subject:"Welcome to NSC Bot Platform - Start Your Journey!",html:d,text:`Welcome to NSC Bot Platform, ${b}! Your account is ready. Login at: ${c}`})}async sendWithdrawalNotification(a,b,c){let d=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Withdrawal ${c} - NSC Bot Platform</title>
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
          
          <div class="status ${c.toLowerCase()}">
            Withdrawal ${c.toUpperCase()}: $${b} USDT
          </div>
          
          <p>Your withdrawal request for $${b} USDT has been ${c.toLowerCase()}.</p>
          
          ${"APPROVED"===c?"<p>Your funds have been processed and sent to your wallet address. Please check your wallet and allow up to 30 minutes for the transaction to confirm on the blockchain.</p>":"REJECTED"===c?"<p>Your withdrawal request was rejected. Please contact support for more information or check your dashboard for details.</p>":"<p>Your withdrawal request is being reviewed by our team. You will receive another notification once it has been processed.</p>"}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a>
          </div>
          
          <div class="footer">
            <p>Questions? Contact support at ${process.env.SUPPORT_EMAIL||"support@nscbot.com"}</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({to:a,subject:`Withdrawal ${c} - NSC Bot Platform`,html:d,text:`Your withdrawal request for $${b} USDT has been ${c.toLowerCase()}.`})}}let f=new e,g=f.sendEmail.bind(f)},43543:(a,b,c)=>{function d(a){return`
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

    <p>Hello ${a.userName},</p>

    <p>We've received your payment and it's currently being confirmed on the blockchain.</p>

    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #333; font-size: 18px; margin-top: 0;">Payment Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${a.amount} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Network:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${a.network}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Purpose:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${a.purpose}</td>
        </tr>
        ${a.packageType?`<tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Package Type:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${a.packageType}</td>
        </tr>`:""}
        ${a.botType?`<tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Bot Type:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${a.botType}</td>
        </tr>`:""}
        <tr>
          <td style="padding: 10px 0;"><strong>Transaction Hash:</strong></td>
          <td style="padding: 10px 0; text-align: right; word-break: break-all; font-size: 12px;">${a.txHash}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0;"><strong>⏳ Confirmation in Progress</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your payment is being confirmed on the blockchain. This typically takes a few minutes. We'll send you another email once the payment is fully confirmed.</p>
    </div>

    <p style="margin-top: 30px;">You can track the status of your payment in your dashboard or by clicking the button below:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/dashboard/payments"
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
  `}function e(a){return`
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

    <p>Hello ${a.userName},</p>

    <p>Great news! Your payment has been successfully confirmed on the blockchain.</p>

    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #333; font-size: 18px; margin-top: 0;">Confirmation Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${a.amount} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Network:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${a.network}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>Transaction Hash:</strong></td>
          <td style="padding: 10px 0; text-align: right; word-break: break-all; font-size: 12px;">${a.txHash}</td>
        </tr>
      </table>
    </div>

    ${"PACKAGE_PURCHASE"===a.purpose?`<div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0;"><strong>🎉 Package Activated!</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your ${a.packageType} package has been activated and will start generating ROI payments monthly.</p>
    </div>`:""}

    ${"BOT_ACTIVATION"===a.purpose?`<div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0;"><strong>🤖 Bot Activated!</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your ${a.botType} bot has been activated and is ready to use. You can now access all bot features from your dashboard.</p>
    </div>`:""}

    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/dashboard"
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
  `}function f(a,b){return`
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

    <p>Hello ${a},</p>

    <p>Your payment request for ${b} USDT has expired as we did not receive the payment within the time limit.</p>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0;"><strong>⚠️ No Payment Received</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">If you've already sent the payment, please contact our support team immediately with your transaction hash.</p>
    </div>

    <p>If you still want to proceed, please create a new payment request from your dashboard.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/dashboard"
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
  `}c.d(b,{Ar:()=>f,K0:()=>e,kT:()=>d})},92909:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{sendPaymentConfirmedEmail:()=>j,sendPaymentReceivedEmail:()=>i});var e=c(37108),f=c(43543),g=c(8216),h=a([g]);async function i(a,b,c){try{let d=await (0,g.Zy)('SELECT * FROM "User" WHERE id = $1',[a]);if(!d)throw Error("User not found");let h=await (0,g.Zy)('SELECT * FROM "PaymentRequest" WHERE id = $1',[b]);if(!h)throw Error("Payment request not found");let i=h.metadata||{},j={userName:d.fullName||d.username,amount:Number(h.amount),network:h.network,txHash:c,purpose:"PACKAGE_PURCHASE"===h.purpose?"Package Purchase":"BOT_ACTIVATION"===h.purpose?"Bot Activation":"Manual Deposit",packageType:i.packageType,botType:i.botType};await (0,e.sendEmail)({to:d.email,subject:"Payment Received - Confirmation in Progress",html:(0,f.kT)(j)}),console.log(`Payment received email sent to ${d.email}`)}catch(a){console.error("Error sending payment received email:",a)}}async function j(a,b,c){try{let d=await (0,g.Zy)('SELECT * FROM "User" WHERE id = $1',[a]);if(!d)throw Error("User not found");let h=await (0,g.Zy)('SELECT * FROM "PaymentRequest" WHERE id = $1',[b]);if(!h)throw Error("Payment request not found");let i=h.metadata||{},j={userName:d.fullName||d.username,amount:Number(h.amount),network:h.network,txHash:c,purpose:"PACKAGE_PURCHASE"===h.purpose?"Package Purchase":"BOT_ACTIVATION"===h.purpose?"Bot Activation":"Manual Deposit",packageType:i.packageType,botType:i.botType};await (0,e.sendEmail)({to:d.email,subject:"Payment Confirmed - Account Activated!",html:(0,f.K0)(j)}),console.log(`Payment confirmed email sent to ${d.email}`)}catch(a){console.error("Error sending payment confirmed email:",a)}}g=(h.then?(await h)():h)[0],d()}catch(a){d(a)}})}};