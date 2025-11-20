import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { authenticateToken } from '@/middleware/auth'
import { calculateRoi } from '@/utils/calculations'


export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    // Get all active packages for user
    const packages = await query(
      `SELECT p.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', rp.id,
                    'monthNumber', rp."monthNumber",
                    'amount', rp.amount,
                    'scheduledDate', rp."scheduledDate",
                    'paidDate', rp."paidDate",
                    'status', rp.status
                  ) ORDER BY rp."monthNumber" ASC
                ) FILTER (WHERE rp.id IS NOT NULL),
                '[]'::json
              ) as "roiPayments"
       FROM "Package" p
       LEFT JOIN "RoiPayment" rp ON rp."purchaseId" = p.id
       WHERE p."userId" = $1 AND p.status IN ('ACTIVE', 'PENDING')
       GROUP BY p.id`,
      [user.userId]
    )

    // Build ROI schedule
    const schedule = packages.flatMap(pkg => {
      const roiAmount = calculateRoi(Number(pkg.amount), pkg.packageType)
      const scheduleItems = []

      for (let month = 1; month <= 12; month++) {
        const existingPayment = pkg.roiPayments.find(p => p.monthNumber === month)
        
        if (existingPayment) {
          scheduleItems.push({
            packageId: pkg.id,
            packageType: pkg.packageType,
            amount: Number(existingPayment.amount),
            monthNumber: month,
            scheduledDate: existingPayment.scheduledDate,
            paidDate: existingPayment.paidDate,
            status: existingPayment.status
          })
        } else if (month <= pkg.roiPaidCount + 1) {
          // Calculate next payment date
          const nextDate = new Date(pkg.investmentDate)
          nextDate.setDate(nextDate.getDate() + (month * 30))
          
          scheduleItems.push({
            packageId: pkg.id,
            packageType: pkg.packageType,
            amount: roiAmount,
            monthNumber: month,
            scheduledDate: nextDate,
            paidDate: null,
            status: month === pkg.roiPaidCount + 1 ? 'PENDING' : 'SCHEDULED'
          })
        }
      }

      return scheduleItems
    })

    // Sort by scheduled date
    schedule.sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    )

    return NextResponse.json({
      success: true,
      schedule
    })

  } catch (error) {
    console.error('Get ROI schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ROI schedule' },
      { status: 500 }
    )
  }
}

