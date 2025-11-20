import cron from 'node-cron'
import { distributeMonthlyRoi } from '@/services/roiService'
import { checkBotExpiry, checkPackageExpiry } from '@/services/botService'
import pool from '@/lib/db-connection'
import { v4 as uuidv4 } from 'uuid'

/**
 * Initialize essential cron jobs only
 * All times are in IST (UTC+5:30)
 * 
 * Only automated tasks that MUST run automatically:
 * 1. ROI Distribution - Core business function
 * 2. Bot Expiry - Business logic integrity
 * 3. Package Expiry - Business logic integrity
 */
export function initializeCronJobs(): void {
  console.log('🚀 Initializing essential cron jobs...')
  console.log('⏰ Timezone: IST (UTC+5:30)')
  
  // 1. ROI Distribution - Daily at 05:30 IST (00:00 UTC)
  cron.schedule('0 0 * * *', async () => {
    console.log('\n🕐 [05:30 IST] Running daily ROI distribution...')
    try {
      await distributeMonthlyRoi()
      console.log('✅ ROI distribution completed successfully')
      await logCronExecution('ROI_DISTRIBUTION', 'SUCCESS')
    } catch (error) {
      console.error('❌ ROI distribution failed:', error)
      await logCronExecution('ROI_DISTRIBUTION', 'FAILED', error)
    }
  }, {
    timezone: 'UTC'
  })
  
  // 2. Bot Expiry Checker - Daily at 06:30 IST (01:00 UTC)
  cron.schedule('0 1 * * *', async () => {
    console.log('\n🕐 [06:30 IST] Checking bot expiry...')
    try {
      await checkBotExpiry()
      console.log('✅ Bot expiry check completed')
      await logCronExecution('BOT_EXPIRY_CHECK', 'SUCCESS')
    } catch (error) {
      console.error('❌ Bot expiry check failed:', error)
      await logCronExecution('BOT_EXPIRY_CHECK', 'FAILED', error)
    }
  }, {
    timezone: 'UTC'
  })
  
  // 3. Package Expiry Checker - Daily at 07:30 IST (02:00 UTC)
  cron.schedule('0 2 * * *', async () => {
    console.log('\n🕐 [07:30 IST] Checking package expiry...')
    try {
      await checkPackageExpiry()
      console.log('✅ Package expiry check completed')
      await logCronExecution('PACKAGE_EXPIRY_CHECK', 'SUCCESS')
    } catch (error) {
      console.error('❌ Package expiry check failed:', error)
      await logCronExecution('PACKAGE_EXPIRY_CHECK', 'FAILED', error)
    }
  }, {
    timezone: 'UTC'
  })
  
  console.log('\n✅ Essential cron jobs initialized successfully')
  console.log('📅 Schedule:')
  console.log('   - ROI Distribution: Daily at 05:30 IST')
  console.log('   - Bot Expiry Check: Daily at 06:30 IST')
  console.log('   - Package Expiry Check: Daily at 07:30 IST')
  console.log('\n💡 Note: Database backups, health monitoring, and email digests')
  console.log('   should be handled by managed services or admin dashboard.\n')
}


/**
 * Log cron execution
 */
async function logCronExecution(
  jobName: string,
  status: 'SUCCESS' | 'FAILED',
  error?: any
): Promise<void> {
  try {
    const logId = uuidv4();
    const now = new Date();
    const metadata = error ? JSON.stringify({ error: error.message }) : '{}';
    
    const query = `
      INSERT INTO "AdminLog" (id, "adminId", action, description, metadata, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await pool.query(query, [
      logId,
      'SYSTEM',
      `CRON_${jobName}`,
      `Cron job ${jobName} ${status}`,
      metadata,
      now
    ]);
  } catch (err) {
    // Silent fail - don't break cron if logging fails
    console.error('Failed to log cron execution:', err);
  }
}
