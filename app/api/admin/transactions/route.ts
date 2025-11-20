import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"

/**
 * GET /api/admin/transactions
 * Get all transactions across all users (admin only)
 */
export async function GET(request: NextRequest) {
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult

  const { user } = authResult

  // Check if user is admin (token has isAdmin boolean field)
  if (!user.isAdmin) {
    return NextResponse.json(
      { error: 'Access denied. Admin privileges required.' },
      { status: 403 }
    )
  }

  try {
    // Use SQL for better connection management
    const transactions = await query<{
      id: string
      userId: string
      type: string
      amount: string
      status: string
      description: string | null
      txHash: string | null
      network: string | null
      createdAt: Date
      updatedAt: Date
      userEmail: string | null
      userFullName: string | null
    }>(`
      SELECT
        t.id,
        t."userId",
        t.type,
        t.amount,
        t.status,
        t.description,
        t."txHash",
        t.network,
        t."createdAt",
        t."updatedAt",
        u.email as "userEmail",
        u."fullName" as "userFullName"
      FROM "Transaction" t
      LEFT JOIN "User" u ON t."userId" = u.id
      ORDER BY t."createdAt" DESC
      LIMIT 1000
    `)

    // Helper to convert dates safely
    const toSafeDate = (date: any) => {
      if (!date) return null;
      if (typeof date === 'string') return date;
      if (date instanceof Date) return date.toISOString();
      return date;
    };

    return NextResponse.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx.id,
        userId: tx.userId,
        userEmail: tx.userEmail || 'N/A',
        userName: tx.userFullName || 'N/A',
        type: tx.type,
        amount: Number(tx.amount || 0),
        status: tx.status,
        description: tx.description || '',
        txHash: tx.txHash,
        network: tx.network,
        createdAt: toSafeDate(tx.createdAt),
        updatedAt: toSafeDate(tx.updatedAt)
      }))
    })
  } catch (error: any) {
    console.error('Error fetching admin transactions:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        details: error.message
      },
      { status: 500 }
    )
  }
}

