import { getBotFee } from '@/utils/calculations'
import { verifyBlockchainTransaction } from '@/lib/blockchain'
import { PackageType, Network } from '@/types'
import pool, { getClientWithTimeout } from '@/lib/db-connection'
import { v4 as uuidv4 } from 'uuid'

/**
 * Activate bot for user
 */
export async function activateBot(
  userId: string,
  botType: PackageType,
  network: Network,
  txHash: string
): Promise<any> {
  // Check if user has eligible packages
  const eligiblePackagesQuery = `
    SELECT * FROM "Package" 
    WHERE "userId" = $1 AND "packageType" = $2 AND status = 'ACTIVE'
  `;
  
  const { rows: eligiblePackages } = await pool.query(eligiblePackagesQuery, [userId, botType]);
  
  if (eligiblePackages.length === 0) {
    throw new Error('No eligible packages for this bot type');
  }
  
  // Check if bot already activated or pending
  const existingBotQuery = `
    SELECT * FROM "BotActivation"
    WHERE "userId" = $1 AND "botType" = $2
  `;

  const { rows: existingBots } = await pool.query(existingBotQuery, [userId, botType]);
  const existingBot = existingBots.length > 0 ? existingBots[0] : null;

  // Block if bot is already ACTIVE or PENDING
  if (existingBot && (existingBot.status === 'ACTIVE' || existingBot.status === 'PENDING')) {
    throw new Error('Bot already activated or pending activation');
  }
  
  const activationFee = getBotFee(botType)

  // Verify payment transaction with amount verification FIRST (before DB operations)
  const isValid = await verifyBlockchainTransaction(txHash, network, activationFee)
  if (!isValid) {
    throw new Error('Invalid transaction or amount mismatch')
  }

  // Calculate expiry date (12 months)
  const activationDate = new Date()
  const expiryDate = new Date(activationDate)
  expiryDate.setMonth(expiryDate.getMonth() + 12)
  const now = new Date()

  // Get a client from the pool for transaction
  const client = await getClientWithTimeout(5000)

  try {
    await client.query('BEGIN');

    // FIX #2: Check duplicate transaction hash INSIDE transaction to prevent race condition
    const existingTxQuery = `
      SELECT id, "userId" FROM "BotActivation" WHERE "paymentTxHash" = $1
      UNION
      SELECT id, "userId" FROM "Package" WHERE "depositTxHash" = $1
      FOR UPDATE
    `;

    const { rows: existingTxs } = await client.query(existingTxQuery, [txHash]);

    if (existingTxs.length > 0) {
      throw new Error('This transaction hash has already been used');
    }
    
    let botActivation;
    
    // Create or update bot activation based on whether it exists
    if (existingBot) {
      // Update existing bot
      const updateBotQuery = `
        UPDATE "BotActivation"
        SET status = 'ACTIVE',
            "activationDate" = $1,
            "expiryDate" = $2,
            "isExpired" = false,
            "paymentTxHash" = $3,
            "updatedAt" = $4
        WHERE "userId" = $5 AND "botType" = $6
        RETURNING *
      `;
      
      const updateResult = await client.query(updateBotQuery, [
        activationDate,
        expiryDate,
        txHash,
        now,
        userId,
        botType
      ]);
      
      botActivation = updateResult.rows[0];
    } else {
      // Create new bot activation
      const botActivationId = uuidv4();
      
      const createBotQuery = `
        INSERT INTO "BotActivation" (
          id, "userId", "botType", "activationFee", "activationDate",
          "expiryDate", status, "isExpired", "paymentTxHash", network, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const createResult = await client.query(createBotQuery, [
        botActivationId,
        userId,
        botType,
        activationFee,
        activationDate,
        expiryDate,
        'ACTIVE',
        false, // isExpired
        txHash,
        network,
        now,
        now
      ]);
      
      botActivation = createResult.rows[0];
    }
    
    // Create transaction record
    const transactionId = uuidv4();
    
    const createTransactionQuery = `
      INSERT INTO "Transaction" (
        id, "userId", type, amount, "txHash", network,
        status, description, "referenceId", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
    
    await client.query(createTransactionQuery, [
      transactionId,
      userId,
      'BOT_FEE',
      activationFee,
      txHash,
      network,
      'COMPLETED',
      `${botType} bot activation fee`,
      botActivation.id,
      now,
      now
    ]);
    
    await client.query('COMMIT');
    return botActivation;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check bot expiry (cron job)
 */
export async function checkBotExpiry(): Promise<void> {
  const today = new Date();
  
  // FIX #4: Add proper enum cast for BotStatus
  const updateBotsQuery = `
    UPDATE "BotActivation"
    SET status = 'EXPIRED'::"BotStatus", "isExpired" = true, "updatedAt" = $1
    WHERE "expiryDate" <= $2
    AND status = 'ACTIVE'::"BotStatus"
    AND "isExpired" = false
  `;
  
  const { rowCount } = await pool.query(updateBotsQuery, [today, today]);
  
  console.log(`Expired ${rowCount} bots`)
}

/**
 * Check package expiry (cron job)
 */
export async function checkPackageExpiry(): Promise<void> {
  const today = new Date();
  
  const updatePackagesQuery = `
    UPDATE "Package"
    SET status = 'EXPIRED', "isExpired" = true, "updatedAt" = $1
    WHERE "expiryDate" <= $2
    AND status = 'ACTIVE'
    AND "isExpired" = false
  `;
  
  const { rowCount } = await pool.query(updatePackagesQuery, [today, today]);
  
  console.log(`Expired ${rowCount} packages`);
}
