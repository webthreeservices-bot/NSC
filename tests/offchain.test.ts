import { describe, expect, test, beforeAll, afterAll } from '@jest/globals'
import * as fs from 'fs'

describe('Offchain web3-disabled behavior', () => {
  test('blockchain sendUsdt returns offchain tx', async () => {
    const blockchain = await import('@/lib/blockchain')
    const tx = await blockchain.sendUsdt('0x0000000000000000000000000000000000000000', 1, (await import('@/types')).Network.BEP20)
    expect(typeof tx).toBe('string')
    expect(tx.startsWith('OFFCHAIN_')).toBe(true)
  })

  test('verifyBlockchainTransaction returns true', async () => {
    const blockchain = await import('@/lib/blockchain')
    const ok = await blockchain.verifyBlockchainTransaction('OFFCHAIN_TX', (await import('@/types')).Network.BEP20, 1, '0x0000000000000000000000000000000000000000')
    expect(ok).toBe(true)
  })

  test('detectWallet respects WEB3_DISABLED env', async () => {
    const orig = process.env.NEXT_PUBLIC_WEB3_DISABLED
    try {
      process.env.NEXT_PUBLIC_WEB3_DISABLED = 'true'
      jest.resetModules()
      const walletService = await import('@/services/walletService')
      const { detectWallet } = walletService
      expect(detectWallet()).toBe(null)
    } finally {
      process.env.NEXT_PUBLIC_WEB3_DISABLED = orig
      jest.resetModules()
    }
  })
})
