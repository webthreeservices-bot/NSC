import { query, queryOne, execute } from '@/lib/db';
import { PaymentService } from './payment.service';

export class BlockchainScannerService {
  static async scanPendingPayments(): Promise<void> {
    try {
      // Get all pending payment requests
      const pendingPayments = await query(
        `SELECT * FROM "PaymentRequest" WHERE status = 'PENDING'`
      );

      console.log(`📡 Scanning ${pendingPayments.length} pending payments...`);

      for (const payment of pendingPayments) {
        if (!payment.transactionHash || !payment.network) {
          continue;
        }

        try {
          const verification = await PaymentService.verifyTransaction(
            payment.transactionHash,
            payment.network as any,
            payment.walletAddress,
            Number(payment.amount)
          );

          if (verification.verified) {
            console.log(`✅ Payment verified: ${payment.id} - ${payment.amount} USDT`);

            // Update payment request status
            await execute(
              `UPDATE "PaymentRequest"
               SET status = 'CONFIRMED',
                   "confirmedAt" = $1,
                   confirmations = $2,
                   "updatedAt" = $3
               WHERE id = $4`,
              [new Date(), verification.confirmations, new Date(), payment.id]
            );

            // Create payment confirmation record
            await queryOne(
              `INSERT INTO "PaymentConfirmation" (
                id, "paymentRequestId", "transactionHash", network, confirmations, "verifiedAt", "createdAt", "updatedAt"
              ) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7) RETURNING *`,
              [
                payment.id,
                payment.transactionHash,
                payment.network,
                verification.confirmations,
                new Date(),
                new Date(),
                new Date()
              ]
            );

            // Process associated package/bot activation
            if (payment.metadata?.packageId) {
              await this.processPackageActivation(payment.userId, payment.metadata.packageId);
            }
          }
        } catch (error) {
          console.error(`Error verifying payment ${payment.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error scanning pending payments:', error);
      throw error;
    }
  }

  static async processPackageActivation(userId: string, packageId: string): Promise<void> {
    try {
      // Activate package
      await execute(
        `UPDATE "Package"
         SET status = 'ACTIVE',
             "activatedAt" = $1,
             "expiryDate" = $2,
             "updatedAt" = $3
         WHERE id = $4 AND "userId" = $5`,
        [
          new Date(),
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          new Date(),
          packageId,
          userId
        ]
      );

      console.log(`✅ Package ${packageId} activated for user ${userId}`);
    } catch (error) {
      console.error('Error activating package:', error);
      throw error;
    }
  }

  static async updateScanState(network: string, lastScannedBlock: number): Promise<void> {
    await execute(
      `INSERT INTO "BlockchainScanState" (
        id, network, "lastScannedBlock", "lastScanAt", "createdAt", "updatedAt"
      ) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)
      ON CONFLICT (network)
      DO UPDATE SET
        "lastScannedBlock" = $2,
        "lastScanAt" = $3,
        "updatedAt" = $5`,
      [network, lastScannedBlock, new Date(), new Date(), new Date()]
    );
  }

  static async getScanState(network: string) {
    return await queryOne(
      `SELECT * FROM "BlockchainScanState" WHERE network = $1`,
      [network]
    );
  }
}
