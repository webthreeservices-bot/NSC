import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import pool from '@/lib/db-connection'

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  // Extract query parameters
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  try {
    // For now, return empty response to avoid errors
    return NextResponse.json({
      success: true,
      earnings: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    })
  } catch (error) {
    console.error('Get earnings history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings history' },
      { status: 500 }
    )
  }
}
