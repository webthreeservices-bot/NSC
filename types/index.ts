// Enums for database schema
export enum PackageType {
  NEO = 'NEO',
  NEURAL = 'NEURAL',
  ORACLE = 'ORACLE',
  TEST_1 = 'TEST_1',
  TEST_2 = 'TEST_2',
  TEST_3 = 'TEST_3',
}

export enum Network {
  BEP20 = 'BEP20',
  TRC20 = 'TRC20',
}

export enum PackageStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum BotStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum EarningType {
  DIRECT_REFERRAL = 'DIRECT_REFERRAL',
  LEVEL_INCOME = 'LEVEL_INCOME',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BOT_FEE = 'BOT_FEE',
  ROI_PAYMENT = 'ROI_PAYMENT',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  LEVEL_INCOME = 'LEVEL_INCOME',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMING = 'CONFIRMING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}

export enum WithdrawalType {
  ROI_ONLY = 'ROI_ONLY',
  CAPITAL = 'CAPITAL',
  FULL_AMOUNT = 'FULL_AMOUNT',
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationMeta
}

// User types
export interface UserProfile {
  id: string
  username: string
  email: string
  fullName: string | null
  phone: string | null
  referralCode: string
  bep20Address: string | null
  trc20Address: string | null
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  kycStatus: KycStatus
  createdAt: Date
}

export interface UserStats {
  totalInvested: number
  totalEarnings: number
  activePackages: number
  totalReferrals: number
  withdrawableBalance: number
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
  twoFactorCode?: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  referralCode?: string
}

export interface AuthTokens {
  token: string
  refreshToken: string
}

// Package types
export interface PackageData {
  id: string
  amount: number
  packageType: PackageType
  roiPercentage: number
  investmentDate: Date
  expiryDate: Date
  nextRoiDate: Date | null
  status: PackageStatus
  totalRoiPaid: number
  roiPaidCount: number
  network: Network
}

// Withdrawal types
export interface WithdrawalRequest {
  amount: number
  type: WithdrawalType
  walletAddress: string
  network: Network
  twoFactorCode?: string
}

export interface WithdrawalData {
  id: string
  amount: number
  fee: number
  netAmount: number
  withdrawalType: WithdrawalType
  walletAddress: string
  network: Network
  status: WithdrawalStatus
  txHash: string | null
  requestDate: Date
}

// Earnings types
export interface EarningData {
  id: string
  earningType: EarningType
  amount: number
  level: number | null
  percentage: number | null
  paidDate: Date
}

export interface EarningsSummary {
  totalEarnings: number
  roiEarnings: number
  referralEarnings: number
  levelEarnings: number
  withdrawableBalance: number
}

// Referral types
export interface ReferralTreeNode {
  id: string
  username: string
  email: string
  level: number
  children: ReferralTreeNode[]
  packageCount: number
  totalInvested: number
}
