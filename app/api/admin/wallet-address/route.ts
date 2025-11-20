import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken, requireAdmin } from '@/middleware/auth'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// Admin wallet addresses - ONLY accessible server-side
const ADMIN_WALLETS = {
  BEP20: process.env.ADMIN_WALLET_BSC || '0xE177859890C71Ab134cB90Dd03F4698802F6C8cb',
  TRC20: process.env.ADMIN_WALLET_TRON || 'TAxwG7ADfQcZjDUvm8vQgKbWSGQruviDMG',
  ERC20: process.env.ADMIN_WALLET_ETH || '0xE177859890C71Ab134cB90Dd03F4698802F6C8cb'
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user - ALL authenticated users can view wallet addresses for payments
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { user } = authResult

    // Get network from query parameter
    const { searchParams } = new URL(request.url)
    const network = searchParams.get('network')

    if (!network || !['BEP20', 'TRC20', 'ERC20'].includes(network)) {
      return NextResponse.json(
        { success: false, error: 'Invalid network' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      walletAddress: ADMIN_WALLETS[network as keyof typeof ADMIN_WALLETS],
      network
    })
  } catch (error) {
    console.error('Get admin wallet error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get admin wallet address' },
      { status: 500 }
    )
  }
}
