import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { PackageType, Network } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { getBotFee } from '@/utils/calculations'
import { getAdminWallet } from '@/lib/blockchain'

/**
 * Process bot activation payment to defined wallet
 */
export async function processBotActivation(
  userId: string,
  packageType: PackageType,
  network: Network
): Promise<void> {
  const botFee = getBotFee(packageType)
  const destinationWallet = getAdminWallet(network) // This should be the defined wallet for bot income
  
  // Create bot activation record
  await execute(
    `INSERT INTO "BotActivation" (id, "userId", "packageType", amount, status, "destinationWallet", network, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [uuidv4(), userId, packageType, botFee, 'PENDING', destinationWallet, network, new Date(), new Date()]
  )
}

/**
 * Confirm bot activation after payment
 */
export async function confirmBotActivation(
  activationId: string,
  txHash: string
): Promise<void> {
  const activation = await queryOne(
    `SELECT * FROM "BotActivation" WHERE id = $1`,
    [activationId]
  )

  if (!activation) {
    throw new Error('Bot activation not found')
  }

  // Update activation status
  await execute(
    `UPDATE "BotActivation" SET status = $1, "txHash" = $2, "updatedAt" = $3 WHERE id = $4`,
    ['ACTIVE', txHash, new Date(), activationId]
  )

  // Create transaction record for bot fee
  await execute(
    `INSERT INTO "Transaction" (id, "userId", type, amount, "txHash", network, status, description, "destinationWallet", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [uuidv4(), activation.userId, 'BOT_ACTIVATION', activation.amount, txHash, activation.network, 'COMPLETED', 'Bot activation fee', activation.destinationWallet, new Date(), new Date()]
  )
}