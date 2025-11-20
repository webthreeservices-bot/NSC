/**
 * ROI Payout Cron Job
 * Processes monthly ROI payments for active packages
 * Runs daily at midnight to check and process due ROI payments
 */

import cron from 'node-cron'
import pool from '@/lib/db-connection'
import { v4 as uuidv4 } from 'uuid'

let isProcessing = false
let lastRunTime: Date | null = null
let totalProcessed = 0

/**
 * Calculate ROI amount for a package
 * Uses current global ROI percentage from SystemSetting, not package's stored percentage
 */
async function calculateRoiAmount(packageAmount: number, packageType: string): Promise<number> {
  // Fetch current global ROI percentage from SystemSetting
  const settingKey = `${packageType}_ROI_PERCENTAGE`
  const { rows } = await pool.query(
    `SELECT value FROM "SystemSetting" WHERE key = $1`,
    [settingKey]
  )
  
  if (rows.length === 0) {
    console.error(`[ROI Cron] No SystemSetting found for ${settingKey}, using fallback`)
    // Fallback to default percentages if setting not found
    const fallbackPercentages: Record<string, number> = {
      NEO: 3,
      NEURAL: 4,
      ORACLE: 5,
      TEST_1: 3,
      TEST_2: 4,
      TEST_3: 5
    }
    const roiPercentage = fallbackPercentages[packageType] || 3
    return (packageAmount * roiPercentage) / 100
  }
  
  const currentRoiPercentage = parseFloat(rows[0].value)
  return (packageAmount * currentRoiPercentage) / 100
}

/**
 * Process ROI payouts for due packages
 */
async function processRoiPayouts() {
  if (isProcessing) {
    console.log('[ROI Cron] Already processing, skipping...')
    return
  }

  try {
    isProcessing = true
    console.log('[ROI Cron] Starting ROI payout processing...')

    const now = new Date()

    // Get all active packages where nextRoiDate <= now and not expired
    const findDuePackagesQuery = `
      SELECT p.*, u.email, u."fullName", u.username 
      FROM "Package" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p.status = 'ACTIVE'
      AND p."isExpired" = false
      AND p."nextRoiDate" <= $1
    `;

    const { rows: duePackages } = await pool.query(findDuePackagesQuery, [now]);

    console.log(`[ROI Cron] Found ${duePackages.length} packages due for ROI payment`)

    let successCount = 0
    let errorCount = 0

    for (const pkg of duePackages) {
      // Get a dedicated client for this transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if user has an active bot for this package type
        const botCheckQuery = `
          SELECT * FROM "BotActivation"
          WHERE "userId" = $1 
          AND "botType" = $2 
          AND status = 'ACTIVE' 
          AND "isExpired" = false
        `;
        
        const { rows: activeBots } = await client.query(botCheckQuery, [
          pkg.userId,
          pkg.packageType
        ]);

        if (activeBots.length === 0) {
          console.log(
            `[ROI Cron] Skipping package ${pkg.id} - User has no active ${pkg.packageType} bot`
          )
          await client.query('ROLLBACK');
          client.release();
          continue
        }
        
        // Calculate ROI amount using current global SystemSetting, NOT package's stored percentage
        const roiAmount = await calculateRoiAmount(Number(pkg.amount), pkg.packageType)

        // Check if package has reached 12 months (12 ROI payments)
        const currentRoiCount = pkg.roiPaidCount
        const maxRoiPayments = 12

        if (currentRoiCount >= maxRoiPayments) {
          console.log(
            `[ROI Cron] Package ${pkg.id} has reached maximum ROI payments (${maxRoiPayments})`
          )
          // This will be handled by the expiration cron
          await client.query('ROLLBACK');
          client.release();
          continue
        }

        // Create ROI payment record
        const roiPaymentId = uuidv4();
        const createRoiPaymentQuery = `
          INSERT INTO "RoiPayment" (id, "packageId", "userId", amount, "monthNumber", "paymentDate", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        await client.query(createRoiPaymentQuery, [
          roiPaymentId,
          pkg.id,
          pkg.userId,
          roiAmount,
          currentRoiCount + 1,
          now,
          now
        ]);

        // ROI is tracked in Transaction table, not Earning table
        // Earning table only tracks DIRECT_REFERRAL and LEVEL_INCOME

        // Create transaction record for ROI payment
        const transactionId = uuidv4();
        const createTransactionQuery = `
          INSERT INTO "Transaction" (id, "userId", type, amount, status, description, network, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        
        await client.query(createTransactionQuery, [
          transactionId,
          pkg.userId,
          'ROI_PAYMENT',
          roiAmount,
          'COMPLETED',
          `ROI payment month ${currentRoiCount + 1}`,
          pkg.network,
          now,
          now
        ]);

        // Update package
        const nextRoiDate = new Date(now)
        
        // Check if it's a demo package
        const isDemoPackage = ['TEST_1', 'TEST_2', 'TEST_3'].includes(pkg.packageType)
        
        if (isDemoPackage) {
          // For demo packages, next payment is in 15 minutes
          nextRoiDate.setMinutes(nextRoiDate.getMinutes() + 15)
        } else {
          // For regular packages, next payment is in 30 days
          nextRoiDate.setDate(nextRoiDate.getDate() + 30) 
        }

        const updatePackageQuery = `
          UPDATE "Package"
          SET "lastRoiDate" = $1,
              "nextRoiDate" = $2,
              "roiPaidCount" = $3,
              "totalRoiPaid" = $4,
              "updatedAt" = $5
          WHERE id = $6
        `;
        
        await client.query(updatePackageQuery, [
          now,
          nextRoiDate,
          currentRoiCount + 1,
          Number(pkg.totalRoiPaid) + roiAmount,
          now,
          pkg.id
        ]);
        
        // Commit the transaction
        await client.query('COMMIT');

        console.log(
          `[ROI Cron] Processed ROI payment for package ${pkg.id}: ${roiAmount} USDT (Month ${
            currentRoiCount + 1
          })`
        )

        successCount++

        // Send email notification
        try {
          const { sendEmail } = await import('@/lib/email')
          await sendEmail({
            to: pkg.email,
            subject: `ROI Payment Received - Month ${currentRoiCount + 1}`,
            html: generateRoiPaymentEmail(
              pkg.fullName || pkg.username,
              roiAmount,
              currentRoiCount + 1,
              pkg.packageType
            ),
          })
        } catch (emailError) {
          console.error(`[ROI Cron] Failed to send email for package ${pkg.id}:`, emailError)
          // Don't fail the whole process if email fails
        }
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`[ROI Cron] Error processing ROI for package ${pkg.id}:`, error)
        errorCount++
      } finally {
        client.release();
      }
    }

    lastRunTime = now
    totalProcessed += successCount

    console.log(
      `[ROI Cron] ROI payout processing completed: ${successCount} successful, ${errorCount} errors`
    )
  } catch (error) {
    console.error('[ROI Cron] Error during ROI payout processing:', error)
  } finally {
    isProcessing = false
  }
}

/**
 * Generate ROI payment email HTML
 */
function generateRoiPaymentEmail(
  userName: string,
  amount: number,
  monthNumber: number,
  packageType: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ROI Payment Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #28a745; margin-bottom: 20px;">💰 ROI Payment Received!</h1>

    <p>Hello ${userName},</p>

    <p>Your monthly ROI payment has been processed and credited to your account.</p>

    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #333; font-size: 18px; margin-top: 0;">Payment Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #28a745; font-size: 20px; font-weight: bold;">${amount} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Month:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${monthNumber} of 12</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Package Type:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${packageType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>Payment Date:</strong></td>
          <td style="padding: 10px 0; text-align: right;">${new Date().toLocaleDateString()}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0;"><strong>✓ Payment Successful</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">The ROI amount has been credited to your account balance and is available for withdrawal.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Dashboard
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      Your next ROI payment will be processed in 30 days.
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
 * Start the ROI payout cron job
 */
export function startRoiPayoutCron() {
  console.log('[ROI Cron] Initializing ROI payout cron job...')

  // Run every 15 minutes for demo packages
  // The query checks "nextRoiDate <= now", so running it more often is safe
  // Regular packages will only be picked up when their 30 days are up
  const cronJob = cron.schedule('*/15 * * * *', async () => {
    await processRoiPayouts()
  })

  cronJob.start()

  console.log('[ROI Cron] Cron job started - runs daily at midnight')

  // Optional: Run immediately on startup for testing (remove in production)
  // setTimeout(() => processRoiPayouts(), 5000)

  return cronJob
}

/**
 * Get cron status
 */
export function getRoiCronStatus() {
  return {
    isProcessing,
    lastRunTime,
    totalProcessed,
  }
}

/**
 * Manual trigger (for admin)
 */
export async function triggerManualRoiPayout() {
  console.log('[ROI Cron] Manual ROI payout triggered')
  await processRoiPayouts()
  return getRoiCronStatus()
}

export default {
  startRoiPayoutCron,
  getRoiCronStatus,
  triggerManualRoiPayout,
}
