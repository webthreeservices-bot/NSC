import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { approveWithdrawal } from '@/services/withdrawalService'
import { z } from 'zod'

const approveSchema = z.object({}) // No longer need txHash

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    const body = await request.json()
    const { id: withdrawalId } = await params
    
    const validation = approveSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Approve withdrawal (now automatically sends the transaction)
    await approveWithdrawal(withdrawalId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Withdrawal approved and processed successfully'
    })

  } catch (error: any) {
    console.error('Approve withdrawal error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve withdrawal' },
      { status: 500 }
    )
  }
}
