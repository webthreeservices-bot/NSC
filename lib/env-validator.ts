/**
 * Environment Variables Validator
 * Validates all required environment variables on app startup
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string
  REDIS_URL?: string

  // JWT & Auth
  JWT_SECRET: string
  JWT_REFRESH_SECRET: string
  SESSION_SECRET: string

  // Blockchain - BSC
  BSC_RPC_URL: string
  ADMIN_WALLET_BSC: string
  ADMIN_PRIVATE_KEY_BSC: string
  USDT_CONTRACT_BSC: string

  // Blockchain - TRON
  TRON_RPC_URL: string
  ADMIN_WALLET_TRON: string
  ADMIN_PRIVATE_KEY_TRON: string
  USDT_CONTRACT_TRON: string

  // Email
  SMTP_HOST: string
  SMTP_PORT: string
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_FROM: string
  ADMIN_EMAIL: string

  // App URLs
  NEXT_PUBLIC_APP_URL: string
  NEXT_PUBLIC_API_URL: string

  // Environment
  NODE_ENV: string
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'BSC_RPC_URL',
  'ADMIN_WALLET_BSC',
  'ADMIN_PRIVATE_KEY_BSC',
  'TRON_RPC_URL',
  'ADMIN_WALLET_TRON',
  'ADMIN_PRIVATE_KEY_TRON',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'NEXT_PUBLIC_APP_URL'
]

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }

  // Validate JWT secrets length (minimum 32 characters)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters long')
  }

  // Validate wallet addresses format
  if (process.env.ADMIN_WALLET_BSC && !process.env.ADMIN_WALLET_BSC.startsWith('0x')) {
    errors.push('ADMIN_WALLET_BSC must start with 0x')
  }

  if (process.env.ADMIN_WALLET_TRON && !process.env.ADMIN_WALLET_TRON.startsWith('T')) {
    errors.push('ADMIN_WALLET_TRON must start with T')
  }

  // Validate URLs
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.startsWith('http')) {
    errors.push('NEXT_PUBLIC_APP_URL must be a valid URL')
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
      errors.push('Production app cannot use localhost URL')
    }

    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production-min-32-chars') {
      errors.push('JWT_SECRET must be changed from default value in production')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function printEnvironmentStatus(): void {
  const validation = validateEnvironment()

  console.log('\n🔍 Environment Validation')
  console.log('========================')

  if (validation.valid) {
    console.log('✅ All environment variables are valid')
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 App URL: ${process.env.NEXT_PUBLIC_APP_URL}`)
    console.log(`💾 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'configured'}`)
    console.log(`🔗 BSC Wallet: ${process.env.ADMIN_WALLET_BSC}`)
    console.log(`🔗 TRON Wallet: ${process.env.ADMIN_WALLET_TRON}`)
  } else {
    console.log('❌ Environment validation failed:')
    validation.errors.forEach(error => {
      console.log(`   - ${error}`)
    })
    console.log('\n⚠️  Please fix the above errors before starting the application.\n')
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1) // Exit in production if validation fails
    }
  }

  console.log('========================\n')
}
