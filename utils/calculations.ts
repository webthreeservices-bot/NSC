import { PackageType } from '@/types'

/**
 * Calculate ROI amount based on package
 */
export function calculateRoi(amount: number, packageType: PackageType): number {
  const roiRates: Record<PackageType, number> = {
    NEO: 0.03,      // 3%
    NEURAL: 0.04,   // 4%
    ORACLE: 0.05,   // 5%
    TEST_1: 0.03,   // 3%
    TEST_2: 0.04,   // 4%
    TEST_3: 0.05,   // 5%
  }
  
  return amount * roiRates[packageType]
}

/**
 * Determine package type based on amount
 */
export function getPackageType(amount: number): PackageType {
  if (amount === 1) return PackageType.TEST_1
  if (amount === 2) return PackageType.TEST_2
  if (amount === 3) return PackageType.TEST_3
  if (amount >= 500 && amount <= 3000) return PackageType.NEO
  if (amount >= 5000 && amount <= 10000) return PackageType.NEURAL
  if (amount >= 25000 && amount <= 50000) return PackageType.ORACLE
  
  throw new Error('Invalid package amount')
}

/**
 * Get bot activation fee based on bot type
 */
export function getBotFee(botType: PackageType): number {
  const fees: Record<PackageType, number> = {
    NEO: 50,
    NEURAL: 100,
    ORACLE: 150,
    TEST_1: 1,
    TEST_2: 2,
    TEST_3: 3,
  }
  
  return fees[botType]
}

/**
 * Calculate level income based on upline distance and amount
 * Example chain: A → B → C → D → E → F → G
 * When G buys:
 * - F gets 2% (direct referrer/level 1)
 * - E gets 0.75% (level 2 - referred F)
 * - D gets 0.50% (level 3 - referred E)
 * - C gets 0.25% (level 4 - referred D)
 * - B gets 0.15% (level 5 - referred C)
 * - A gets 0.10% (level 6 - referred B)
 * 
 * NOTE: Users only earn referral/level income if they have an active bot
 */
export function calculateLevelIncome(level: number, amount: number, hasBotActive: boolean): number {
  // If user doesn't have an active bot, they don't earn referral income
  if (!hasBotActive) {
    return 0
  }

  // Level represents how many steps up the referral chain
  const levelPercentages: Record<number, number> = {
    1: 0.02,    // 2% - Direct referrer bonus
    2: 0.0075,  // 0.75% - Referrer's referrer
    3: 0.005,   // 0.50% - 3rd upline
    4: 0.0025,  // 0.25% - 4th upline
    5: 0.0015,  // 0.15% - 5th upline
    6: 0.001    // 0.10% - 6th upline
  }
  
  if (level < 1 || level > 6) return 0
  
  return amount * levelPercentages[level]
}

/**
 * Calculate withdrawal fee (10%)
 */
export function calculateWithdrawalFee(amount: number): number {
  return amount * 0.10
}

/**
 * Check if user can withdraw (30 days rule)
 */
export function canWithdraw(lastWithdrawalDate: Date | null): boolean {
  if (!lastWithdrawalDate) return true
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  return lastWithdrawalDate <= thirtyDaysAgo
}

/**
 * Calculate next ROI date (30 days from last payment)
 */
export function getNextRoiDate(lastRoiDate: Date | null, investmentDate: Date): Date {
  const baseDate = lastRoiDate || investmentDate
  const nextDate = new Date(baseDate)
  nextDate.setDate(nextDate.getDate() + 30)
  
  return nextDate
}

/**
 * Check if package is expired (12 months)
 */
export function isPackageExpired(investmentDate: Date): boolean {
  const expiryDate = new Date(investmentDate)
  expiryDate.setMonth(expiryDate.getMonth() + 12)
  
  return new Date() >= expiryDate
}

/**
 * Validate package amount
 */
export function isValidPackageAmount(amount: number): boolean {
  const validAmounts = [1, 2, 3, 500, 1000, 3000, 5000, 10000, 25000, 50000]
  return validAmounts.includes(amount)
}
