import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/utils/server-helpers'
import { generateCSRFToken } from '@/lib/csrf'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded?.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const csrfToken = generateCSRFToken(decoded.userId)

    return NextResponse.json({
      success: true,
      csrfToken
    })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
