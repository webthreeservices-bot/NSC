/**
 * API Route: Legal Documents
 * GET /api/legal - Get legal document metadata
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const legalDocuments = {
      termsOfService: {
        title: 'Terms of Service',
        url: '/terms',
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      },
      privacyPolicy: {
        title: 'Privacy Policy',
        url: '/privacy',
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      },
      cookiePolicy: {
        title: 'Cookie Policy',
        url: '/privacy#cookies',
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      },
    }

    return NextResponse.json({
      success: true,
      data: legalDocuments,
    })
  } catch (error) {
    console.error('Error fetching legal documents:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch legal documents',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
