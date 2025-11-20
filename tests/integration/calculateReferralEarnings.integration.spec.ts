// Suppress verbose DB logs during tests to keep the console clean and avoid event logging race conditions
process.env.VERBOSE_DB_LOGS = 'false'
import { getClientWithTimeout } from '@/lib/db-connection'
import { disconnect } from '@/lib/db'

describe('calculate_referral_earnings integration', () => {
  it('creates Earning and LostCommission rows correctly', async () => {
    // Use the shared pool with our getClientWithTimeout helper; this ensures the same settings
    const client = await getClientWithTimeout(30000)
    try {
      await client.query('BEGIN')

      // Create users A, B, C, D
      const { rows: aRows } = await client.query(`INSERT INTO "User" (id, email, password, username, "referralCode") VALUES (gen_random_uuid()::text, 'a@test.local', 'pwd', 'a', 'AREF') RETURNING id`)
      const aId = aRows[0].id
      const { rows: bRows } = await client.query(`INSERT INTO "User" (id, email, password, username, "referralCode", "referredBy") VALUES (gen_random_uuid()::text, 'b@test.local', 'pwd', 'b', 'BREF', 'AREF') RETURNING id`)
      const bId = bRows[0].id
      const { rows: cRows } = await client.query(`INSERT INTO "User" (id, email, password, username, "referralCode", "referredBy") VALUES (gen_random_uuid()::text, 'c@test.local', 'pwd', 'c', 'CREF', 'BREF') RETURNING id`)
      const cId = cRows[0].id
      const { rows: dRows } = await client.query(`INSERT INTO "User" (id, email, password, username, "referredBy") VALUES (gen_random_uuid()::text, 'd@test.local', 'pwd', 'd', 'CREF') RETURNING id`)
      const dId = dRows[0].id

      // Create BotActivation for A and B only
      await client.query(`INSERT INTO "BotActivation" (id, "userId", "botType", "activationFee", status) VALUES (gen_random_uuid()::text, $1, 'NEO', 50, 'ACTIVE')`, [aId])
      await client.query(`INSERT INTO "BotActivation" (id, "userId", "botType", "activationFee", status) VALUES (gen_random_uuid()::text, $1, 'NEO', 50, 'ACTIVE')`, [bId])

      // Create package for D
      const packageRes = await client.query(`INSERT INTO "Package" (id, "userId", amount, "packageType", "roiPercentage", status, "investmentDate") VALUES (gen_random_uuid()::text, $1, $2, 'NEO', 3.00, 'PENDING', NOW()) RETURNING id`, [dId, 1000])
      const packageId = packageRes.rows[0].id

      // Call the function to calculate referral earnings
      const res = await client.query('SELECT * FROM calculate_referral_earnings($1, $2, $3)', [packageId, dId, 1000])

      // Fetch Earning rows for this package
      const earnings = await client.query('SELECT * FROM "Earning" WHERE "packageId" = $1 ORDER BY level', [packageId])
      const lost = await client.query('SELECT * FROM "LostCommission" WHERE "packageId" = $1', [packageId])

      // B and A should have earnings (levels 2 & 3); C should have a lost commission at level 1
      // Level amounts: Level 2 (B) = 0.75% of 1000 = 7.5; Level 3 (A) = 0.5% = 5.0
      const bEarning = earnings.rows.find((r: any) => r.userId === bId)
      const aEarning = earnings.rows.find((r: any) => r.userId === aId)
      const lostC = lost.rows.find((r: any) => r.wouldBeRecipientId === cId)

      expect(bEarning).toBeDefined()
      expect(Number(bEarning.amount)).toBeCloseTo(7.5, 6)
      expect(aEarning).toBeDefined()
      expect(Number(aEarning.amount)).toBeCloseTo(5.0, 6)
      expect(lostC).toBeDefined()
      expect(Number(lostC.amount)).toBeCloseTo(20.0, 6)

      // Rollback any DB changes
      await client.query('ROLLBACK')
    } catch (err) {
      try { await client.query('ROLLBACK') } catch(e) { /* ignore */ }
      throw err
    } finally {
      // Rollback/cleanup if transaction is left open
      try { await client.query('ROLLBACK') } catch(e) { }
      client.release()
      // gracefully shutdown the global shared pool
      await disconnect()
    }
  }, 120000)
})
