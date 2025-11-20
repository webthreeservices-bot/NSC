import { z } from 'zod'

/**
 * User Profile Validation Schemas
 */
export const updateProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format. Use international format like +1234567890')
    .optional()
    .or(z.literal('')),
  bep20Address: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid BEP20 address format. Must start with 0x followed by 40 hex characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  trc20Address: z.string()
    .regex(/^T[A-Za-z1-9]{33}$/, 'Invalid TRC20 address format. Must start with T followed by 33 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
})

/**
 * Package Creation Validation Schema
 */
export const createPackageSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .refine(
      (val) => [500, 1000, 3000, 5000, 10000, 25000, 50000].includes(val),
      'Invalid package amount. Valid amounts: 500, 1000, 3000, 5000, 10000, 25000, 50000'
    ),
  network: z.enum(['BEP20', 'TRC20'], {
    errorMap: () => ({ message: 'Network must be either BEP20 or TRC20' }),
  }),
})

/**
 * Bot Activation Validation Schema
 */
export const activateBotSchema = z.object({
  botType: z.enum(['NEO', 'NEURAL', 'ORACLE'], {
    errorMap: () => ({ message: 'Bot type must be NEO, NEURAL, or ORACLE' }),
  }),
  network: z.enum(['BEP20', 'TRC20'], {
    errorMap: () => ({ message: 'Network must be either BEP20 or TRC20' }),
  }),
})

/**
 * Payment Request Validation Schema
 */
export const createPaymentRequestSchema = z.object({
  purpose: z.enum(['PACKAGE_PURCHASE', 'BOT_ACTIVATION', 'MANUAL_DEPOSIT'], {
    errorMap: () => ({ message: 'Invalid payment purpose' }),
  }),
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum limit'),
  network: z.enum(['BEP20', 'TRC20'], {
    errorMap: () => ({ message: 'Network must be either BEP20 or TRC20' }),
  }),
  metadata: z.record(z.any()).optional(),
})

/**
 * Withdrawal Validation Schema
 */
export const createWithdrawalSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(10, 'Minimum withdrawal amount is 10 USDT')
    .max(100000, 'Maximum withdrawal amount is 100,000 USDT'),
  network: z.enum(['BEP20', 'TRC20'], {
    errorMap: () => ({ message: 'Network must be either BEP20 or TRC20' }),
  }),
  address: z.string()
    .min(10, 'Wallet address is required')
    .refine(
      (val) => {
        // Validate BEP20 or TRC20 address format
        return /^0x[a-fA-F0-9]{40}$/.test(val) || /^T[A-Za-z1-9]{33}$/.test(val)
      },
      'Invalid wallet address format'
    ),
})

/**
 * Admin Operations Validation Schemas
 */
export const adminApprovePackageSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
  status: z.enum(['ACTIVE', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be ACTIVE or REJECTED' }),
  }),
  note: z.string().max(500, 'Note must be less than 500 characters').optional(),
})

export const adminApproveWithdrawalSchema = z.object({
  withdrawalId: z.string().uuid('Invalid withdrawal ID'),
  status: z.enum(['COMPLETED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be COMPLETED or REJECTED' }),
  }),
  txHash: z.string()
    .regex(/^(0x)?[a-fA-F0-9]{64}$/, 'Invalid transaction hash format')
    .optional(),
  note: z.string().max(500, 'Note must be less than 500 characters').optional(),
})

export const adminUpdateUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  isActive: z.boolean().optional(),
  kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  twoFactorEnabled: z.boolean().optional(),
})

/**
 * Auth Validation Schemas
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
  twoFactorCode: z.string()
    .regex(/^\d{6}$/, 'Two-factor code must be 6 digits')
    .optional(),
})

export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  referralCode: z.string()
    .length(8, 'Referral code must be exactly 8 characters')
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

/**
 * Helper function to validate and parse request body
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    
    if (!result.success) {
      const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ')
      return { success: false, error: errors }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, error: 'Invalid JSON in request body' }
  }
}

/**
 * Helper function to validate query parameters
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params = Object.fromEntries(searchParams.entries())
    const result = schema.safeParse(params)
    
    if (!result.success) {
      const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ')
      return { success: false, error: errors }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, error: 'Invalid query parameters' }
  }
}
