import pool, { getClientWithTimeout } from '@/lib/db-connection'
import { getNextRoiDate } from '@/utils/calculations'
import { sendRoiNotificationEmail } from '@/utils/email'
import { v4 as uuidv4 } from 'uuid'

/**
 * Distribute monthly ROI to all active packages
 * This runs as a cron job
 */
export async function distributeMonthlyRoi(): Promise<void> {
  const today = new Date()

  // Get a client for the entire operation to use advisory lock
  let mainClient: Awaited<ReturnType<typeof getClientWithTimeout>>;
  try {
    mainClient = await getClientWithTimeout(15000);
  } catch (error) {
    console.error('❌ Failed to get database connection for ROI distribution:', error);
    throw new Error('Database connection timeout during ROI distribution initialization');
  }

  let duePackages: any[] = [];

  try {
    await mainClient.query('BEGIN')

    // CRITICAL: Use PostgreSQL advisory lock to prevent concurrent execution
    // This ensures only one instance of the cron job can run at a time
    const lockResult = await mainClient.query('SELECT pg_try_advisory_xact_lock(123456789) as acquired')

    if (!lockResult.rows[0].acquired) {
      console.log('⚠️ Another ROI distribution process is already running. Skipping.')
      await mainClient.query('ROLLBACK')
      mainClient.release()
      return
    }

    console.log('🔒 Advisory lock acquired for ROI distribution')

    // Get all packages due for ROI payment with row-level lock
    const packagesQuery = `
      SELECT p.*, u.email as user_email, p."roiPercentage"
      FROM "Package" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p.status = 'ACTIVE'
      AND p."isExpired" = false
      AND p."nextRoiDate" <= $1
      AND p."roiPaidCount" < 12
      FOR UPDATE OF p SKIP LOCKED
    `

    const result = await mainClient.query(packagesQuery, [today])
    duePackages = result.rows

    console.log(`Processing ROI for ${duePackages.length} packages`)

    // KEEP THE LOCK - Don't commit yet, process all packages within the lock
    // This prevents race conditions where multiple instances could process same packages
  } catch (error) {
    await mainClient.query('ROLLBACK')
    mainClient.release()
    throw error
  }

  let successCount = 0;
  let errorCount = 0;
  let emailErrorCount = 0;

  for (const pkg of duePackages) {
    let packageClient = null;
    try {
      // Validate package data
      if (!pkg.id || !pkg.userId || !pkg.amount || !pkg.roiPercentage) {
        console.error(`❌ Invalid package data for package ${pkg.id}:`, pkg);
        errorCount++;
        continue;
      }

      // FIX #7: Use package's contracted ROI%, not current DB settings
      const packageAmount = Number(pkg.amount);
      const roiPercentage = Number(pkg.roiPercentage);

      if (isNaN(packageAmount) || isNaN(roiPercentage) || packageAmount <= 0 || roiPercentage <= 0) {
        console.error(`❌ Invalid numeric values for package ${pkg.id}:`, {
          amount: packageAmount,
          roiPercentage: roiPercentage
        });
        errorCount++;
        continue;
      }

      const roiAmount = Number(((packageAmount * roiPercentage) / 100).toFixed(2));
      const nextMonth = pkg.roiPaidCount + 1

      if (roiAmount <= 0 || isNaN(roiAmount)) {
        console.error(`❌ Invalid ROI amount calculated for package ${pkg.id}: ${roiAmount}`);
        errorCount++;
        continue;
      }

      // FIX: Use mainClient to stay within advisory lock transaction
      // This prevents race conditions and ensures consistency
      packageClient = mainClient

      // Create ROI payment record (within main transaction)
      const roiPaymentId = uuidv4()
      await packageClient.query(
        `INSERT INTO "RoiPayment" ("id", "packageId", "userId", "amount", "monthNumber", "paymentDate", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [roiPaymentId, pkg.id, pkg.userId, roiAmount, nextMonth, today, today]
      )

      // Create transaction record
      const transactionId = uuidv4()
      await packageClient.query(
        `INSERT INTO "Transaction" ("id", "userId", "type", "amount", "status", "description", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [transactionId, pkg.userId, 'ROI_PAYMENT', roiAmount, 'COMPLETED', `ROI payment - Month ${nextMonth}`, today, today]
      )

      // Update package
      const nextRoiDate = getNextRoiDate(today, new Date(pkg.investmentDate))
      const isComplete = nextMonth >= 12

      await packageClient.query(
        `UPDATE "Package"
         SET "totalRoiPaid" = "totalRoiPaid" + $1,
             "roiPaidCount" = $2,
             "lastRoiDate" = $3,
             "nextRoiDate" = $4,
             "status" = $5,
             "isExpired" = $6,
             "updatedAt" = $7
         WHERE "id" = $8`,
        [
          roiAmount,
          nextMonth,
          today,
          isComplete ? null : nextRoiDate,
          isComplete ? 'EXPIRED' : 'ACTIVE',
          isComplete,
          today,
          pkg.id
        ]
      )

      successCount++;
      console.log(`✅ Paid ROI: ${roiAmount} USDT to user ${pkg.userId} for package ${pkg.id} (${successCount}/${duePackages.length})`)

      // Send notification email (non-blocking, errors logged but don't stop processing)
      try {
        await sendRoiNotificationEmail(pkg.user_email, roiAmount, nextMonth)
      } catch (emailError) {
        emailErrorCount++;
        console.error(`⚠️  Failed to send email for package ${pkg.id}:`, emailError);
        // Don't throw - email failure shouldn't stop ROI distribution
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error processing ROI for package ${pkg.id}:`, error)
      // Don't throw - continue processing other packages
    }
  }

  // FIX #1: Commit the main transaction and release the advisory lock after all packages processed
  try {
    await mainClient.query('COMMIT')
    console.log(`✅ ROI distribution completed: ${successCount} successful, ${errorCount} failed, ${emailErrorCount} email failures out of ${duePackages.length} total packages`)

    // Alert if there were errors
    if (errorCount > 0) {
      console.warn(`⚠️  WARNING: ${errorCount} packages failed to process. Manual review recommended.`);
    }
    if (emailErrorCount > 0) {
      console.warn(`⚠️  WARNING: ${emailErrorCount} notification emails failed to send.`);
    }
  } catch (error) {
    await mainClient.query('ROLLBACK')
    console.error('❌ Failed to commit ROI distribution transaction:', error);
    throw error
  } finally {
    mainClient.release()
  }
}

/**
 * Calculate user's withdrawable balance
 */
/**
 * Get user's withdrawable balance using optimized SQL view (FAST VERSION)
 * This replaces 5 separate queries with 1 query to the UserStatisticsEnhanced view
 */
export async function getWithdrawableBalanceOptimized(userId: string): Promise<{
  roiBalance: number
  referralBalance: number
  levelBalance: number
  totalBalance: number
  lockedCapital: number
}> {
  try {
    // Use the SQL function that queries the optimized view
    const result = await pool.query('SELECT * FROM get_user_balance($1)', [userId])
    
    if (result.rows.length === 0) {
      // User not found or no data
      return {
        roiBalance: 0,
        referralBalance: 0,
        levelBalance: 0,
        totalBalance: 0,
        lockedCapital: 0
      }
    }
    
    const row = result.rows[0]

    // Safely parse all values with validation
    const roiBalance = Number(row.roiBalance ?? 0) || 0;
    const referralBalance = Number(row.referralBalance ?? 0) || 0;
    const levelBalance = Number(row.levelBalance ?? 0) || 0;
    const totalBalance = Number(row.totalBalance ?? 0) || 0;
    const lockedCapital = Number(row.lockedCapital ?? 0) || 0;

    // Validate all values
    if (isNaN(roiBalance) || isNaN(referralBalance) || isNaN(levelBalance) ||
        isNaN(totalBalance) || isNaN(lockedCapital)) {
      console.error('❌ Invalid optimized balance values:', {
        roiBalance, referralBalance, levelBalance, totalBalance, lockedCapital
      });
      throw new Error('Invalid optimized balance calculation: NaN detected');
    }

    return {
      roiBalance: Number(roiBalance.toFixed(2)),
      referralBalance: Number(referralBalance.toFixed(2)),
      levelBalance: Number(levelBalance.toFixed(2)),
      totalBalance: Math.max(0, Number(totalBalance.toFixed(2))),
      lockedCapital: Number(lockedCapital.toFixed(2))
    }
  } catch (error) {
    console.error('❌ Error getting optimized balance:', error)
    // Fallback to the original method
    console.log('⚠️  Falling back to original method...')
    return getWithdrawableBalance(userId)
  }
}

/**
 * Get user's withdrawable balance (LEGACY VERSION - 5 queries)
 * @deprecated Use getWithdrawableBalanceOptimized() instead for 80%+ performance improvement
 */
export async function getWithdrawableBalance(userId: string): Promise<{
  roiBalance: number
  referralBalance: number
  levelBalance: number
  totalBalance: number
  lockedCapital: number
}> {
  // Retry logic for database operations
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`⚠️  Retry attempt ${attempt}/${maxRetries} for balance calculation`);
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }

      // Prepare all SQL queries
    const roiQuery = `
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount 
      FROM "Transaction" 
      WHERE "userId" = $1 
      AND "type" = 'ROI_PAYMENT' 
      AND "status" = 'COMPLETED'
    `;
    
    const referralQuery = `
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount
      FROM "Earning"
      WHERE "userId" = $1
      AND "earningType" = 'DIRECT_REFERRAL'::"EarningType"
    `;

    const levelQuery = `
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount
      FROM "Earning"
      WHERE "userId" = $1
      AND "earningType" = 'LEVEL_INCOME'::"EarningType"
    `;
    
    const withdrawalQuery = `
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount 
      FROM "Withdrawal" 
      WHERE "userId" = $1 
      AND "status" = 'COMPLETED'
    `;
    
    const capitalQuery = `
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount 
      FROM "Package" 
      WHERE "userId" = $1 
      AND "status" = 'ACTIVE'
    `;
    
    // Execute all queries in parallel for better performance
    const [
      roiResult, 
      referralResult, 
      levelResult, 
      withdrawalResult, 
      capitalResult
    ] = await Promise.all([
      pool.query(roiQuery, [userId]),
      pool.query(referralQuery, [userId]),
      pool.query(levelQuery, [userId]),
      pool.query(withdrawalQuery, [userId]),
      pool.query(capitalQuery, [userId])
    ]);
    
    // Extract and parse the values with safe fallbacks
    const roiBalance = Number(roiResult.rows[0]?.sum_amount ?? 0) || 0;
    const referralBalance = Number(referralResult.rows[0]?.sum_amount ?? 0) || 0;
    const levelBalance = Number(levelResult.rows[0]?.sum_amount ?? 0) || 0;
    const totalWithdrawn = Number(withdrawalResult.rows[0]?.sum_amount ?? 0) || 0;
    const lockedCapital = Number(capitalResult.rows[0]?.sum_amount ?? 0) || 0;

    // Validate all values are valid numbers
    if (isNaN(roiBalance) || isNaN(referralBalance) || isNaN(levelBalance) ||
        isNaN(totalWithdrawn) || isNaN(lockedCapital)) {
      console.error('❌ Invalid balance values detected:', {
        roiBalance, referralBalance, levelBalance, totalWithdrawn, lockedCapital
      });
      throw new Error('Invalid balance calculation: NaN detected');
    }

    // Calculate totals with precision handling
    const totalEarned = Number((roiBalance + referralBalance + levelBalance).toFixed(2));
    const totalBalance = Number((totalEarned - totalWithdrawn).toFixed(2));

      return {
        roiBalance: Number(roiBalance.toFixed(2)),
        referralBalance: Number(referralBalance.toFixed(2)),
        levelBalance: Number(levelBalance.toFixed(2)),
        totalBalance: Math.max(0, totalBalance),
        lockedCapital: Number(lockedCapital.toFixed(2))
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Error calculating withdrawable balance (attempt ${attempt}/${maxRetries}):`, error);

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed to calculate balance after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Continue to next retry attempt
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}
