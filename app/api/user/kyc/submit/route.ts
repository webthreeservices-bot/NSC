import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import pool from '@/lib/db-connection'

// Force dynamic rendering - this route cannot be static
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

// POST endpoint - Submit KYC documents
export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const documentType = formData.get('documentType') as string
    const documentNumber = formData.get('documentNumber') as string
    const frontFile = formData.get('frontFile') as File | null
    const backFile = formData.get('backFile') as File | null
    const selfieFile = formData.get('selfieFile') as File | null

    // Validate required fields
    if (!documentType || !documentNumber) {
      return NextResponse.json(
        { error: 'Document type and number are required' },
        { status: 400 }
      )
    }

    if (!frontFile || !backFile || !selfieFile) {
      return NextResponse.json(
        { error: 'All document images are required (front, back, selfie)' },
        { status: 400 }
      )
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const files = [frontFile, backFile, selfieFile]
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPG and PNG images are allowed.' },
          { status: 400 }
        )
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must not exceed 5MB' },
          { status: 400 }
        )
      }
    }

    // In a production environment, you would:
    // 1. Upload files to cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Store file URLs in the database
    // 3. Implement virus scanning
    
    // For now, we'll create a KYC submission record
    try {
      // Ensure KYCSubmission table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "KYCSubmission" (
          "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
          "userId" TEXT NOT NULL,
          "documentType" TEXT NOT NULL,
          "documentNumber" TEXT NOT NULL,
          "frontFileUrl" TEXT,
          "backFileUrl" TEXT,
          "selfieFileUrl" TEXT,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "rejectionReason" TEXT,
          "submittedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "reviewedAt" TIMESTAMP,
          "reviewedBy" TEXT
        )
      `)

      // Generate file URLs (placeholder - in production, upload to cloud storage)
      const submissionId = `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const frontFileUrl = `/uploads/kyc/${userId}/front_${Date.now()}.jpg`
      const backFileUrl = `/uploads/kyc/${userId}/back_${Date.now()}.jpg`
      const selfieFileUrl = `/uploads/kyc/${userId}/selfie_${Date.now()}.jpg`

      // Insert KYC submission
      await pool.query(
        `INSERT INTO "KYCSubmission" 
         ("id", "userId", "documentType", "documentNumber", "frontFileUrl", "backFileUrl", "selfieFileUrl", "status", "submittedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', NOW())`,
        [submissionId, userId, documentType, documentNumber, frontFileUrl, backFileUrl, selfieFileUrl]
      )

      // Update user's KYC status to PENDING (if not already approved)
      await execute(
        `UPDATE "User"
         SET "kycStatus" = $1, "kycDocument" = $2, "updatedAt" = $3
         WHERE id = $4`,
        ['PENDING', JSON.stringify({
          documentType,
          documentNumber,
          submissionId,
          submittedAt: new Date().toISOString()
        }), new Date(), userId]
      )

      // Log user activity
      try {
        await pool.query(
          `INSERT INTO "UserActivityLog" 
           ("id", "userId", "action", "details", "ipAddress", "createdAt")
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            `activity_${Date.now()}`,
            userId,
            'KYC_SUBMITTED',
            JSON.stringify({ submissionId, documentType }),
            request.headers.get('x-forwarded-for') || 'unknown'
          ]
        )
      } catch (logError) {
        console.error('Failed to log activity:', logError)
      }

      return NextResponse.json({
        success: true,
        message: 'KYC documents submitted successfully. We will review your submission within 24-48 hours.',
        submissionId,
        status: 'PENDING'
      })

    } catch (dbError: any) {
      console.error('Database error submitting KYC:', dbError)
      
      if (dbError.message?.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to submit KYC documents. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('KYC submission error:', error)
    
    let errorMessage = 'Failed to submit KYC documents'
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

