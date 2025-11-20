/**
 * Expiration Checker Cron Job
 * Checks and processes expired packages and bots
 * - Marks expired packages and returns capital
 * - Marks expired bot activations
 * Runs daily at 1:00 AM
 */

import cron from 'node-cron'
import pool from '@/lib/db-connection'
import { v4 as uuidv4 } from 'uuid'

let isProcessing = false
let lastRunTime: Date | null = null
let packagesExpired = 0
let botsExpired = 0

/**
 * Process expired packages
 */
async function processExpiredPackages() {
  try {
    const now = new Date()

    // Find packages that have expired (expiryDate <= now AND not already marked as expired)
    const findExpiredPackagesQuery = `
      SELECT p.*, u.email, u."fullName", u.username 
      FROM "Package" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p.status = 'ACTIVE'
      AND p."isExpired" = false
      AND p."expiryDate" <= $1
    `

    const { rows: expiredPackages } = await pool.query(findExpiredPackagesQuery, [now])

    console.log(
      `[Expiration Cron] Found ${expiredPackages.length} packages to expire and return capital`
    )

    let successCount = 0
    let errorCount = 0

    for (const pkg of expiredPackages) {
      // Use a transaction for atomicity
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        
        const capitalAmount = Number(pkg.amount)

        // Mark package as expired
        const updatePackageQuery = `
          UPDATE "Package"
          SET status = 'EXPIRED',
              "isExpired" = true,
              "updatedAt" = $1
          WHERE id = $2
        `
        await client.query(updatePackageQuery, [now, pkg.id])

        // Create capital return transaction
        const transactionId = uuidv4()
        const createTransactionQuery = `
          INSERT INTO "Transaction" (
            id, "userId", type, amount, status, description, network, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `
        await client.query(createTransactionQuery, [
          transactionId,
          pkg.userId,
          'CAPITAL_RETURN',
          capitalAmount,
          'COMPLETED',
          `Capital return for expired ${pkg.packageType} package`,
          pkg.network,
          now,
          now
        ])

        // Create earning record for capital return
        const earningId = uuidv4()
        const createEarningQuery = `
          INSERT INTO "Earning" (
            id, "userId", amount, type, "packageId", description, "createdAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `
        await client.query(createEarningQuery, [
          earningId,
          pkg.userId,
          capitalAmount,
          'ROI', // Using ROI type as there's no CAPITAL_RETURN type
          pkg.id,
          `Capital return - ${pkg.packageType} package expired after 12 months`,
          now
        ])

        // Commit the transaction
        await client.query('COMMIT')

        console.log(
          `[Expiration Cron] Expired package ${pkg.id} and returned capital: ${capitalAmount} USDT`
        )

        successCount++

        // Send email notification
        try {
          const { sendEmail } = await import('@/lib/email')
          await sendEmail({
            to: pkg.email,
            subject: 'Package Completed - Capital Returned',
            html: generateCapitalReturnEmail(
              pkg.fullName || pkg.username,
              capitalAmount,
              Number(pkg.totalRoiPaid),
              pkg.packageType
            ),
          })
        } catch (emailError) {
          console.error(
            `[Expiration Cron] Failed to send email for package ${pkg.id}:`,
            emailError
          )
        }
      } catch (error) {
        await client.query('ROLLBACK')
        console.error(`[Expiration Cron] Error expiring package ${pkg.id}:`, error)
        errorCount++
      } finally {
        client.release()
      }
    }

    packagesExpired += successCount

    console.log(
      `[Expiration Cron] Package expiration completed: ${successCount} expired, ${errorCount} errors`
    )

    return { success: successCount, errors: errorCount }
  } catch (error) {
    console.error('[Expiration Cron] Error processing expired packages:', error)
    throw error
  }
}

/**
 * Process expired bot activations
 */
async function processExpiredBots() {
  try {
    const now = new Date()

    // Find bots that have expired
    const findExpiredBotsQuery = `
      SELECT b.*, u.email, u."fullName", u.username 
      FROM "BotActivation" b
      JOIN "User" u ON b."userId" = u.id
      WHERE b.status = 'ACTIVE'
      AND b."isExpired" = false
      AND b."expiryDate" <= $1
    `

    const { rows: expiredBots } = await pool.query(findExpiredBotsQuery, [now])

    console.log(`[Expiration Cron] Found ${expiredBots.length} bots to expire`)

    let successCount = 0
    let errorCount = 0

    for (const bot of expiredBots) {
      // Get a client from the pool for transaction
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        
        // Mark bot as expired
        const updateBotQuery = `
          UPDATE "BotActivation"
          SET status = 'EXPIRED',
              "isExpired" = true,
              "updatedAt" = $1
          WHERE id = $2
        `
        await client.query(updateBotQuery, [now, bot.id])
        
        // Commit the transaction
        await client.query('COMMIT')

        console.log(`[Expiration Cron] Expired bot ${bot.id} (${bot.botType})`)

        successCount++

        // Send email notification
        try {
          const { sendEmail } = await import('@/lib/email')
          await sendEmail({
            to: bot.email,
            subject: `${bot.botType} Bot Subscription Expired`,
            html: generateBotExpirationEmail(
              bot.fullName || bot.username,
              bot.botType,
              new Date(bot.expiryDate).toLocaleDateString()
            ),
          })
        } catch (emailError) {
          console.error(`[Expiration Cron] Failed to send email for bot ${bot.id}:`, emailError)
        }
      } catch (error) {
        await client.query('ROLLBACK')
        console.error(`[Expiration Cron] Error expiring bot ${bot.id}:`, error)
        errorCount++
      } finally {
        client.release()
      }
    }

    botsExpired += successCount

    console.log(
      `[Expiration Cron] Bot expiration completed: ${successCount} expired, ${errorCount} errors`
    )

    return { success: successCount, errors: errorCount }
  } catch (error) {
    console.error('[Expiration Cron] Error processing expired bots:', error)
    throw error
  }
}

/**
 * Main expiration processing function
 */
async function processExpirations() {
  if (isProcessing) {
    console.log('[Expiration Cron] Already processing, skipping...')
    return
  }

  try {
    isProcessing = true
    console.log('[Expiration Cron] Starting expiration processing...')

    const [packageResults, botResults] = await Promise.all([
      processExpiredPackages(),
      processExpiredBots(),
    ])

    lastRunTime = new Date()

    console.log('[Expiration Cron] Expiration processing completed')
    console.log(`  - Packages: ${packageResults.success} expired`)
    console.log(`  - Bots: ${botResults.success} expired`)
  } catch (error) {
    console.error('[Expiration Cron] Error during expiration processing:', error)
  } finally {
    isProcessing = false
  }
}

/**
 * Generate capital return email
 */
function generateCapitalReturnEmail(
  userName: string,
  capitalAmount: number,
  totalRoiPaid: number,
  packageType: string
): string {
  const totalReturn = capitalAmount + totalRoiPaid

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Package Completed - Capital Returned</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #28a745; margin-bottom: 20px;">🎉 Package Completed - Capital Returned!</h1>

    <p>Hello ${userName},</p>

    <p>Your ${packageType} package has completed its 12-month term. Your capital has been returned to your account!</p>

    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #333; font-size: 18px; margin-top: 0;">Investment Summary</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Original Investment:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${capitalAmount} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Total ROI Received:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #28a745;">+${totalRoiPaid} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Capital Returned:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #28a745;">+${capitalAmount} USDT</td>
        </tr>
        <tr style="font-weight: bold; font-size: 18px;">
          <td style="padding: 15px 0;"><strong>Total Return:</strong></td>
          <td style="padding: 15px 0; text-align: right; color: #28a745;">${totalReturn} USDT</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0;"><strong>✓ Capital Available for Withdrawal</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your capital of ${capitalAmount} USDT is now available in your account balance and can be withdrawn or reinvested in a new package.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/withdraw"
         style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
        Withdraw Funds
      </a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing"
         style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Invest Again
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      Thank you for investing with NSC Bot Platform! We hope you had a great experience with your ${packageType} package.
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
 * Generate bot expiration email
 */
function generateBotExpirationEmail(
  userName: string,
  botType: string,
  expiryDate: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bot Subscription Expired</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #ff9800; margin-bottom: 20px;">🤖 Bot Subscription Expired</h1>

    <p>Hello ${userName},</p>

    <p>Your ${botType} bot subscription has expired as of ${expiryDate}.</p>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0;"><strong>⚠️ Access Restricted</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your bot features are now inactive. To continue using the ${botType} bot, please renew your subscription.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bots"
         style="background-color: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Renew Subscription
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      If you have any questions, please contact our support team.
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
 * Start the expiration cron job
 */
export function startExpirationCron() {
  console.log('[Expiration Cron] Initializing expiration cron job...')

  // Run daily at 1:00 AM
  const cronJob = cron.schedule('0 1 * * *', async () => {
    await processExpirations()
  })

  cronJob.start()

  console.log('[Expiration Cron] Cron job started - runs daily at 1:00 AM')

  return cronJob
}

/**
 * Get cron status
 */
export function getExpirationCronStatus() {
  return {
    isProcessing,
    lastRunTime,
    packagesExpired,
    botsExpired,
  }
}

/**
 * Manual trigger (for admin)
 */
export async function triggerManualExpiration() {
  console.log('[Expiration Cron] Manual expiration check triggered')
  await processExpirations()
  return getExpirationCronStatus()
}

export default {
  startExpirationCron,
  getExpirationCronStatus,
  triggerManualExpiration,
}
