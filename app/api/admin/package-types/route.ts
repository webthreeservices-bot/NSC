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
    console.log('Starting package types fetch...')
    
    // Set a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Package types timeout')), 8000) // 8 second timeout
    })

    // Get package types with error handling
    const packageTypesPromise = async () => {
      try {
        const packagesByType = await query<{
          packageType: string
          count: number
          totalAmount: string
        }>(`
          SELECT
            "packageType",
            COUNT(*)::int as count,
            COALESCE(SUM(amount), 0) as "totalAmount"
          FROM "UserPackage"
          GROUP BY "packageType"
        `)

        return packagesByType.map(p => ({
          type: p.packageType,
          count: p.count,
          totalAmount: Number(p.totalAmount || 0)
        }))
      } catch (error) {
        console.error('Error in package types promise:', error)
        return []
      }
    }

    // Race against timeout
    const packageTypes = await Promise.race([
      packageTypesPromise(),
      timeoutPromise
    ]) as any

    console.log('Package types fetched successfully')

    return NextResponse.json({
      success: true,
      packagesByType: packageTypes
    })

  } catch (error) {
    console.error('Get package types error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch package types',
        details: error instanceof Error ? error.message : 'Unknown error',
        packagesByType: []
      },
      { status: 200 } // Return 200 with fallback data
    )
  }
}
