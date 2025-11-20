import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import LoginSecurityService from '@/services/loginSecurityService'

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { user } = authResult
    
    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const daysBack = parseInt(searchParams.get('days') || '7')
    
    // Generate comprehensive security report
    const securityReport = await LoginSecurityService.generateSecurityReport()
    
    // Get detailed stats
    const detailedStats = await LoginSecurityService.getLoginStats(daysBack)
    
    return NextResponse.json({
      success: true,
      data: {
        summary: securityReport.summary,
        dailyStats: detailedStats,
        period: {
          days: daysBack,
          from: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        },
        recommendations: generateSecurityRecommendations(securityReport.summary)
      }
    })

  } catch (error) {
    console.error('❌ Error fetching login security stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security statistics' },
      { status: 500 }
    )
  }
}

/**
 * Generate security recommendations based on stats
 */
function generateSecurityRecommendations(summary: any): string[] {
  const recommendations: string[] = []
  
  if (summary.successRate < 70) {
    recommendations.push('Low login success rate detected. Consider reviewing failed login patterns.')
  }
  
  if (summary.totalAttempts > 1000) {
    recommendations.push('High login activity detected. Monitor for potential brute-force attacks.')
  }
  
  if (summary.suspiciousActivity) {
    recommendations.push('Suspicious login activity detected. Review recent failed attempts and consider additional security measures.')
  }
  
  if (summary.uniqueIPs > 100) {
    recommendations.push('High number of unique IP addresses. Consider implementing geo-location restrictions if appropriate.')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Login security appears normal. Continue monitoring regularly.')
  }
  
  return recommendations
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateToken(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { user } = authResult
    
    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, daysToKeep } = body
    
    if (action === 'cleanup') {
      // Clean up old login attempts
      const deletedCount = await LoginSecurityService.cleanupOldAttempts(daysToKeep || 30)
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${deletedCount} old login attempts`,
        deletedCount
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action specified' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Error executing login security action:', error)
    return NextResponse.json(
      { error: 'Failed to execute security action' },
      { status: 500 }
    )
  }
}