import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult
  if (!user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  // Get pending earnings that are paid in DB but have no txHash
  const rows = await query(`
    SELECT e.id, e."userId", e."packageId", e.amount, e.level, e."earningType", t.id as "transactionId", t."txHash", u.email, u."walletAddress", p.network
    FROM "Earning" e
    JOIN "Transaction" t ON e."transactionId" = t.id
    JOIN "User" u ON e."userId" = u.id
    JOIN "Package" p ON e."packageId" = p.id
    WHERE e.status IN ('PAID', 'PENDING')
      AND (t."txHash" IS NULL OR t."txHash" = '')
    ORDER BY e."createdAt" DESC
    LIMIT 500
  `)

  return NextResponse.json({ data: rows.rows })
}

export default { GET }
