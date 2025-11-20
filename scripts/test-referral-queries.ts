import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { query, queryOne, queryScalar, disconnect } from '../lib/db'
import { testConnection } from '../lib/db-connection'

type UserRef = {
  id: string
  email: string
  username: string | null
  createdAt: Date
  isActive: boolean
}

export async function testReferralQueries() {
  console.log('Testing database connection...')
  const isConnected = await testConnection()

  if (!isConnected) {
    console.error('Failed to connect to database')
    process.exit(1)
  }

  console.log('Database connected successfully!')

  try {
    console.log('\n1. Finding a user with a referral code...')
    const userWithReferral = await queryOne<{
      id: string
      referralCode: string | null
      email: string
    }>(
      `SELECT "id", "referralCode", "email"
       FROM "User"
       WHERE "referralCode" IS NOT NULL
       ORDER BY "createdAt" DESC
       LIMIT 1`
    )

    if (!userWithReferral?.referralCode) {
      console.warn('No users with referral codes were found.')
      return
    }

    console.log('User result:', userWithReferral)

    console.log('\n2. Fetching referrals for this code...')
    const referrals = await query<UserRef>(
      `SELECT "id", "email", "username", "createdAt", "isActive"
       FROM "User"
       WHERE "referredBy" = $1
       ORDER BY "createdAt" DESC
       LIMIT 25`,
      [userWithReferral.referralCode]
    )

    console.log(`Referrals found: ${referrals.length}`)

    if (referrals.length > 0) {
      const firstReferral = referrals[0]
      const packages = await query<{ amount: string; status: string }>(
        `SELECT "amount"::text AS amount, "status"
         FROM "Package"
         WHERE "userId" = $1
         ORDER BY "createdAt" DESC
         LIMIT 5`,
        [firstReferral.id]
      )

      console.log(
        'First referral sample:',
        JSON.stringify({ ...firstReferral, packages }, null, 2)
      )
    }

    console.log('\n3. Calculating referral earnings total...')
    const totalReferral = await queryOne<{ total: string | null }>(
      `SELECT COALESCE(SUM("amount"), 0)::text AS total
       FROM "Earning"
       WHERE "userId" = $1
         AND "type" = 'REFERRAL'`,
      [userWithReferral.id]
    )
    console.log('Total referral earnings:', totalReferral?.total ?? '0')

    console.log('\n4. Calculating earnings with multiple types...')
    const multiTypeEarnings = await queryOne<{ total: string | null }>(
      `SELECT COALESCE(SUM("amount"), 0)::text AS total
       FROM "Earning"
       WHERE "userId" = $1
         AND "type" IN ('REFERRAL', 'ROI')`,
      [userWithReferral.id]
    )
    console.log('Total earnings (REFERRAL + ROI):', multiTypeEarnings?.total ?? '0')

    console.log('\n5. Counting total users...')
    const userCount = await queryScalar<number>('SELECT COUNT(*)::int FROM "User"')
    console.log('Total users:', userCount ?? 0)
  } catch (error) {
    console.error('Error during testing:', error)
    throw error
  } finally {
    await disconnect()
  }
}

if (require.main === module) {
  testReferralQueries()
    .then(() => {
      console.log('\nReferral query tests completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Referral query test failed:', error)
      process.exit(1)
    })
}