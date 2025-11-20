import { z } from 'zod'

// Base model interfaces
export interface BaseModel {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface User extends BaseModel {
  email: string
  fullName: string | null  // Changed from 'name' to match database
  referralCode: string
  referredBy: string | null
  isActive: boolean
  walletAddress: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
}

export interface Package extends BaseModel {
  userId: string
  amount: number
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'WITHDRAWN' | 'CANCELLED' | 'COMPLETED'
  packageType: 'NEO' | 'NEURAL' | 'ORACLE'
  expiryDate: Date | null  // Changed from 'expiresAt' to match database
  notes: string | null
}

export interface Earning extends BaseModel {
  userId: string
  amount: number
  earningType: 'DIRECT_REFERRAL' | 'LEVEL_INCOME' | 'REFERRAL' | 'ROI' | 'DIRECT' | 'BONUS'
  sourceId: string | null
  status: string  // TEXT field in database
}

export interface Withdrawal extends BaseModel {
  userId: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  walletAddress: string
  txHash: string | null  // Changed from 'transactionHash' to match database
}

export interface SystemSetting extends BaseModel {
  key: string
  value: string
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'
}

// Query Types
export type WhereClause = Record<string, any>
export type SelectClause = Record<string, boolean>
export type OrderByClause = Record<string, 'asc' | 'desc'>

export interface QueryOptions {
  where?: WhereClause
  select?: SelectClause
  orderBy?: OrderByClause
  take?: number
  skip?: number
  include?: Record<string, boolean | { select: SelectClause }>
}

// Schema Validation
export const userSchema = z.object({
  email: z.string().email(),
  fullName: z.string().nullable(),
  referralCode: z.string().min(6),
  referredBy: z.string().nullable(),
  isActive: z.boolean(),
  walletAddress: z.string().nullable(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN'])
})

export const packageSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(['PENDING', 'ACTIVE', 'EXPIRED', 'WITHDRAWN', 'CANCELLED', 'COMPLETED']),
  packageType: z.enum(['NEO', 'NEURAL', 'ORACLE']),
  expiryDate: z.date().nullable(),
  notes: z.string().nullable()
})

export const earningSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  earningType: z.enum(['DIRECT_REFERRAL', 'LEVEL_INCOME', 'REFERRAL', 'ROI', 'DIRECT', 'BONUS']),
  sourceId: z.string().uuid().nullable(),
  status: z.string()
})

export const withdrawalSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED']),
  walletAddress: z.string(),
  txHash: z.string().nullable()
})

export const systemSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'])
})