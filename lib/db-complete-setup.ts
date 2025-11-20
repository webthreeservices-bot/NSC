/**
 * Complete Database Setup and Initialization
 * This module provides a comprehensive database initialization solution
 * that combines all schema files and ensures complete setup
 */

const pool = require('./db-connection').default
const fs = require('fs')
const path = require('path')

interface SetupResult {
  success: boolean
  message: string
  tablesCreated?: number
  errors?: string[]
}

interface TableCount {
  count: string
}

/**
 * Complete database setup - combines all schema files
 */
export async function setupCompleteDatabase(): Promise<SetupResult> {
  const errors: string[] = []
  let tablesCreated = 0

  try {
    console.log('🚀 Starting complete database setup...')

    // Test connection first
    console.log('📡 Testing database connection...')
    let client
    try {
      client = await pool.connect()
      await client.query('SELECT NOW()')
      console.log('✅ Database connection successful')
    } catch (connError) {
      return {
        success: false,
        message: `❌ Database connection failed: ${connError.message}`,
        errors: [connError.message]
      }
    } finally {
      if (client) client.release()
    }

    // 1. Run main schema
    console.log('📋 Creating main database schema...')
    try {
      await runMainSchema()
      console.log('✅ Main schema created')
    } catch (error) {
      errors.push(`Main schema error: ${error.message}`)
      console.error('❌ Main schema failed:', error.message)
    }

    // 2. Run payment schema
    console.log('💳 Creating payment system tables...')
    try {
      await runPaymentSchema()
      console.log('✅ Payment system created')
    } catch (error) {
      errors.push(`Payment schema error: ${error.message}`)
      console.error('❌ Payment schema failed:', error.message)
    }

    // 3. Run crypto wallet schema
    console.log('🏦 Creating crypto wallet tables...')
    try {
      await runCryptoWalletSchema()
      console.log('✅ Crypto wallet tables created')
    } catch (error) {
      errors.push(`Crypto wallet schema error: ${error.message}`)
      console.error('❌ Crypto wallet schema failed:', error.message)
    }

    // 4. Create missing authentication tables
    console.log('🔐 Creating authentication tables...')
    try {
      await createAuthenticationTables()
      console.log('✅ Authentication tables created')
    } catch (error) {
      errors.push(`Authentication tables error: ${error.message}`)
      console.error('❌ Authentication tables failed:', error.message)
    }

    // 5. Create missing system tables
    console.log('⚙️ Creating additional system tables...')
    try {
      await createAdditionalSystemTables()
      console.log('✅ Additional system tables created')
    } catch (error) {
      errors.push(`Additional system tables error: ${error.message}`)
      console.error('❌ Additional system tables failed:', error.message)
    }

    // 6. Initialize default data
    console.log('📊 Initializing default data...')
    try {
      await initializeDefaultData()
      console.log('✅ Default data initialized')
    } catch (error) {
      errors.push(`Default data error: ${error.message}`)
      console.error('❌ Default data failed:', error.message)
    }

    // Count total tables created
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `)
      tablesCreated = parseInt((result.rows[0] as TableCount).count)
      console.log(`📊 Total tables in database: ${tablesCreated}`)
    } catch (countError) {
      console.warn('Could not count tables:', countError.message)
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `⚠️ Database setup completed with ${errors.length} errors`,
        tablesCreated,
        errors
      }
    }

    console.log('🎉 Complete database setup finished successfully!')
    return {
      success: true,
      message: '✅ Complete database setup successful',
      tablesCreated
    }

  } catch (error) {
    console.error('❌ Fatal error during database setup:', error)
    return {
      success: false,
      message: `❌ Fatal error: ${error.message}`,
      errors: [error.message]
    }
  }
}

/**
 * Run main database schema
 */
async function runMainSchema(): Promise<void> {
  const schemaPath = path.join(process.cwd(), 'lib', 'db-schema.sql')
  
  if (!fs.existsSync(schemaPath)) {
    // Fallback to neon-schema.sql
    const neonSchemaPath = path.join(process.cwd(), 'neon-schema.sql')
    if (fs.existsSync(neonSchemaPath)) {
      const schema = fs.readFileSync(neonSchemaPath, 'utf8')
      await pool.query(schema)
      return
    }
    throw new Error('No main schema file found')
  }

  const schema = fs.readFileSync(schemaPath, 'utf8')
  await pool.query(schema)
}

/**
 * Run payment system schema
 */
async function runPaymentSchema(): Promise<void> {
  const paymentSchemaPath = path.join(process.cwd(), 'lib', 'db-payment-schema.sql')
  
  if (!fs.existsSync(paymentSchemaPath)) {
    console.warn('Payment schema file not found, skipping...')
    return
  }

  const schema = fs.readFileSync(paymentSchemaPath, 'utf8')
  await pool.query(schema)
}

/**
 * Run crypto wallet schema
 */
async function runCryptoWalletSchema(): Promise<void> {
  const cryptoSchemaPath = path.join(process.cwd(), 'lib', 'crypto-wallet-schema.sql')
  
  if (!fs.existsSync(cryptoSchemaPath)) {
    console.warn('Crypto wallet schema file not found, creating inline...')
    await createCryptoWalletTableInline()
    return
  }

  const schema = fs.readFileSync(cryptoSchemaPath, 'utf8')
  await pool.query(schema)
}

/**
 * Create crypto wallet table inline
 */
async function createCryptoWalletTableInline(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "CryptoWallet" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "address" TEXT NOT NULL UNIQUE,
      "network" TEXT NOT NULL CHECK ("network" IN ('TRC20', 'BEP20', 'ERC20')),
      "privateKey" TEXT,
      "isDeposit" BOOLEAN NOT NULL DEFAULT true,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "balance" DECIMAL(20, 8) DEFAULT 0,
      "lastScanned" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS "idx_cryptowallet_user" ON "CryptoWallet"("userId");
    CREATE INDEX IF NOT EXISTS "idx_cryptowallet_network" ON "CryptoWallet"("network");
    CREATE INDEX IF NOT EXISTS "idx_cryptowallet_address" ON "CryptoWallet"("address");
  `)
}

/**
 * Create missing authentication tables
 */
async function createAuthenticationTables(): Promise<void> {
  // Email verification table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "EmailVerification" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "email" TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "usedAt" TIMESTAMP
    );
  `)

  // Password reset table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "PasswordReset" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "email" TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "usedAt" TIMESTAMP
    );
  `)

  // Session table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "refreshToken" TEXT,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "lastUsedAt" TIMESTAMP
    );
  `)

  // Login attempt table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "LoginAttempt" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "email" TEXT NOT NULL,
      "ipAddress" TEXT NOT NULL,
      "userAgent" TEXT,
      "success" BOOLEAN NOT NULL DEFAULT false,
      "failureReason" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // Two factor backup codes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "TwoFactorBackupCode" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "used" BOOLEAN NOT NULL DEFAULT false,
      "usedAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // User activity log
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "UserActivityLog" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "details" JSONB,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)
}

/**
 * Create additional system tables
 */
async function createAdditionalSystemTables(): Promise<void> {
  // KYC submissions
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "KycSubmission" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "documentType" TEXT NOT NULL,
      "documentNumber" TEXT,
      "frontImageUrl" TEXT,
      "backImageUrl" TEXT,
      "selfieUrl" TEXT,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "rejectionReason" TEXT,
      "submittedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "reviewedAt" TIMESTAMP,
      "reviewedBy" TEXT
    );
  `)

  // Notifications
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Notification" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'INFO',
      "read" BOOLEAN NOT NULL DEFAULT false,
      "readAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // API keys
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "ApiKey" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "keyHash" TEXT NOT NULL UNIQUE,
      "permissions" JSONB,
      "lastUsedAt" TIMESTAMP,
      "expiresAt" TIMESTAMP,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)
}

/**
 * Initialize default data
 */
async function initializeDefaultData(): Promise<void> {
  // Initialize referral counter if not exists
  await pool.query(`
    INSERT INTO "ReferralCounter" ("counterType", "currentValue")
    VALUES ('NSCREF', 1000)
    ON CONFLICT ("counterType") DO NOTHING;
  `)

  // Initialize blockchain scan state
  await pool.query(`
    INSERT INTO "BlockchainScanState" ("id", "network", "lastScannedBlock", "lastScanTime", "updatedAt")
    VALUES
      (gen_random_uuid()::text, 'BEP20', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (gen_random_uuid()::text, 'TRC20', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT ("network") DO NOTHING;
  `)

  // Check if system settings exist
  const settingsCount = await pool.query(`SELECT COUNT(*) FROM "SystemSetting"`)
  
  if (parseInt(settingsCount.rows[0].count) === 0) {
    console.log('Initializing system settings...')
    await pool.query(`
      INSERT INTO "SystemSetting" ("id", "key", "value", "description", "updatedAt") VALUES
      (gen_random_uuid()::text, 'MIN_WITHDRAWAL', '20', 'Minimum withdrawal amount in USDT', NOW()),
      (gen_random_uuid()::text, 'WITHDRAWAL_FEE', '10', 'Withdrawal fee percentage', NOW()),
      (gen_random_uuid()::text, 'WITHDRAWAL_COOLDOWN', '30', 'Days between withdrawals', NOW()),
      (gen_random_uuid()::text, 'DIRECT_REFERRAL_BONUS', '2', 'Direct referral bonus percentage', NOW()),
      (gen_random_uuid()::text, 'LEVEL_1_INCOME', '2', 'Level 1 income percentage', NOW()),
      (gen_random_uuid()::text, 'LEVEL_2_INCOME', '0.75', 'Level 2 income percentage', NOW()),
      (gen_random_uuid()::text, 'LEVEL_3_INCOME', '0.50', 'Level 3 income percentage', NOW()),
      (gen_random_uuid()::text, 'LEVEL_4_INCOME', '0.25', 'Level 4 income percentage', NOW()),
      (gen_random_uuid()::text, 'LEVEL_5_INCOME', '0.15', 'Level 5 income percentage', NOW()),
      (gen_random_uuid()::text, 'LEVEL_6_INCOME', '0.10', 'Level 6 income percentage', NOW()),
      (gen_random_uuid()::text, 'PLATFORM_STATUS', 'active', 'Platform operational status', NOW()),
      (gen_random_uuid()::text, 'MAX_PACKAGE_COUNT', '1', 'Maximum packages per user', NOW()),
      (gen_random_uuid()::text, 'PLATFORM_NAME', 'NSC Bot Platform', 'Platform display name', NOW())
      ON CONFLICT ("key") DO NOTHING;
    `)
  }
}

/**
 * Verify database setup
 */
export async function verifyDatabaseSetup(): Promise<{ success: boolean; tableCount: number; missingTables: string[] }> {
  try {
    // Expected tables for complete setup
    const expectedTables = [
      'User', 'ReferralCounter', 'SystemSetting', 'AdminLog',
      'EmailVerification', 'PasswordReset', 'Session', 'LoginAttempt', 'TwoFactorBackupCode', 'UserActivityLog',
      'Package', 'BotActivation', 'RoiPayment', 'Earning',
      'Transaction', 'Withdrawal',
      'PaymentRequest', 'PaymentWebhook', 'PaymentConfirmation', 'BlockchainScanState', 'CryptoWallet',
      'KycSubmission', 'Notification', 'ApiKey'
    ]

    // Get all existing tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)

    const existingTables = result.rows.map((row: any) => row.table_name)
    const missingTables = expectedTables.filter(table => !existingTables.includes(table))

    return {
      success: missingTables.length === 0,
      tableCount: existingTables.length,
      missingTables
    }
  } catch (error) {
    console.error('Error verifying database setup:', error)
    return {
      success: false,
      tableCount: 0,
      missingTables: []
    }
  }
}

/**
 * Quick database health check
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    // Test basic connectivity and core tables
    await pool.query('SELECT 1')
    await pool.query('SELECT COUNT(*) FROM "User"')
    await pool.query('SELECT COUNT(*) FROM "ReferralCounter"')
    await pool.query('SELECT COUNT(*) FROM "SystemSetting"')
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

module.exports = {
  setupCompleteDatabase,
  verifyDatabaseSetup,
  quickHealthCheck
}