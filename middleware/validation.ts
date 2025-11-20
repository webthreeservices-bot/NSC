import { z } from 'zod'
import { NextResponse } from 'next/server'
import { packageConfig } from '@/config/security'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  referralCode: z.string().min(1, 'Referral code is required for registration')
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional()
})

export const packageCreationSchema = z.object({
  amount: z.number().refine(
    (val) => packageConfig.allowedAmounts.includes(val),
    { message: `Invalid package amount. Allowed values: ${packageConfig.allowedAmounts.join(', ')}` }
  ),
  network: z.enum(['BEP20', 'TRC20'])
})

export const withdrawalSchema = z.object({
  amount: z.number().min(packageConfig.withdrawalMinimum, `Minimum withdrawal is $${packageConfig.withdrawalMinimum}`),
  type: z.enum(['ROI_ONLY', 'CAPITAL', 'FULL_AMOUNT']),
  walletAddress: z.string().min(20, 'Invalid wallet address'),
  network: z.enum(['BEP20', 'TRC20']),
  twoFactorCode: z.string().optional(),
  txHash: z.string().optional() // Made optional for automatic fee deduction
}).refine(
  (data) => {
    // Network-specific wallet address validation
    if (data.network === 'BEP20') {
      // BSC addresses: 0x followed by 40 hex characters
      return /^0x[a-fA-F0-9]{40}$/.test(data.walletAddress)
    } else if (data.network === 'TRC20') {
      // TRON addresses: T followed by 33 alphanumeric characters
      return /^T[A-Za-z1-9]{33}$/.test(data.walletAddress)
    }
    return false
  },
  {
    message: 'Wallet address format does not match the selected network (BSC addresses start with 0x, TRON addresses start with T)',
    path: ['walletAddress']
  }
)

export const botActivationSchema = z.object({
  botType: z.enum(['NEO', 'NEURAL', 'ORACLE', 'TEST_1', 'TEST_2', 'TEST_3']),
  network: z.enum(['BEP20', 'TRC20'])
})

/**
 * Validate request body against schema
 */
export function validateRequest<T>(
  data: any,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }
    }
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      )
    }
  }
}
