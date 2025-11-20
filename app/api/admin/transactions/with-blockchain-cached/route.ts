import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { neonQuery } from '@/lib/neon-serverless'
import { fetchCompleteTransactionData } from '@/lib/blockchain-scanner'
import pool from '@/lib/db-connection'

// Force dynamic rendering - this route requires authentication
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/transactions/with-blockchain-cached
 * Get ALL transactions WITH blockchain data using cache (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authenticateToken(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    // Check admin access
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const client = await pool.connect()
    
    try {
      // Get ALL transactions with cached blockchain data and user details
      const result = await client.query(
        `SELECT 
          t.id, 
          t."userId", 
          t.type, 
          t.amount, 
          t."txHash", 
          t.network, 
          t.description, 
          t.status, 
          t."createdAt",
          t."updatedAt",
          t."blockchainData",
          t."blockchainVerified",
          t."blockchainLastChecked",
          t."fromAddress",
          t."toAddress",
          t."blockNumber",
          t."onChainValue",
          t."blockchainStatus",
          t."blockTimestamp",
          t."explorerUrl",
          u.email as "userEmail",
          u."fullName" as "userName"
        FROM "Transaction" t
        LEFT JOIN "User" u ON t."userId" = u.id
        ORDER BY t."createdAt" DESC
        LIMIT 500`
      )
      
      const transactions = result.rows
      
      // Check which transactions need blockchain data update
      const transactionsToUpdate = transactions.filter((tx: any) => {
        if (!tx.txHash || tx.txHash === 'N/A' || 
            tx.txHash.startsWith('ADMIN_') || tx.txHash.startsWith('BOT-')) {
          return false
        }
        
        if (!tx.network || !['BEP20', 'TRC20'].includes(tx.network)) {
          return false
        }
        
        const needsUpdate = !tx.blockchainLastChecked || 
          !tx.blockchainVerified || 
          tx.blockchainStatus === 'pending' ||
          (Date.now() - new Date(tx.blockchainLastChecked).getTime() > 24 * 60 * 60 * 1000)
        
        return needsUpdate
      })
      
      // Fetch and update blockchain data (limit to 50 at once to avoid rate limits)
      const updateLimit = Math.min(transactionsToUpdate.length, 50)
      if (updateLimit > 0) {
        await Promise.all(
          transactionsToUpdate.slice(0, updateLimit).map(async (tx: any) => {
            try {
              const blockchainData = await fetchCompleteTransactionData(
                tx.txHash,
                tx.network as 'BEP20' | 'TRC20'
              )
              
              if (blockchainData) {
                await client.query(
                  `UPDATE "Transaction"
                   SET 
                     "blockchainData" = $1,
                     "blockchainVerified" = true,
                     "blockchainLastChecked" = CURRENT_TIMESTAMP,
                     "fromAddress" = $2,
                     "toAddress" = $3,
                     "blockNumber" = $4,
                     "onChainValue" = $5,
                     "blockchainStatus" = $6,
                     "blockTimestamp" = $7,
                     "explorerUrl" = $8,
                     "updatedAt" = CURRENT_TIMESTAMP
                   WHERE id = $9`,
                  [
                    JSON.stringify(blockchainData),
                    blockchainData.from,
                    blockchainData.to,
                    blockchainData.blockNumber,
                    blockchainData.value,
                    blockchainData.status,
                    blockchainData.timestamp,
                    blockchainData.explorerUrl,
                    tx.id
                  ]
                )
                
                Object.assign(tx, {
                  blockchainData: JSON.stringify(blockchainData),
                  blockchainVerified: true,
                  fromAddress: blockchainData.from,
                  toAddress: blockchainData.to,
                  blockNumber: blockchainData.blockNumber,
                  onChainValue: blockchainData.value,
                  blockchainStatus: blockchainData.status,
                  blockTimestamp: blockchainData.timestamp,
                  explorerUrl: blockchainData.explorerUrl
                })
              } else {
                await client.query(
                  `UPDATE "Transaction"
                   SET 
                     "blockchainLastChecked" = CURRENT_TIMESTAMP,
                     "updatedAt" = CURRENT_TIMESTAMP
                   WHERE id = $1`,
                  [tx.id]
                )
              }
            } catch (error) {
              console.error(`Error fetching blockchain data for ${tx.txHash}:`, error)
            }
          })
        )
      }
      
      // Format response
      const formattedTransactions = transactions.map((tx: any) => {
        let blockchain = null
        
        if (tx.blockchainData) {
          try {
            blockchain = typeof tx.blockchainData === 'string' 
              ? JSON.parse(tx.blockchainData) 
              : tx.blockchainData
          } catch (e) {
            if (tx.blockchainVerified) {
              blockchain = {
                hash: tx.txHash,
                from: tx.fromAddress,
                to: tx.toAddress,
                value: parseFloat(tx.onChainValue || 0),
                blockNumber: tx.blockNumber,
                timestamp: tx.blockTimestamp,
                status: tx.blockchainStatus,
                network: tx.network,
                explorerUrl: tx.explorerUrl
              }
            }
          }
        }
        
        return {
          id: tx.id,
          userId: tx.userId,
          userEmail: tx.userEmail,
          userName: tx.userName,
          type: tx.type,
          amount: tx.amount,
          txHash: tx.txHash,
          network: tx.network,
          description: tx.description,
          status: tx.status,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
          blockchain,
          blockchainVerified: tx.blockchainVerified,
          onChainValue: tx.onChainValue
        }
      })
      
      // Calculate stats
      const stats = {
        total: transactions.length,
        verified: transactions.filter((t: any) => t.blockchainVerified).length,
        pending: transactionsToUpdate.length,
        updated: updateLimit,
        totalVolume: transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        verifiedVolume: transactions
          .filter((t: any) => t.blockchainVerified)
          .reduce((sum, t) => sum + (parseFloat(t.onChainValue || t.amount) || 0), 0),
        byNetwork: {
          BEP20: transactions.filter(t => t.network === 'BEP20').length,
          TRC20: transactions.filter(t => t.network === 'TRC20').length
        },
        discrepancies: transactions.filter((t: any) => 
          t.blockchainVerified && 
          t.onChainValue && 
          Math.abs(parseFloat(t.amount) - parseFloat(t.onChainValue)) > 0.01
        ).length
      }
      
      return NextResponse.json({
        success: true,
        transactions: formattedTransactions,
        stats
      })
      
    } finally {
      client.release()
    }
    
  } catch (error: any) {
    console.error('Error fetching admin transactions with blockchain data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    )
  }
}
