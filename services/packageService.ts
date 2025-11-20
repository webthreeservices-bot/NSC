import { getPackageType, isValidPackageAmount, getNextRoiDate } from '@/utils/calculations'
import { generateQRCode } from '@/utils/helpers'
import { getAdminWallet, verifyBlockchainTransaction } from '@/lib/blockchain'
import { sendPackageActivationEmail } from '@/utils/email'
import { calculateReferralEarnings, payDirectReferralBonus, distributeLevelIncome } from './referralService'
import { Network } from '@/types'
import pool, { getClientWithTimeout } from '@/lib/db-connection'
import { v4 as uuidv4 } from 'uuid'

/**
 * Create new package investment
 * Uses database transaction for atomicity
 */
export async function createPackage(
  userId: string,
  amount: number,
  network: Network
): Promise<any> {
  // Validate amount
  if (!isValidPackageAmount(amount)) {
    throw new Error('Invalid package amount')
  }
  
  // Determine package type
  // Determine package type
  const packageType = getPackageType(amount)
  
  // Get ROI percentage
  let roiPercentage = 3
  if (packageType === 'NEURAL' || packageType === 'TEST_2') roiPercentage = 4
  if (packageType === 'ORACLE' || packageType === 'TEST_3') roiPercentage = 5
  
  // Calculate dates
  const investmentDate = new Date()
  const expiryDate = new Date(investmentDate)
  expiryDate.setMonth(expiryDate.getMonth() + 12)
  
  const nextRoiDate = new Date(investmentDate)
  if (['TEST_1', 'TEST_2', 'TEST_3'].includes(packageType)) {
    nextRoiDate.setMinutes(nextRoiDate.getMinutes() + 15)
  } else {
    nextRoiDate.setDate(nextRoiDate.getDate() + 30)
  }
  
  // Create package with transaction rollback support
  const packageId = uuidv4();
  const now = new Date();
  
  const client = await getClientWithTimeout(5000)
  
  try {
    // Start transaction
    await client.query('BEGIN')
    
    const insertPackageQuery = `
      INSERT INTO "Package" (
        id, "userId", amount, "packageType", "roiPercentage",
        "investmentDate", "expiryDate", "nextRoiDate", network, status,
        "totalRoiPaid", "roiPaidCount", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const { rows } = await client.query(insertPackageQuery, [
      packageId,
      userId,
      amount,
      packageType,
      roiPercentage,
      investmentDate,
      expiryDate,
      nextRoiDate,
      network,
      'PENDING', // Will change to ACTIVE after deposit confirmation
      0, // totalRoiPaid
      0, // roiPaidCount
      now,
      now
    ]);
    
    const pkg = rows[0];
    
    // Generate deposit address (admin wallet for that network)
    const depositAddress = getAdminWallet(network)
    const qrCode = await generateQRCode(depositAddress)
    
    // Create payment request record with correct schema
    const paymentRequestId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry
    
    const insertPaymentRequestQuery = `
      INSERT INTO "PaymentRequest" (
        id, "userId", purpose, amount, network, "depositAddress", "qrCodeData",
        status, "expiresAt", metadata, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    await client.query(insertPaymentRequestQuery, [
      paymentRequestId,
      userId,
      'PACKAGE_PURCHASE',
      amount,
      network,
      depositAddress,
      qrCode,
      'PENDING',
      expiresAt,
      JSON.stringify({ packageId, packageType }), // Store package info in metadata
      now,
      now
    ]);
    
    // Commit transaction
    await client.query('COMMIT')
    
    return {
      package: pkg,
      depositAddress,
      qrCode
    }
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK')
    console.error('Package creation failed, transaction rolled back:', error)
    throw error
  } finally {
    // Release client back to pool
    client.release()
  }
}

/**
 * Activate package after deposit confirmation
 */
export async function activatePackage(
  packageId: string,
  txHash: string
): Promise<void> {
  // Verify transaction on blockchain
  const findPackageQuery = `
    SELECT p.*, u.id AS "userId", u.email, u."referredBy"
    FROM "Package" p
    JOIN "User" u ON p."userId" = u.id
    WHERE p.id = $1
  `;
  
  const { rows } = await pool.query(findPackageQuery, [packageId]);
  
  if (rows.length === 0) {
    throw new Error('Package not found');
  }
  
  const pkg = rows[0];
  // Transform the result to match the structure expected by the rest of the function
  pkg.user = {
    id: pkg.userId,
    email: pkg.email,
    referredBy: pkg.referredBy
  };
  
  const isValid = await verifyBlockchainTransaction(txHash, pkg.network)
  
  if (!isValid) {
    throw new Error('Invalid transaction hash')
  }
  
  // Update package status
  const updatePackageQuery = `
    UPDATE "Package"
    SET 
      status = 'ACTIVE', 
      "depositTxHash" = $1, 
      "updatedAt" = $2,
      "activatedAt" = $2,
      "nextRoiDate" = CASE 
        WHEN "packageType" IN ('TEST_1', 'TEST_2', 'TEST_3') THEN $2 + INTERVAL '15 minutes'
        ELSE $2 + INTERVAL '30 days'
      END
    WHERE id = $3
  `;
  
  await pool.query(updatePackageQuery, [txHash, new Date(), packageId]);
  
  // Create deposit transaction record
  const transactionId = uuidv4();
  const now = new Date();
  
  const createTransactionQuery = `
    INSERT INTO "Transaction" (
      id, "userId", type, amount, "txHash", network, 
      status, description, "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  
  await pool.query(createTransactionQuery, [
    transactionId,
    pkg.userId,
    'PACKAGE_PURCHASE',
    pkg.amount,
    txHash,
    pkg.network,
    'COMPLETED',
    'Package deposit',
    now,
    now
  ]);
  
  // Pay referral bonuses if user has referrer
  if (pkg.user.referredBy) {
    try {
      // Use the SQL function to calculate and distribute all referral earnings atomically
      await calculateReferralEarnings(packageId, pkg.userId, Number(pkg.amount))

      // After DB earnings are created, distribute referral payments on-chain
      try {
        const { distributeReferralEarningsOnChain } = await import('./referralService')
        await distributeReferralEarningsOnChain(packageId, pkg.network)
      } catch (err) {
        console.error('[Referral] Error distributing referral earnings on-chain:', err)
      }
      console.log(`✅ Referral earnings processed for package ${packageId}`)
    } catch (error) {
      console.error('❌ Error processing referral bonuses:', error)
      // Continue without failing the package activation
    }
  }
  
  // Send confirmation email
  await sendPackageActivationEmail(pkg.user.email, Number(pkg.amount), pkg.packageType)
}
