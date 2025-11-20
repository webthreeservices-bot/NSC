// Package configurations
export const PACKAGES = {
  NEO: {
    amounts: [500, 1000, 3000],
    roiPercentage: 3,
    botFee: 50,
  },
  NEURAL: {
    amounts: [5000, 10000],
    roiPercentage: 4,
    botFee: 100,
  },
  ORACLE: {
    amounts: [25000, 50000],
    roiPercentage: 5,
    botFee: 150,
  },
  // Demo Packages
  TEST_1: {
    amounts: [1],
    roiPercentage: 3,
    botFee: 1,
  },
  TEST_2: {
    amounts: [2],
    roiPercentage: 4,
    botFee: 2,
  },
  TEST_3: {
    amounts: [3],
    roiPercentage: 5,
    botFee: 3,
  },
} as const

// Referral commission percentages
export const REFERRAL_COMMISSIONS = {
  DIRECT: 2.0,
  LEVEL_1: 2.0,
  LEVEL_2: 0.75,
  LEVEL_3: 0.50,
  LEVEL_4: 0.25,
  LEVEL_5: 0.15,
  LEVEL_6: 0.10,
} as const

// Withdrawal configuration
export const WITHDRAWAL_CONFIG = {
  MIN_AMOUNT: 20,
  FEE_PERCENTAGE: 10,
  COOLDOWN_DAYS: 30,
} as const

// ROI configuration
export const ROI_CONFIG = {
  PAYMENT_INTERVAL_DAYS: 30,
  MAX_PAYMENTS: 12,
  PACKAGE_DURATION_MONTHS: 12,
} as const

// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  BSC_CONFIRMATIONS: 3,
  TRON_CONFIRMATIONS: 19,
} as const

// Valid package amounts
export const VALID_PACKAGE_AMOUNTS = [
  1, 2, 3, 500, 1000, 3000, 5000, 10000, 25000, 50000
] as const

export type PackageAmount = typeof VALID_PACKAGE_AMOUNTS[number]
