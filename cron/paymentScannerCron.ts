// cron/paymentScannerCron.ts
import cron from 'node-cron';
import { BlockchainScannerService } from '@/services/blockchainScanner.service';

let scannerJob: cron.ScheduledTask | null = null;

export function initializePaymentScanner() {
  if (scannerJob) {
    console.log('⚠️  Payment scanner already running');
    return;
  }

  // Run every 2 minutes to scan for new payments
  scannerJob = cron.schedule('*/2 * * * *', async () => {
    console.log('🔍 Running payment scanner...');
    try {
      await BlockchainScannerService.scanPendingPayments();
    } catch (error) {
      console.error('Payment scanner error:', error);
    }
  });

  scannerJob.start();
  console.log('✅ Payment scanner initialized (runs every 2 minutes)');
}

export function stopPaymentScanner() {
  if (scannerJob) {
    scannerJob.stop();
    scannerJob = null;
    console.log('🛑 Payment scanner stopped');
  }
}

// Manual trigger for testing
export async function triggerPaymentScan() {
  console.log('🔄 Manual payment scan triggered');
  await BlockchainScannerService.scanPendingPayments();
}
