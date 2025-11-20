/**
 * Payment System Test Script
 * Tests the payment processing system functionality
 *
 * Usage:
 *   npx ts-node scripts/test-payment-system.ts
 */

import {
  createPaymentRequest,
  getPaymentRequestStatus,
  getPaymentStatistics,
} from '../services/paymentGatewayService'
import { query, queryOne } from '../lib/db'

async function ensureTestUser(): Promise<string> {
  const existingUser = await queryOne<{ id: string }>(
    'SELECT "id" FROM "User" WHERE "email" = $1',
    ['test@example.com']
  )

  if (existingUser) {
    console.log(`✓ Using existing test user: ${existingUser.id}`)
    return existingUser.id
  }

  const newUser = await queryOne<{ id: string }>(
    `INSERT INTO "User" (
      "id",
      "username",
      "email",
      "password",
      "referralCode",
      "isActive",
      "createdAt",
      "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, true, NOW(), NOW()
    ) RETURNING "id"`,
    [
      `test-user-${Date.now()}`,
      'testuser',
      'test@example.com',
      'hashedpassword',
      'TEST001',
    ]
  )

  if (!newUser) {
    throw new Error('Failed to create test user')
  }

  console.log(`✓ Test user created: ${newUser.id}`)
  return newUser.id
}

async function logTableCounts(tables: string[]) {
  for (const table of tables) {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "${table}"`
    )
    console.log(`✓ ${table}: ${result[0]?.count ?? '0'} records`)
  }
}

export async function testPaymentSystem() {
  console.log('Testing payment system...\n')

  try {
    // Test 1: Create or reuse test user
    console.log('1. Ensuring test user exists...')
    const userId = await ensureTestUser()

    // Test 2: Create payment request for BEP20
    console.log('\n2. Creating BEP20 payment request...')
    const bep20Payment = await createPaymentRequest({
      userId,
      purpose: 'PACKAGE_PURCHASE',
      amount: 100,
      network: 'BEP20',
      metadata: {
        packageId: 'test-pkg-123',
        packageType: 'NEO',
      },
    })

    console.log('✓ BEP20 payment request created:')
    console.log(`  - ID: ${bep20Payment.id}`)
    console.log(`  - Amount: ${bep20Payment.amount} USDT`)
    console.log(`  - Network: ${bep20Payment.network}`)
    console.log(`  - Deposit Address: ${bep20Payment.depositAddress}`)
    console.log(`  - Status: ${bep20Payment.status}`)
    console.log(`  - Expires in: ${bep20Payment.expiresIn} seconds`)

    // Test 3: Create payment request for TRC20
    console.log('\n3. Creating TRC20 payment request...')
    const trc20Payment = await createPaymentRequest({
      userId,
      purpose: 'BOT_ACTIVATION',
      amount: 50,
      network: 'TRC20',
      metadata: {
        botId: 'test-bot-456',
        botType: 'NEURAL',
      },
    })

    console.log('✓ TRC20 payment request created:')
    console.log(`  - ID: ${trc20Payment.id}`)
    console.log(`  - Amount: ${trc20Payment.amount} USDT`)
    console.log(`  - Network: ${trc20Payment.network}`)
    console.log(`  - Deposit Address: ${trc20Payment.depositAddress}`)
    console.log(`  - Status: ${trc20Payment.status}`)

    // Test 4: Get payment status
    console.log('\n4. Getting payment status...')
    const status = await getPaymentRequestStatus(bep20Payment.id)
    console.log('✓ Payment status retrieved:')
    console.log(`  - Status: ${status.status}`)
    console.log(`  - Amount: ${status.amount}`)
    console.log(`  - Created: ${status.createdAt}`)

    // Test 5: Get payment statistics
    console.log('\n5. Getting payment statistics...')
    const stats = await getPaymentStatistics()
    console.log('✓ Payment statistics:')
    console.log(`  - Total requests: ${stats.total}`)
    console.log(`  - Pending: ${stats.pending}`)
    console.log(`  - Confirming: ${stats.confirming}`)
    console.log(`  - Completed: ${stats.completed}`)
    console.log(`  - Success rate: ${stats.successRate}%`)

    // Test 6: Check database tables
    console.log('\n6. Verifying database tables...')
    await logTableCounts([
      'PaymentRequest',
      'PaymentWebhook',
      'BlockchainScanState',
      'PaymentConfirmation',
    ])

    console.log('\n✓ All tests passed!')
    console.log('\nPayment request IDs for testing:')
    console.log(`  - BEP20: ${bep20Payment.id}`)
    console.log(`  - TRC20: ${trc20Payment.id}`)
    console.log('\nYou can use these IDs to test the API endpoints.')
  } catch (error) {
    console.error('✗ Test failed:', error)
    throw error
  }
}

if (require.main === module) {
  testPaymentSystem()
    .then(() => {
      console.log('\nTest completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Test error:', error)
      process.exit(1)
    })
}