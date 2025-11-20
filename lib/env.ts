/**
 * Environment Configuration Loader
 * Loads environment variables with proper fallbacks and validation
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env files
function loadEnvironment() {
  // Load .env file from project root
  const envPath = path.resolve(process.cwd(), '.env')
  const envLocalPath = path.resolve(process.cwd(), '.env.local')
  
  // Load .env.local first (higher priority)
  dotenv.config({ path: envLocalPath })
  
  // Load .env (lower priority)
  dotenv.config({ path: envPath })
  
  // For development, also try loading from .env.development
  if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.development') })
  }
}

// Initialize environment loading
loadEnvironment()

// Validate critical environment variables
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Database URL is critical
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required')
  }

  // JWT secrets are critical for authentication
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required')
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    errors.push('JWT_REFRESH_SECRET is required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Get database URL with fallback
export function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please add it to your .env file. ' +
      'Example: DATABASE_URL="postgresql://user:password@host:port/database"'
    )
  }

  return dbUrl
}

// Export environment validation for other modules
export const env = {
  DATABASE_URL: getDatabaseUrl(),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Optional environment variables with defaults
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // Platform settings
  PLATFORM_NAME: process.env.PLATFORM_NAME || 'NSC Bot Platform',
  MIN_WITHDRAWAL_AMOUNT: parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT || '20'),
  WITHDRAWAL_FEE_PERCENT: parseFloat(process.env.WITHDRAWAL_FEE_PERCENT || '10'),
  
  // Email settings (optional)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Blockchain settings (optional)
  BSC_RPC_URL: process.env.BSC_RPC_URL,
  TRON_RPC_URL: process.env.TRON_RPC_URL,
  ADMIN_WALLET_BSC: process.env.ADMIN_WALLET_BSC,
  ADMIN_WALLET_TRON: process.env.ADMIN_WALLET_TRON,
}

// Validate environment on module load
const validation = validateEnvironment()
if (!validation.valid) {
  console.error('❌ Environment validation failed:')
  validation.errors.forEach(error => {
    console.error(`  - ${error}`)
  })
  
  // Don't exit in test environment
  if (process.env.NODE_ENV !== 'test') {
    console.error('\n💡 Please check your .env file and ensure all required variables are set.')
    process.exit(1)
  }
}

export default env