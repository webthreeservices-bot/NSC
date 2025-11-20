import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import pool from '@/lib/db-connection'
import { z } from 'zod'

// Force dynamic rendering - this route cannot be static
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Validation schema
const supportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.enum([
    'general',
    'technical',
    'payment',
    'withdrawal',
    'account',
    'referral'
  ]),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// Get user from token
async function getUserFromToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const jwt = require('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET
    
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not configured')
      return null
    }
    
    const payload = jwt.verify(token, JWT_SECRET)
    return payload.userId
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  let body: any = null

  try {
    // Parse body
    body = await request.json()
  } catch (parseError) {
    console.error('Body parsing error:', parseError)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  try {
    // Get user from token
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Validate request
    const validation = supportTicketSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      )
    }

    const { subject, category, message } = validation.data

    // Get user details
    let user: any = null
    try {
      user = await queryOne(
        `SELECT id, email, "fullName", username FROM "User" WHERE id = $1`,
        [userId]
      )

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
    } catch (dbError) {
      console.error('Database error fetching user:', dbError)
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    // Create support ticket in database
    // First, ensure SupportTicket table exists
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "SupportTicket" (
          "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
          "userId" TEXT NOT NULL,
          "subject" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'OPEN',
          "priority" TEXT NOT NULL DEFAULT 'NORMAL',
          "assignedTo" TEXT,
          "response" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "resolvedAt" TIMESTAMP
        )
      `)

      // Insert the ticket
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const result = await pool.query(
        `INSERT INTO "SupportTicket" 
         ("id", "userId", "subject", "category", "message", "status", "priority", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, 'OPEN', 'NORMAL', NOW(), NOW())
         RETURNING *`,
        [ticketId, userId, subject, category, message]
      )

      const ticket = result.rows[0]

      // Log user activity
      try {
        await pool.query(
          `INSERT INTO "UserActivityLog" 
           ("id", "userId", "action", "details", "ipAddress", "createdAt")
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            `activity_${Date.now()}`,
            userId,
            'SUPPORT_TICKET_CREATED',
            JSON.stringify({ ticketId, category, subject }),
            request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
          ]
        )
      } catch (logError) {
        console.error('Failed to log activity:', logError)
        // Don't fail the request if logging fails
      }

      // Send notification email (optional - implement if email service is set up)
      // await sendSupportTicketEmail(user.email, ticket)

      return NextResponse.json({
        success: true,
        message: 'Support ticket submitted successfully',
        ticket: {
          id: ticket.id,
          subject: ticket.subject,
          category: ticket.category,
          status: ticket.status,
          createdAt: ticket.createdAt
        }
      })

    } catch (dbError: any) {
      console.error('Database error creating ticket:', dbError)
      
      // Handle specific errors
      if (dbError.message?.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create support ticket. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Support ticket creation error:', error)
    
    let errorMessage = 'Failed to create support ticket'
    if (error.message?.includes('timeout')) {
      errorMessage = 'Request timeout. Please check your connection and try again.'
    } else if (error.message?.includes('connect')) {
      errorMessage = 'Service temporarily unavailable. Please try again later.'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch user's tickets
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Fetch user's tickets
    const result = await pool.query(
      `SELECT * FROM "SupportTicket" 
       WHERE "userId" = $1 
       ORDER BY "createdAt" DESC 
       LIMIT 50`,
      [userId]
    )

    return NextResponse.json({
      success: true,
      tickets: result.rows
    })

  } catch (error: any) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}

