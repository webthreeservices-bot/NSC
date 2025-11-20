/**
 * API Request and Response Types
 * Centralized type definitions for API endpoints
 */

// ============================================
// JWT & Authentication Types
// ============================================

export interface JwtPayload {
  userId: string
  email: string
  isAdmin?: boolean
  sessionId?: string
  iat?: number
  exp?: number
}

export interface AuthUser {
  userId: string
  id?: string // some parts of the codebase expect `user.id` instead of `user.userId`
  email: string
  isAdmin: boolean
  twoFactorEnabled?: boolean
}

export interface LoginRequest {
  email: string
  password: string
  twoFactorCode?: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  username?: string
  referralCode?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  token: string
  refreshToken: string
  user: {
    id: string
    email: string
    fullName: string
    username?: string
    referralCode: string
    isEmailVerified: boolean
    isAdmin: boolean
    createdAt: Date
  }
}

// ============================================
// Payment Types
// ============================================

export interface PaymentRequest {
  id: string
  userId: string
  purpose: 'PACKAGE_PURCHASE' | 'BOT_ACTIVATION' | 'WITHDRAWAL' | 'OTHER'
  amount: number
  network: 'BEP20' | 'TRC20'
  status: 'PENDING' | 'CONFIRMING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
  txHash?: string
  confirmations?: number
  amountReceived?: number
  metadata?: Record<string, any>
  expiresAt: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreatePaymentRequest {
  userId: string
  purpose: PaymentRequest['purpose']
  amount: number
  network: PaymentRequest['network']
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  message?: string
  data: PaymentRequest
}

// ============================================
// Package Types
// ============================================

export interface Package {
  id: string
  userId: string
  packageType: 'NEO' | 'NEURAL' | 'ORACLE'
  amount: number
  roiPercentage: number
  duration: number
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  depositTxHash?: string
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreatePackageRequest {
  userId: string
  amount: number
  network: 'BEP20' | 'TRC20'
}

export interface PackageResponse {
  success: boolean
  message?: string
  data?: Package
  package?: Package
  paymentRequest?: PaymentRequest
}

// ============================================
// Bot Activation Types
// ============================================

export interface BotActivation {
  id: string
  userId: string
  botType: 'TRADING' | 'ARBITRAGE' | 'STAKING'
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED'
  paymentTxHash?: string
  activatedAt?: Date
  expiresAt?: Date
  isExpired: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BotEligibility {
  eligible: boolean
  hasActivePackage: boolean
  packageType?: string
  requiredPackageType?: string
  reason?: string
}

export interface ActivateBotRequest {
  userId: string
  botType: BotActivation['botType']
  network: 'BEP20' | 'TRC20'
}

export interface BotResponse {
  success: boolean
  message?: string
  data?: BotActivation
  bot?: BotActivation
  paymentRequest?: PaymentRequest
}

// ============================================
// Transaction Types
// ============================================

export interface Transaction {
  id: string
  userId: string
  type: 
    | 'PACKAGE_PURCHASE'
    | 'BOT_ACTIVATION'
    | 'WITHDRAWAL'
    | 'ROI_PAYOUT'
    | 'REFERRAL_BONUS'
    | 'LEVEL_INCOME'
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  description?: string
  txHash?: string
  network?: 'BEP20' | 'TRC20'
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface TransactionResponse {
  success: boolean
  transactions: Transaction[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string
  email: string
  fullName: string
  username?: string
  referralCode: string
  referredBy?: string
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  isAdmin: boolean
  isActive: boolean
  isBlocked: boolean
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  totalInvestment?: number
  totalEarnings?: number
  referralCount?: number
  activePackages?: number
}

// ============================================
// Earnings Types
// ============================================

export interface EarningsSummary {
  totalEarnings: number
  roiEarnings: number
  referralEarnings: number
  levelEarnings: number
  withdrawableBalance: number
  totalWithdrawn: number
  pendingWithdrawals: number
}

export interface EarningsHistory {
  date: string
  amount: number
  type: Transaction['type']
  description: string
}

// ============================================
// Withdrawal Types
// ============================================

export interface Withdrawal {
  id: string
  userId: string
  amount: number
  walletAddress: string
  network: 'BEP20' | 'TRC20'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  txHash?: string
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateWithdrawalRequest {
  amount: number
  walletAddress: string
  network: 'BEP20' | 'TRC20'
}

export interface WithdrawalResponse {
  success: boolean
  message?: string
  data?: Withdrawal
  withdrawal?: Withdrawal
}

// ============================================
// Referral Types
// ============================================

export interface ReferralStats {
  totalReferrals: number
  activeReferrals: number
  totalEarnings: number
  referralsByLevel: Record<number, number>
}

export interface ReferralUser {
  id: string
  email: string
  fullName: string
  username?: string
  createdAt: Date
  totalInvestment: number
  status: string
}

// ============================================
// Admin Types
// ============================================

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalInvestments: number
  totalWithdrawals: number
  pendingWithdrawals: number
  totalEarnings: number
  platformBalance: number
}

export interface KYCSubmission {
  id: string
  userId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  documentType: string
  documentNumber?: string
  documentFrontUrl?: string
  documentBackUrl?: string
  selfieUrl?: string
  rejectionReason?: string
  verifiedBy?: string
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    email: string
    username?: string
    fullName: string
  }
}

// ============================================
// Blockchain Types
// ============================================

export interface BlockchainTransaction {
  hash: string
  from: string
  to: string
  value: number
  blockNumber: number
  timestamp: Date | string
  confirmations: number
  status: 'confirmed' | 'pending' | 'failed'
  network: 'BEP20' | 'TRC20'
  explorerUrl: string
}

export interface BlockchainResponse {
  success: boolean
  data?: BlockchainTransaction
  error?: string
}

// ============================================
// Error Response Types
// ============================================

export interface ErrorResponse {
  error: string
  message?: string
  details?: string
  code?: string | number
}

export interface SuccessResponse<T = any> {
  success: true
  message?: string
  data?: T
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

// ============================================
// Pagination Types
// ============================================

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// Database Query Types
// ============================================

export interface QueryResult<T> {
  rows: T[]
  rowCount: number
}

export interface DatabaseError extends Error {
  code?: string
  detail?: string
  constraint?: string
}
