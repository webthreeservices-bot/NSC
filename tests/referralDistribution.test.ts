import { distributeReferralEarningsOnChain } from '@/services/referralService'

jest.mock('@/lib/db', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
  execute: jest.fn(),
}))

jest.mock('@/lib/blockchain', () => ({
  sendUsdt: jest.fn(),
}))

jest.mock('@/lib/queue', () => ({
  default: {
    add: jest.fn(),
  }
}))

const { query, queryOne, execute } = require('@/lib/db')
const { sendUsdt } = require('@/lib/blockchain')

describe('distributeReferralEarningsOnChain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should distribute pending earnings on chain and update transactions', async () => {
    process.env.ENABLE_ONCHAIN_DISTRIBUTION = 'true'
    const packageId = 'pkg-1'
    const network = 'BEP20'
    // sample pending earnings rows
    const pending = [
      {
        id: 'earn1',
        userId: 'user1',
        amount: '100',
        transactionId: 'tx-1',
        walletAddress: '0xabc',
        network: 'BEP20'
      },
    ]

    query.mockResolvedValueOnce({ rows: pending })
    // package lookup for expected total
    queryOne.mockResolvedValueOnce({ id: packageId, purchaserId: 'userX', amount: 1000 })
    // chain lookup
    queryOne.mockResolvedValueOnce({ id: 'userX' })
    // mock sendUsdt
    sendUsdt.mockResolvedValueOnce('txHash123')

    // call
    const result = await distributeReferralEarningsOnChain(packageId, network)

    expect(sendUsdt).toHaveBeenCalled()
    expect(execute).toHaveBeenCalled()
    expect(result.success).toBeGreaterThanOrEqual(0)
  })

  it('marks earnings as PAID_OFFCHAIN when ENABLE_ONCHAIN_DISTRIBUTION is false', async () => {
    process.env.ENABLE_ONCHAIN_DISTRIBUTION = 'false'
    const packageId = 'pkg-2'
    const network = 'BEP20'
    const pending = [
      {
        id: 'earn2',
        userId: 'user2',
        amount: '50',
        transactionId: 'tx-2',
        walletAddress: '0xdef',
        network: 'BEP20'
      }
    ]
    query.mockResolvedValueOnce({ rows: pending })
    queryOne.mockResolvedValueOnce({ id: packageId, purchaserId: 'userX', amount: 100 })
    queryOne.mockResolvedValueOnce({ id: 'userX' })

    const result = await distributeReferralEarningsOnChain(packageId, network)
    expect(sendUsdt).not.toHaveBeenCalled()
    expect(execute).toHaveBeenCalled()
    expect(result.success).toBeGreaterThanOrEqual(0)
  })
})
