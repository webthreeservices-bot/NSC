/**
 * Production Deployment Checklist
 * Run this before deploying to production
 */

import pool from '../lib/db-connection'
import { validateEnvironment } from '../lib/env-validator'

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
}

async function runChecklist(): Promise<void> {
  console.log('\n🚀 NSC Bot Platform - Production Checklist')
  console.log('==========================================\n')

  const results: CheckResult[] = []

  // 1. Environment Variables
  console.log('📋 Checking Environment Variables...')
  const envValidation = validateEnvironment()
  results.push({
    name: 'Environment Variables',
    status: envValidation.valid ? 'pass' : 'fail',
    message: envValidation.valid ? 'All required variables set' : envValidation.errors.join(', ')
  })

  // 2. Database Connection
  console.log('📋 Checking Database Connection...')
  try {
    // Using the pool to execute a simple query
    const { rows } = await pool.query('SELECT 1')
    
    if (rows && rows.length > 0) {
      results.push({
        name: 'Database Connection',
        status: 'pass',
        message: 'Database connected successfully'
      })
    } else {
      results.push({
        name: 'Database Connection',
        status: 'warning',
        message: 'Database connection test returned unexpected results'
      })
    }
  } catch (error: any) {
    results.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Database connection failed: ${error.message}`
    })
  }

  // 3. Admin User Exists
  console.log('📋 Checking Admin User...')
  try {
    const query = `SELECT * FROM "User" WHERE email = $1 AND "isAdmin" = true LIMIT 1`;
    const { rows } = await pool.query(query, [process.env.ADMIN_EMAIL]);
    const adminUser = rows && rows.length > 0 ? rows[0] : null;
    
    results.push({
      name: 'Admin User',
      status: adminUser ? 'pass' : 'warning',
      message: adminUser ? 'Admin user exists' : 'Admin user not found - run seed script'
    })
  } catch (error) {
    results.push({
      name: 'Admin User',
      status: 'warning',
      message: 'Could not check admin user'
    })
  }

  // 4. System Settings
  console.log('📋 Checking System Settings...')
  try {
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM "SystemSetting"');
    const settingsCount = parseInt(rows[0]?.count || '0', 10);
    
    results.push({
      name: 'System Settings',
      status: settingsCount > 0 ? 'pass' : 'warning',
      message: `${settingsCount} system settings configured`
    })
  } catch (error) {
    results.push({
      name: 'System Settings',
      status: 'warning',
      message: 'Could not check system settings'
    })
  }

  // 5. Security Checks
  console.log('📋 Checking Security Configuration...')
  const securityChecks = []

  if (process.env.NODE_ENV !== 'production') {
    securityChecks.push('NODE_ENV not set to production')
  }

  if (!process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
    securityChecks.push('HTTPS not enforced (URL should start with https://)')
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    securityChecks.push('JWT_SECRET too short (minimum 32 characters)')
  }

  results.push({
    name: 'Security Configuration',
    status: securityChecks.length === 0 ? 'pass' : 'warning',
    message: securityChecks.length === 0 ? 'Security checks passed' : securityChecks.join(', ')
  })

  // 6. Blockchain Configuration
  console.log('📋 Checking Blockchain Configuration...')
  const blockchainChecks = []

  if (!process.env.ADMIN_WALLET_BSC?.startsWith('0x')) {
    blockchainChecks.push('Invalid BSC wallet address')
  }

  if (!process.env.ADMIN_WALLET_TRON?.startsWith('T')) {
    blockchainChecks.push('Invalid TRON wallet address')
  }

  if (!process.env.ADMIN_PRIVATE_KEY_BSC) {
    blockchainChecks.push('BSC private key not set')
  }

  if (!process.env.ADMIN_PRIVATE_KEY_TRON) {
    blockchainChecks.push('TRON private key not set')
  }

  results.push({
    name: 'Blockchain Configuration',
    status: blockchainChecks.length === 0 ? 'pass' : 'fail',
    message: blockchainChecks.length === 0 ? 'Blockchain configured correctly' : blockchainChecks.join(', ')
  })

  // Print Results
  console.log('\n📊 Checklist Results')
  console.log('==========================================\n')

  let passCount = 0
  let failCount = 0
  let warningCount = 0

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
    console.log(`${icon} ${result.name}`)
    console.log(`   ${result.message}\n`)

    if (result.status === 'pass') passCount++
    else if (result.status === 'fail') failCount++
    else warningCount++
  })

  console.log('==========================================')
  console.log(`✅ Passed: ${passCount}`)
  console.log(`⚠️  Warnings: ${warningCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('==========================================\n')

  if (failCount > 0) {
    console.log('❌ DEPLOYMENT BLOCKED: Fix all failed checks before deploying to production.\n')
    process.exit(1)
  } else if (warningCount > 0) {
    console.log('⚠️  WARNINGS DETECTED: Review warnings before deploying to production.\n')
  } else {
    console.log('✅ ALL CHECKS PASSED: Ready for production deployment!\n')
  }
}

// Run checklist
runChecklist().catch(error => {
  console.error('Checklist failed:', error)
  process.exit(1)
})
