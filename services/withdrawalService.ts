import { canWithdraw, calculateWithdrawalFee } from '@/utils/calculations'
import { getWithdrawableBalanceOptimized } from './roiService'
import { sendWithdrawalConfirmationEmail, notifyAdminNewWithdrawal } from '@/utils/email'
import { WithdrawalType, Network } from '@/types'
import pool, { getClientWithTimeout } from '@/lib/db-connection'
import { v4 as uuidv4 } from 'uuid'
import { sendUsdt } from '@/lib/blockchain'

/**
 * Process withdrawal request
 */
export async function createWithdrawal(
  userId: string,
  amount: number,
  type: WithdrawalType,
  walletAddress: string,
  network: Network,
  txHash: string
): Promise<any> {
  // Check minimum withdrawal
  if (amount < 20) {
    throw new Error('Minimum withdrawal is $20 USDT')
  }
  
  // Check withdrawal eligibility (30 days rule)
  const lastWithdrawalQuery = `
    SELECT * FROM "Withdrawal"
    WHERE "userId" = $1 AND status = 'COMPLETED'::"WithdrawalStatus"
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;
  
  const { rows: lastWithdrawals } = await pool.query(lastWithdrawalQuery, [userId]);
  const lastWithdrawal = lastWithdrawals.length > 0 ? lastWithdrawals[0] : null;
  
  if (lastWithdrawal && !canWithdraw(new Date(lastWithdrawal.createdAt))) {
    const nextDate = new Date(lastWithdrawal.createdAt)
    nextDate.setDate(nextDate.getDate() + 30)
    throw new Error(`Next withdrawal available on ${nextDate.toDateString()}`)
  }
  
  // Get withdrawable balance
  const balance = await getWithdrawableBalanceOptimized(userId)
  
  // Validate withdrawal type and amount
  if (type === WithdrawalType.ROI_ONLY && amount > balance.totalBalance) {
    throw new Error('Insufficient balance')
  }
  
  if (type === WithdrawalType.CAPITAL) {
    // Check if any packages are expired and capital is unlocked
    const expiredPackagesQuery = `
      SELECT * FROM "Package"
      WHERE "userId" = $1
      AND status = 'EXPIRED'::"PackageStatus"
      AND "isExpired" = true
    `;
    
    const { rows: expiredPackages } = await pool.query(expiredPackagesQuery, [userId]);
    
    const availableCapital = expiredPackages.reduce(
      (sum, pkg) => sum + Number(pkg.amount),
      0
    );
    
    if (amount > availableCapital) {
      throw new Error('Capital not yet unlocked or insufficient');
    }
  }
  
  // Calculate fee and net amount
  const fee = calculateWithdrawalFee(amount);
  const netAmount = amount - fee;
  
  // Create withdrawal request
  const withdrawalId = uuidv4();
  const now = new Date();
  
  const createWithdrawalQuery = `
    INSERT INTO "Withdrawal" (
      id, "userId", amount, fee, "netAmount",
      "type", "walletAddress", network,
      status, "requestDate", "createdAt", "updatedAt", "txHash"
    ) VALUES ($1, $2, $3, $4, $5, $6::"WithdrawalType", $7, $8::"Network", $9::"WithdrawalStatus", $10, $11, $12, $13)
    RETURNING *
  `;

  const { rows } = await pool.query(createWithdrawalQuery, [
    withdrawalId,
    userId,
    amount,
    fee,
    netAmount,
    type,
    walletAddress,
    network,
    'PENDING',
    now, // requestDate
    now, // createdAt
    now,  // updatedAt
    txHash
  ]);
  
  const withdrawal = rows[0];
  
  // Send notification to admin
  await notifyAdminNewWithdrawal(withdrawal)
  
  return withdrawal
}

/**
 * Admin approves withdrawal
 */
export async function approveWithdrawal(
  withdrawalId: string,
  adminId: string
): Promise<void> {
  // Get the withdrawal and user information in a single query with a join
  const withdrawalQuery = `
    SELECT w.*, u.email
    FROM "Withdrawal" w
    JOIN "User" u ON w."userId" = u.id
    WHERE w.id = $1
  `;
  
  const { rows } = await pool.query(withdrawalQuery, [withdrawalId]);
  
  if (rows.length === 0) {
    throw new Error('Withdrawal not found');
  }
  
  const withdrawal = rows[0];
  
  if (withdrawal.status !== 'PENDING') {
    throw new Error('Withdrawal already processed');
  }
  
  // Get a client for transaction
  const client = await getClientWithTimeout(5000);
  
  try {
    await client.query('BEGIN');
    
    const now = new Date();
    
    // Send the blockchain transaction
    const txHash = await sendUsdt(
      withdrawal.walletAddress,
      Number(withdrawal.amount),
      withdrawal.network
    );
    
    // Update withdrawal status with proper enum cast
    const updateWithdrawalQuery = `
      UPDATE "Withdrawal"
      SET status = 'COMPLETED'::"WithdrawalStatus",
          "processedBy" = $1,
          "processedDate" = $2,
          "txHash" = $3,
          "updatedAt" = $4
      WHERE id = $5
    `;

    await client.query(updateWithdrawalQuery, [adminId, now, txHash, now, withdrawalId]);
    
    // Create transaction record
    const transactionId = uuidv4();

    const createTransactionQuery = `
      INSERT INTO "Transaction" (
        id, "userId", type, amount, "txHash", network,
        status, description, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3::"TransactionType", $4, $5, $6::"Network", $7::"TransactionStatus", $8, $9, $10)
    `;

    await client.query(createTransactionQuery, [
      transactionId,
      withdrawal.userId,
      'WITHDRAWAL',
      withdrawal.amount,
      txHash,
      withdrawal.network,
      'COMPLETED',
      `Withdrawal processed to ${withdrawal.walletAddress}`,
      now,
      now
    ]);
    
    // If capital withdrawal, mark packages as withdrawn
    if (withdrawal.type === 'CAPITAL_ONLY' || withdrawal.type === 'FULL_AMOUNT') {
      const updatePackagesQuery = `
        UPDATE "Package"
        SET status = 'WITHDRAWN'::"PackageStatus", "updatedAt" = $1
        WHERE "userId" = $2 AND status = 'EXPIRED'::"PackageStatus"
      `;

      await client.query(updatePackagesQuery, [now, withdrawal.userId]);
    }
    
    // Log admin action
    const adminLogId = uuidv4();
    const details = JSON.stringify({
      withdrawalId,
      txHash,
      amount: withdrawal.netAmount,
      walletAddress: withdrawal.walletAddress
    });

    const createAdminLogQuery = `
      INSERT INTO "AdminLog" (
        id, "adminId", action, "targetType", "targetId", details, "createdAt"
      ) VALUES ($1, $2, $3::"AdminActionType", $4, $5, $6, $7)
    `;

    await client.query(createAdminLogQuery, [
      adminLogId,
      adminId,
      'APPROVE_WITHDRAWAL',
      'WITHDRAWAL',
      withdrawalId,
      details,
      now
    ]);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  
  // Send confirmation email
  await sendWithdrawalConfirmationEmail(
    withdrawal.email, // Email is directly in withdrawal from our join query
    Number(withdrawal.netAmount),
    txHash
  )
}
