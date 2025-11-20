interface EnvConfig {
  [key: string]: {
    required: boolean
    description: string
    defaultValue?: string
    validate?: (value: string) => boolean
  }
}

const ENV_CONFIG: EnvConfig = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL database connection string',
    validate: (value) => value.startsWith('postgresql://')
  },
  REDIS_URL: {
    required: false,
    description: 'Redis connection string for caching',
    defaultValue: 'redis://localhost:6379'
  },

  // JWT & Security
  JWT_SECRET: {
    required: true,
    description: 'JWT secret key (minimum 32 characters)',
    validate: (value) => value.length >= 32
  },
  JWT_REFRESH_SECRET: {
    required: true,
    description: 'JWT refresh token secret key (minimum 32 characters)',
    validate: (value) => value.length >= 32
  },

  // Blockchain - BSC
  BSC_RPC_URL: {
    required: true,
    description: 'Binance Smart Chain RPC URL',
    defaultValue: 'https://bsc-dataseed.binance.org/'
  },
  ADMIN_WALLET_BSC: {
    required: true,
    description: 'Admin wallet address for BSC network',
    validate: (value) => value.startsWith('0x') && value.length === 42
  },
  ADMIN_PRIVATE_KEY_BSC: {
    required: true,
    description: 'Admin private key for BSC (64 characters hex)',
    validate: (value) => /^[0-9a-fA-F]{64}$/.test(value)
  },
  USDT_CONTRACT_BSC: {
    required: true,
    description: 'USDT contract address on BSC',
    defaultValue: '0x55d398326f99059fF775485246999027B3197955'
  },

  // Blockchain - TRON
  TRON_RPC_URL: {
    required: true,
    description: 'TRON network RPC URL',
    defaultValue: 'https://api.trongrid.io'
  },
  ADMIN_WALLET_TRON: {
    required: true,
    description: 'Admin wallet address for TRON network',
    validate: (value) => value.startsWith('T') && value.length === 34
  },
  ADMIN_PRIVATE_KEY_TRON: {
    required: true,
    description: 'Admin private key for TRON (64 characters hex)',
    validate: (value) => /^[0-9a-fA-F]{64}$/.test(value)
  },
  USDT_CONTRACT_TRON: {
    required: true,
    description: 'USDT contract address on TRON',
    defaultValue: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  },

  // Email
  SMTP_HOST: {
    required: true,
    description: 'SMTP server hostname',
    defaultValue: 'smtp.gmail.com'
  },
  SMTP_PORT: {
    required: true,
    description: 'SMTP server port',
    defaultValue: '587'
  },
  SMTP_USER: {
    required: true,
    description: 'SMTP username/email'
  },
  SMTP_PASS: {
    required: true,
    description: 'SMTP password or app password'
  },
  SMTP_FROM: {
    required: true,
    description: 'From email address',
    defaultValue: 'NSC Bot Platform <noreply@nscbot.com>'
  },

  // Application
  NEXT_PUBLIC_APP_URL: {
    required: true,
    description: 'Application base URL',
    defaultValue: 'http://localhost:3000'
  },
  NODE_ENV: {
    required: true,
    description: 'Node environment',
    defaultValue: 'development',
    validate: (value) => ['development', 'production', 'test'].includes(value)
  },

  // Platform Settings
  PLATFORM_NAME: {
    required: false,
    description: 'Platform display name',
    defaultValue: 'NSC Bot Platform'
  },
  SUPPORT_EMAIL: {
    required: false,
    description: 'Support email address',
    defaultValue: 'support@nscbot.com'
  },
  MIN_WITHDRAWAL_AMOUNT: {
    required: false,
    description: 'Minimum withdrawal amount in USDT',
    defaultValue: '20'
  },
  WITHDRAWAL_FEE_PERCENT: {
    required: false,
    description: 'Withdrawal fee percentage',
    defaultValue: '10'
  }
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  missing: string[]
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const missing: string[] = []

  console.log('🔍 Validating environment variables...')

  Object.entries(ENV_CONFIG).forEach(([key, config]) => {
    const value = process.env[key]

    if (!value) {
      if (config.required) {
        missing.push(key)
        errors.push(`❌ ${key}: ${config.description}`)
      } else {
        warnings.push(`⚠️  ${key}: ${config.description} (using default: ${config.defaultValue})`)
        if (config.defaultValue) {
          process.env[key] = config.defaultValue
        }
      }
      return
    }

    // Validate value if validator exists
    if (config.validate && !config.validate(value)) {
      errors.push(`❌ ${key}: Invalid format - ${config.description}`)
    } else {
      console.log(`✅ ${key}: OK`)
    }
  })

  const valid = errors.length === 0

  if (!valid) {
    console.log('\n🚨 Environment validation failed!')
    console.log('\nMissing required variables:')
    missing.forEach(key => console.log(`  - ${key}`))
    console.log('\nErrors:')
    errors.forEach(error => console.log(`  ${error}`))
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach(warning => console.log(`  ${warning}`))
  }

  if (valid) {
    console.log('\n✅ Environment validation passed!')
  }

  return { valid, errors, warnings, missing }
}

export function checkCriticalEnvVars(): void {
  const critical = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'ADMIN_WALLET_BSC',
    'ADMIN_PRIVATE_KEY_BSC',
    'ADMIN_WALLET_TRON',
    'ADMIN_PRIVATE_KEY_TRON'
  ]

  const missing = critical.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('🚨 Critical environment variables missing:')
    missing.forEach(key => console.error(`  - ${key}`))
    console.error('\nApplication cannot start without these variables.')
    process.exit(1)
  }
}

export function generateEnvTemplate(): string {
  let template = `# ============================================
# NSC BOT PLATFORM - ENVIRONMENT VARIABLES
# ============================================
# Generated on ${new Date().toISOString()}
#
# Copy this file to .env and fill in your values
# ============================================

`

  Object.entries(ENV_CONFIG).forEach(([key, config]) => {
    template += `# ${config.description}\n`
    if (config.required) {
      template += `${key}=""\n\n`
    } else {
      template += `# ${key}="${config.defaultValue || ''}"\n\n`
    }
  })

  return template
}

// Auto-validate on import in development
if (process.env.NODE_ENV !== 'test') {
  const result = validateEnvironment()
  
  if (!result.valid && process.env.NODE_ENV === 'production') {
    console.error('Environment validation failed in production!')
    process.exit(1)
  }
}
