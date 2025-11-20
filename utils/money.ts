/**
 * Money Utilities
 * Provides precise decimal handling for financial calculations
 * Uses integers internally to avoid floating point errors
 */

const DECIMAL_PLACES = 6 // USDT has 6 decimal places

/**
 * Convert dollar amount to smallest unit (micro-USDT)
 * Example: 100.50 USDT -> 100500000 micro-USDT
 */
export function toSmallestUnit(amount: number): bigint {
  // Multiply by 10^6 to convert to micro-USDT
  const multiplier = Math.pow(10, DECIMAL_PLACES)
  return BigInt(Math.round(amount * multiplier))
}

/**
 * Convert smallest unit back to dollar amount
 * Example: 100500000 micro-USDT -> 100.50 USDT
 */
export function fromSmallestUnit(amount: bigint): number {
  const divisor = Math.pow(10, DECIMAL_PLACES)
  return Number(amount) / divisor
}

/**
 * Compare two amounts with precision
 * Returns true if amounts are equal within tolerance
 */
export function isEqualAmount(amount1: number, amount2: number, toleranceMicroUnits: number = 1): boolean {
  const a1 = toSmallestUnit(amount1)
  const a2 = toSmallestUnit(amount2)
  const diff = a1 > a2 ? a1 - a2 : a2 - a1
  return diff <= BigInt(toleranceMicroUnits)
}

/**
 * Add two amounts precisely
 */
export function addAmounts(...amounts: number[]): number {
  const total = amounts.reduce((sum, amount) => sum + toSmallestUnit(amount), BigInt(0))
  return fromSmallestUnit(total)
}

/**
 * Subtract amount2 from amount1 precisely
 */
export function subtractAmounts(amount1: number, amount2: number): number {
  const result = toSmallestUnit(amount1) - toSmallestUnit(amount2)
  return fromSmallestUnit(result)
}

/**
 * Multiply amount by a factor (e.g., for ROI calculation)
 */
export function multiplyAmount(amount: number, factor: number): number {
  const amountInSmallestUnit = toSmallestUnit(amount)
  // Use BigInt math for intermediate calculation
  const factorBigInt = BigInt(Math.round(factor * 1000000))
  const result = (amountInSmallestUnit * factorBigInt) / BigInt(1000000)
  return fromSmallestUnit(result)
}

/**
 * Calculate percentage of amount
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return multiplyAmount(amount, percentage / 100)
}

/**
 * Validate amount is within valid range
 */
export function isValidMoneyAmount(amount: number): boolean {
  if (amount < 0) return false
  if (!Number.isFinite(amount)) return false
  
  // Check if it has more than 6 decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length
  if (decimalPlaces > DECIMAL_PLACES) return false
  
  return true
}

/**
 * Format amount for display
 */
export function formatMoney(amount: number, currency: string = 'USDT'): string {
  return `${amount.toFixed(2)} ${currency}`
}

/**
 * Parse money string to number
 */
export function parseMoney(moneyString: string): number {
  const cleaned = moneyString.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isValidMoneyAmount(parsed) ? parsed : 0
}
