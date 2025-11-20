import { NextRequest, NextResponse } from 'next/server'
import { fetchCompleteTransactionData } from '@/lib/blockchain-scanner'

// Force dynamic rendering - this route uses request data
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/blockchain/transaction
 * Fetch real blockchain transaction data by txHash
 * Query params: txHash, network (BEP20 or TRC20)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const txHash = searchParams.get('txHash')
    const network = searchParams.get('network') as 'BEP20' | 'TRC20'
    
    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      )
    }
    
    if (!network || !['BEP20', 'TRC20'].includes(network)) {
      return NextResponse.json(
        { error: 'Valid network is required (BEP20 or TRC20)' },
        { status: 400 }
      )
    }
    
    // Fetch blockchain data
    const blockchainData = await fetchCompleteTransactionData(txHash, network)
    
    if (!blockchainData) {
      return NextResponse.json(
        { error: 'Transaction not found on blockchain' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: blockchainData
    })
    
  } catch (error: any) {
    console.error('Error fetching blockchain transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blockchain data', details: error.message },
      { status: 500 }
    )
  }
}
