import { calculateLevelIncome } from '@/utils/calculations'
import { getUplineChain } from '@/services/referralService'
import { queryOne } from '@/lib/db'
jest.mock('@/lib/db')

describe('calculateLevelIncome - multi-chain scenarios', () => {
  it('Scenario 1: Simple parallel chains (A earnings total = 13.5)', () => {
    // Using provided example: D via C $1000, Z via Y $800, N via M $600
    const fromD = calculateLevelIncome(3, 1000, true) // A level 3 from D
    const fromZ = calculateLevelIncome(3, 800, true)  // A level 3 from Z
    const fromN = calculateLevelIncome(2, 600, true)  // A level 2 from N

    const total = Number((fromD + fromZ + fromN).toFixed(2))
    expect(total).toBeCloseTo(13.5, 2)
  })

  it('Scenario 2: Complex multi-parallel chains (A earnings total = 92.45)', () => {
    const amounts = [] as number[]
    // Event 1: H buys $1000 (A level 7 => 0)
    amounts.push(calculateLevelIncome(7, 1000, true))
    // Event 2: O buys $800 (A level 7 => 0)
    amounts.push(calculateLevelIncome(7, 800, true))
    // Event 3: U2N7 buys $1200 (A level 6 => 0.1%)
    amounts.push(calculateLevelIncome(6, 1200, true))
    // Event 4: A4C3 buys $500 (A level 6 => 0.1%)
    amounts.push(calculateLevelIncome(6, 500, true))
    // Event 5: B buys $2000 (A level 1 => 2%)
    amounts.push(calculateLevelIncome(1, 2000, true))
    // Event 6: I buys $1500 (A level 1 => 2%)
    amounts.push(calculateLevelIncome(1, 1500, true))
    // Event 7: C buys $900 (A level 2 => 0.75%)
    amounts.push(calculateLevelIncome(2, 900, true))
    // Event 8: P7X2 buys $700 (A level 1 => 2%)
    amounts.push(calculateLevelIncome(1, 700, true))

    const total = Number(amounts.reduce((s, v) => s + v, 0).toFixed(2))
    expect(total).toBeCloseTo(92.45, 2)
  })

  it('getUplineChain returns the proper chain from buyer upward', async () => {
    // Mock DB: D -> C -> B -> A chain
    const q = require('@/lib/db')
    // We'll define sequential responses for queryOne: referredBy for D, referrer object for C, referredBy for C, referrer object for B, referredBy for B, referrer object for A, then no referredBy for A
    q.queryOne
      .mockResolvedValueOnce({ referredBy: 'C_REF' })
      .mockResolvedValueOnce({ id: 'C', referralCode: 'C_REF' })
      .mockResolvedValueOnce({ referredBy: 'B_REF' })
      .mockResolvedValueOnce({ id: 'B', referralCode: 'B_REF' })
      .mockResolvedValueOnce({ referredBy: 'A_REF' })
      .mockResolvedValueOnce({ id: 'A', referralCode: 'A_REF' })
      .mockResolvedValueOnce({ referredBy: null })

    const chain = await getUplineChain('D')
    expect(chain).toEqual(['C', 'B', 'A'])
  })
})
