import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken, requireAdmin } from '@/middleware/auth'


export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Check admin
  const adminCheck = requireAdmin(user)
  if (adminCheck instanceof NextResponse) return adminCheck

  try {
    // Get pending withdrawals
    const withdrawals = await query<{
      id: string
      userId: string
      amount: string
      fee: string
      netAmount: string
      type: string
      walletAddress: string
      network: string
      status: string
      requestDate: Date
      userEmail: string
      username: string
      userFullName: string
    }>(`
      SELECT
        w.id,
        w."userId",
        w.amount,
        w.fee,
        w."netAmount",
        w.type,
        w."walletAddress",
        w.network,
        w.status,
        w."requestDate",
        u.id as "userId",
        u.email as "userEmail",
        u.username,
        u."fullName" as "userFullName"
      FROM "Withdrawal" w
      LEFT JOIN "User" u ON w."userId" = u.id
      WHERE w.status = 'PENDING'
      ORDER BY w."createdAt" ASC
    `)

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        user: {
          id: w.userId,
          email: w.userEmail,
          username: w.username,
          fullName: w.userFullName
        },
        amount: Number(w.amount),
        fee: Number(w.fee),
        netAmount: Number(w.netAmount),
        withdrawalType: w.type,
        walletAddress: w.walletAddress,
        network: w.network,
        status: w.status,
        requestDate: w.requestDate
      }))
    })

  } catch (error) {
    console.error('Get pending withdrawals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending withdrawals' },
      { status: 500 }
    )
  }
}


