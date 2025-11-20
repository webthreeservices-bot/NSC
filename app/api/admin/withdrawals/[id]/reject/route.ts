import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { authenticateToken, requireAdmin } from '@/middleware/auth'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'


const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required')
})

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
    
    const validation = rejectSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { reason } = validation.data

    // Get withdrawal with user info
    const withdrawal = await queryOne(
      `SELECT
        w.*,
        u.email as "user_email",
        u."fullName" as "user_fullName"
       FROM "Withdrawal" w
       LEFT JOIN "User" u ON w."userId" = u.id
       WHERE w.id = $1`,
      [withdrawalId]
    )

    if (withdrawal) {
      withdrawal.user = {
        email: withdrawal.user_email,
        fullName: withdrawal.user_fullName
      }
      delete withdrawal.user_email
      delete withdrawal.user_fullName
    }

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Withdrawal already processed' },
        { status: 400 }
      )
    }

    // Reject withdrawal
    await execute(
      `UPDATE "Withdrawal"
       SET status = $1, "processedBy" = $2, "processedDate" = $3, "rejectionReason" = $4, "updatedAt" = $5
       WHERE id = $6`,
      ['REJECTED', user.userId, new Date(), reason, new Date(), withdrawalId]
    )

    // Log admin action
    await execute(
      `INSERT INTO "AdminLog" (id, "adminId", action, description, metadata, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)`,
      [user.userId, 'REJECT_WITHDRAWAL', `Rejected withdrawal ${withdrawalId} - Reason: ${reason}`, JSON.stringify({ withdrawalId, reason }), new Date()]
    )

    // Send rejection email to user
    try {
      await sendEmail({
        to: withdrawal.user.email,
        subject: 'Withdrawal Request Rejected - NSC Bot',
        text: `Dear ${withdrawal.user.fullName},\n\nYour withdrawal request of $${withdrawal.amount} has been rejected.\n\nReason: ${reason}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nNSC Bot Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00ff00 0%, #00cc00 100%); padding: 30px; text-align: center;">
              <h1 style="color: #000; margin: 0; font-size: 28px;">NSC Bot Platform</h1>
            </div>
            
            <div style="padding: 40px 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">Withdrawal Request Rejected</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Dear ${withdrawal.user.fullName},
              </p>
              
              <div style="background: #fff; border-left: 4px solid #ff0000; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #333; font-size: 16px;">
                  Your withdrawal request of <strong style="color: #00ff00;">$${withdrawal.amount} USDT</strong> has been rejected.
                </p>
              </div>
              
              <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #333; margin-top: 0;">Rejection Reason:</h3>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">${reason}</p>
              </div>
              
              <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #333; margin-top: 0;">Withdrawal Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Amount:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold;">$${withdrawal.amount} USDT</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Network:</td>
                    <td style="padding: 8px 0; color: #333;">${withdrawal.network}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Wallet Address:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 12px; word-break: break-all;">${withdrawal.walletAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Request Date:</td>
                    <td style="padding: 8px 0; color: #333;">${new Date(withdrawal.createdAt).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                If you have any questions or believe this rejection was made in error, please contact our support team.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/withdrawals" 
                   style="background: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  View Withdrawals
                </a>
              </div>
            </div>
            
            <div style="background: #333; color: #fff; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">
                © 2025 NSC Bot Platform. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #999;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal rejected successfully'
    })

  } catch (error) {
    console.error('Reject withdrawal error:', error)
    return NextResponse.json(
      { error: 'Failed to reject withdrawal' },
      { status: 500 }
    )
  }
}
