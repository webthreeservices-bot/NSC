// The blockchain module has been replaced with an offchain-only stub to remove
// runtime dependencies on ethers/tronweb. The implementation continues to
// expose the same function signatures but will operate in offchain/simulated
// mode. This supports running in a Web2-only mode and later re-adding web3.
import { Network } from '@/types'
const WEB3_DISABLED = true // Hard-offchain mode: intentionally true to remove web3 runtime

// Retry configuration
const MAX_RETRIES = 1
const RETRY_DELAY = 2000 // 2 seconds

/**
 * Sleep utility for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry wrapper for async functions
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`Retry ${i + 1}/${retries} after error:`, error)
      await sleep(RETRY_DELAY)
    }
  }
  throw new Error('Max retries exceeded')
}

/**
 * Get admin wallet address for network
 */
export function getAdminWallet(network: Network): string {
  if (network === Network.BEP20) {
    return process.env.ADMIN_WALLET_BSC || ''
  } else {
    return process.env.ADMIN_WALLET_TRON || ''
  }
}

/**
 * Get BEP20 wallet balance
 */
export async function getBep20Balance(address: string): Promise<number> {
  // Off-chain: we cannot query blockchain; return 0 and log
  return 0
}

/**
 * Verify BEP20 transaction
 */
export async function verifyBep20Transaction(
  txHash: string,
  expectedAmount?: number,
  expectedRecipient?: string
): Promise<boolean> {
  if (WEB3_DISABLED) {
    // Simulate verification success during offchain operation
    return true
  }
  // If web3 were enabled, this function would perform chain verification.
  // With the hard cleanup, we return false conservatively.
  return false
}

/**
 * Get TRC20 wallet balance
 */
export async function getTrc20Balance(address: string): Promise<number> {
  // Off-chain stub: cannot query TRON; return 0
  return 0
}

/**
 * Verify TRC20 transaction
 */
export async function verifyTrc20Transaction(
  txHash: string,
  expectedAmount?: number,
  expectedRecipient?: string
): Promise<boolean> {
  if (WEB3_DISABLED) {
    return true
  }
  return false
}

/**
 * Verify blockchain transaction (wrapper)
 */
export async function verifyBlockchainTransaction(
  txHash: string,
  network: Network = Network.BEP20,
  expectedAmount?: number,
  expectedRecipient?: string
): Promise<boolean> {
  // Off-chain: Simulate verified transactions
  return true
}

/**
 * Send BEP20 USDT
 */
export async function sendBep20Usdt(toAddress: string, amount: number): Promise<string> {
  // Off-chain simulation of send
  const mockTxHash = `OFFCHAIN_BEP20_${Date.now()}`
  return mockTxHash
}

/**
 * Send TRC20 USDT
 */
export async function sendTrc20Usdt(toAddress: string, amount: number): Promise<string> {
  const mockTx = `OFFCHAIN_TRC20_${Date.now()}`
  return mockTx
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(
  address: string,
  network: Network
): Promise<number> {
  if (network === Network.BEP20) {
    return await getBep20Balance(address)
  } else {
    return await getTrc20Balance(address)
  }
}

/**
 * Send USDT (for withdrawal processing)
 */
export async function sendUsdt(
  toAddress: string,
  amount: number,
  network: Network
): Promise<string> {
  if (network === Network.BEP20) {
    return await sendBep20Usdt(toAddress, amount)
  } else {
    return await sendTrc20Usdt(toAddress, amount)
  }
}

/**
 * Validate wallet address format
 */
export function isValidAddress(address: string, network: Network): boolean {
  if (network === Network.BEP20) {
    // Basic check for an Ethereum-style address
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  } else {
    // Basic TRON address validation (starts with T and is 34 characters)
    return /^T[A-Za-z1-9]{33}$/.test(address)
  }
}
