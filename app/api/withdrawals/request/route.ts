import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { validateRequest, withdrawalSchema } from '@/middleware/validation'
import { withdrawalLimiter } from '@/middleware/rateLimiter'
import { createWithdrawal } from '@/services/withdrawalService'
import { handleOptions } from '@/lib/cors'
import { queryOne } from '@/lib/db'
import speakeasy from 'speakeasy'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Rate limiting
  const rateLimitResult = await withdrawalLimiter(request)
  if (rateLimitResult) return rateLimitResult

  try {
    const body = await request.json()
    
    // Validate request
    const validation = validateRequest(body, withdrawalSchema)
  // validation is a union; cast to any to access the error response
  if (!validation.success) return (validation as any).error
    
    const { amount, type, walletAddress, network, twoFactorCode, txHash } = validation.data

    // Fetch full user data including 2FA secret
    const userData = await queryOne(
      'SELECT "twoFactorEnabled", "twoFactorSecret" FROM "User" WHERE id = $1',
      [user.userId]
    )

    // If 2FA is enabled, verify the code
    if (userData.twoFactorEnabled) {
      if (!twoFactorCode) {
        return NextResponse.json(
          { error: '2FA code required for withdrawal' },
          { status: 401 }
        )
      }

      // CRITICAL: Actually verify the 2FA code
      const isValid = speakeasy.totp.verify({
        secret: userData.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2 // Allow 2 time steps before/after for clock skew
      })

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 401 }
        )
      }
    }

    // Create withdrawal
    const withdrawal = await createWithdrawal(
      user.id,
      amount,
      (type as any),
      walletAddress,
      (network as any),
      txHash
    )

    // Check if auto-approval is enabled
    const autoApproveEnabled = await queryScalar(
      'SELECT "value" FROM "SystemSetting" WHERE "key" = $1',
      ['AUTO_APPROVE_WITHDRAWALS']
    )

    if (autoApproveEnabled === 'true') {
      // Check auto-approval conditions
      const maxAutoApproveAmount = parseFloat(await queryScalar(
        'SELECT "value" FROM "SystemSetting" WHERE "key" = $1',
        ['AUTO_APPROVE_WITHDRAWALS_MAX_AMOUNT']
      ) || '0')

      const kycRequired = await queryScalar(
        'SELECT "value" FROM "SystemSetting" WHERE "key" = $1',
        ['AUTO_APPROVE_WITHDRAWALS_KYC_REQUIRED']
      )

      const processingDelay = parseInt(await queryScalar(
        'SELECT "value" FROM "SystemSetting" WHERE "key" = $1',
        ['WITHDRAWAL_PROCESSING_DELAY']
      ) || '0')

      // Check if withdrawal qualifies for auto-approval
      const qualifiesForAutoApproval = 
        (maxAutoApproveAmount === 0 || amount <= maxAutoApproveAmount) &&
        (!kycRequired || userData.kycStatus === 'APPROVED')

      if (qualifiesForAutoApproval) {
        try {
          if (processingDelay > 0) {
            // Schedule delayed processing
            setTimeout(async () => {
              try {
                await approveWithdrawal(withdrawal.id, 'SYSTEM_AUTO')
                console.log(`Auto-approved withdrawal ${withdrawal.id} after ${processingDelay} minutes`)
              } catch (error) {
                console.error(`Failed to auto-approve withdrawal ${withdrawal.id}:`, error)
              }
            }, processingDelay * 60 * 1000)
          } else {
            // Process immediately
            await approveWithdrawal(withdrawal.id, 'SYSTEM_AUTO')
            console.log(`Auto-approved withdrawal ${withdrawal.id} immediately`)
          }
        } catch (error) {
          console.error(`Failed to auto-approve withdrawal ${withdrawal.id}:`, error)
          // Continue with manual approval flow
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: autoApproveEnabled === 'true' ? 
        'Withdrawal request submitted and will be processed automatically.' : 
        'Withdrawal request submitted. It will be processed by admin within 24-48 hours.',
      withdrawal
    }, { status: 201 })

  } catch (error: any) {
    console.error('Withdrawal request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create withdrawal request' },
      { status: 500 }
    )
  }
}
