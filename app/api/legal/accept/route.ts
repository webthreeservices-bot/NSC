/**
 * API Route: Accept Legal Documents
 * POST /api/legal/accept - Record user acceptance of legal documents
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { v4 as uuidv4 } from 'uuid'

// Force dynamic rendering - this route cannot be static
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface AcceptLegalRequest {
  documentType: 'TERMS' | 'PRIVACY' | 'COOKIE_POLICY'
  version: string
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { user } = authResult

    const body: AcceptLegalRequest = await request.json()
    const { documentType, version } = body

    // Validate input
    if (!documentType || !version) {
      return NextResponse.json(
        { error: 'Missing required fields: documentType, version' },
        { status: 400 }
      )
    }

    // Validate document type
    if (!['TERMS', 'PRIVACY', 'COOKIE_POLICY'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type. Must be TERMS, PRIVACY, or COOKIE_POLICY' },
        { status: 400 }
      )
    }

    // Get IP address and user agent for compliance tracking
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Store legal acceptance in database
    // Check if acceptance already exists
    const existing = await queryOne(
      `SELECT id FROM "LegalAcceptance" WHERE "userId" = $1 AND "documentType" = $2 AND version = $3`,
      [user.userId, documentType, version]
    )

    let acceptance
    if (existing) {
      // Update existing acceptance
      acceptance = await queryOne(
        `UPDATE "LegalAcceptance"
         SET "ipAddress" = $1, "userAgent" = $2, "acceptedAt" = $3, "updatedAt" = $4
         WHERE id = $5
         RETURNING *`,
        [ipAddress, userAgent, new Date(), new Date(), existing.id]
      )
    } else {
      // Create new acceptance
      const id = uuidv4()
      acceptance = await queryOne(
        `INSERT INTO "LegalAcceptance" (id, "userId", "documentType", version, "ipAddress", "userAgent", "acceptedAt", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [id, user.userId, documentType, version, ipAddress, userAgent, new Date(), new Date(), new Date()]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Legal document acceptance recorded',
      data: {
        id: acceptance.id,
        userId: acceptance.userId,
        documentType: acceptance.documentType,
        version: acceptance.version,
        acceptedAt: acceptance.acceptedAt,
      },
    })
  } catch (error) {
    console.error('Error recording legal acceptance:', error)
    return NextResponse.json(
      {
        error: 'Failed to record acceptance',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

