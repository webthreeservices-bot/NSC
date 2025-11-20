/**
 * Bot Utilities
 * Helper functions for bot eligibility, activation, and management
 */

import { PACKAGES } from './constants'

export type BotType = 'NEO' | 'NEURAL' | 'ORACLE'

/**
 * Determine which bot type a package amount qualifies for
 */
export function getBotTypeForAmount(amount: number): BotType {
  if (amount >= 500 && amount <= 3000) return 'NEO'
  if (amount >= 5000 && amount <= 10000) return 'NEURAL'
  if (amount >= 25000 && amount <= 50000) return 'ORACLE'
  
  throw new Error(`Invalid package amount: ${amount}`)
}

/**
 * Get activation fee for a bot type
 */
export function getBotActivationFee(botType: BotType): number {
  return PACKAGES[botType].botFee
}

/**
 * Get ROI percentage for a bot type
 */
export function getBotRoiPercentage(botType: BotType): number {
  return PACKAGES[botType].roiPercentage
}

/**
 * Get valid package amounts for a bot type
 */
export function getValidAmountsForBot(botType: BotType): readonly number[] {
  return PACKAGES[botType].amounts
}

/**
 * Check if an amount is valid for a specific bot type
 */
export function isValidAmountForBot(amount: number, botType: BotType): boolean {
  return (PACKAGES[botType].amounts as readonly number[]).includes(amount)
}

/**
 * Get all bot types a user is eligible for based on their package amounts
 */
export function getEligibleBotTypes(packageAmounts: number[]): BotType[] {
  const eligibleBots = new Set<BotType>()
  
  for (const amount of packageAmounts) {
    try {
      const botType = getBotTypeForAmount(amount)
      eligibleBots.add(botType)
    } catch {
      // Invalid amount, skip
    }
  }
  
  return Array.from(eligibleBots)
}

/**
 * Get bot display information
 */
export function getBotInfo(botType: BotType) {
  return {
    type: botType,
    name: `${botType} Bot`,
    description: getBotDescription(botType),
    icon: getBotIcon(botType),
    activationFee: getBotActivationFee(botType),
    roiPercentage: getBotRoiPercentage(botType),
    validAmounts: getValidAmountsForBot(botType),
    requiredRange: getBotRequiredRange(botType),
    totalRoi: getBotRoiPercentage(botType) * 12
  }
}

function getBotDescription(botType: BotType): string {
  const descriptions = {
    NEO: 'Entry-Level Trading Bot',
    NEURAL: 'Mid-Level Trading Bot',
    ORACLE: 'High-Level Trading Bot'
  }
  return descriptions[botType]
}

function getBotIcon(botType: BotType): string {
  const icons = {
    NEO: '🚀',
    NEURAL: '⚡',
    ORACLE: '💎'
  }
  return icons[botType]
}

function getBotRequiredRange(botType: BotType): string {
  const ranges = {
    NEO: '$500-$3,000',
    NEURAL: '$5,000-$10,000',
    ORACLE: '$25,000-$50,000'
  }
  return ranges[botType]
}
