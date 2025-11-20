import { describe, it, expect } from '@jest/globals'
import { createPaymentRequest, manuallyVerifyPayment } from '@/services/paymentGatewayService'
import { findUnique, update } from '@/lib/db-queries'
import { POST as approvePayment } from '@/app/api/admin/payments/approve/route'
import { POST as approveBot } from '@/app/api/admin/bots/approve/route'

// Mock admin user context
const adminRequest = (body: any) => ({
  json: async () => body,
  headers: { get: () => 'Bearer admin-token' },
  // ...mock NextRequest as needed
})

// Mock authenticateToken to always return admin
jest.mock('@/middleware/auth', () => ({
  authenticateToken: async () => ({ user: { userId: 'admin', role: 'ADMIN' } })
}))

describe('Admin Approval Flow', () => {
  it('should approve a payment and trigger payout', async () => {
    // Create a payment request
    const payment = await createPaymentRequest({
      userId: 'user1',
      purpose: 'PACKAGE_PURCHASE',
      amount: 100,
      network: 'BEP20',
    })
    // Simulate on-chain verification
    await update('PaymentRequest', { where: { id: payment.id }, data: { status: 'AWAITING_ADMIN_APPROVAL' } })
    // Approve payment
    const res = await approvePayment(adminRequest({ paymentRequestId: payment.id, userWallet: payment.depositAddress }))
    expect(res.status).toBe(200)
    const updated = await findUnique('PaymentRequest', { where: { id: payment.id } })
    expect(updated.status).toBe('COMPLETED')
  })

  it('should approve a bot activation', async () => {
    // Create a bot activation (simulate DB insert)
    const bot = await update('BotActivation', { where: { id: 'bot1' }, data: { status: 'AWAITING_ADMIN_APPROVAL', userId: 'user1' } })
    // Approve bot
    const res = await approveBot(adminRequest({ botActivationId: 'bot1' }))
    expect(res.status).toBe(200)
    const updated = await findUnique('BotActivation', { where: { id: 'bot1' } })
    expect(updated.status).toBe('ACTIVE')
  })
})
