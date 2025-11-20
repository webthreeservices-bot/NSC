import { queryWithTimeout } from '@/lib/db-connection'
import { neonQuery } from '@/lib/neon-serverless'
import { NextRequest } from 'next/server'

interface LoginAttemptResult {
  isBlocked: boolean
  blockReason?: string
  failedAttempts: number
  lastAttemptAt?: Date
  blockUntil?: Date
}

interface LoginStats {
  date: string
  totalAttempts: number
  successfulLogins: number
  failedLogins: number
  uniqueIPs: number
  uniqueEmails: number
  successRate: number
}

/**
 * Security service for login attempt tracking and brute-force protection
 */
export class LoginSecurityService {
  // Configuration
  private static readonly MAX_ATTEMPTS_EMAIL = 5
  private static readonly MAX_ATTEMPTS_IP = 10 // IP gets double limit
  private static readonly WINDOW_MINUTES = 15

  /**
   * Record a login attempt (success or failure)
   */
  static async recordAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    failureReason?: string
  ): Promise<string> {
    try {
      const result = await queryWithTimeout(
        'SELECT record_login_attempt($1, $2, $3, $4, $5) as attempt_id',
        [email.toLowerCase(), ipAddress, userAgent, success, failureReason],
        20000 // Increased to 20 seconds for cloud database
      )
      
      const attemptId = result.rows[0]?.attempt_id
      
      if (success) {
        console.log(`✅ Successful login recorded for ${email} from ${ipAddress}`)
      } else {
        console.log(`❌ Failed login recorded for ${email} from ${ipAddress}: ${failureReason}`)
      }
      
      return attemptId
    } catch (error) {
      console.error('❌ Error recording login attempt:', error)
      throw new Error(`Failed to record login attempt: ${error}`)
    }
  }

  /**
   * Check if email or IP should be blocked due to too many failed attempts
   */
  static async checkBlocking(
    email: string,
    ipAddress: string
  ): Promise<LoginAttemptResult> {
    try {
      console.log(`🔍 Checking login blocking for ${email} from ${ipAddress}`)
      
      // Use Neon serverless driver for better reliability
      const result = await neonQuery(
        'SELECT * FROM check_login_blocking($1, $2, $3, $4)',
        [
          email.toLowerCase(),
          ipAddress,
          this.MAX_ATTEMPTS_EMAIL,
          this.WINDOW_MINUTES
        ]
      )
      
      if (result.length === 0) {
        console.log(`✅ No blocking found for ${email}`)
        return {
          isBlocked: false,
          failedAttempts: 0
        }
      }
      
      const row = result[0]
      
      const blockingResult = {
        isBlocked: row.isBlocked,
        blockReason: row.blockReason,
        failedAttempts: parseInt(row.failedAttempts),
        lastAttemptAt: row.lastAttemptAt ? new Date(row.lastAttemptAt) : undefined,
        blockUntil: row.blockUntil ? new Date(row.blockUntil) : undefined
      }
      
      if (blockingResult.isBlocked) {
        console.log(`🚫 Login blocked for ${email}: ${blockingResult.blockReason}`)
      } else {
        console.log(`✅ Login allowed for ${email} (${blockingResult.failedAttempts} failed attempts)`)
      }
      
      return blockingResult
    } catch (error) {
      console.error(`❌ Error checking login blocking for ${email}:`, error.message)
      
      // On database error, allow login but log the issue
      console.warn(`⚠️ Allowing login due to database error for ${email}`)
      return {
        isBlocked: false,
        failedAttempts: 0
      }
    }
  }

  /**
   * Get login statistics for the last N days
   */
  static async getLoginStats(daysBack: number = 7): Promise<LoginStats[]> {
    try {
      const result = await queryWithTimeout(
        'SELECT * FROM get_login_stats($1)',
        [daysBack],
        20000 // Increased to 20 seconds for cloud database
      )
      
      return result.rows.map(row => ({
        date: row.date,
        totalAttempts: parseInt(row.totalAttempts),
        successfulLogins: parseInt(row.successfulLogins),
        failedLogins: parseInt(row.failedLogins),
        uniqueIPs: parseInt(row.uniqueIPs),
        uniqueEmails: parseInt(row.uniqueEmails),
        successRate: parseFloat(row.successRate)
      }))
    } catch (error) {
      console.error('❌ Error getting login stats:', error)
      throw new Error(`Failed to get login stats: ${error}`)
    }
  }

  /**
   * Clean up old login attempts (call this periodically)
   */
  static async cleanupOldAttempts(daysToKeep: number = 30): Promise<number> {
    try {
      const result = await queryWithTimeout(
        'SELECT cleanup_old_login_attempts($1) as deleted_count',
        [daysToKeep],
        20000 // Increased to 20 seconds for cloud database
      )
      
      const deletedCount = parseInt(result.rows[0]?.deleted_count || 0)
      console.log(`🧹 Cleaned up ${deletedCount} old login attempts`)
      
      return deletedCount
    } catch (error) {
      console.error('❌ Error cleaning up old login attempts:', error)
      throw new Error(`Failed to cleanup old attempts: ${error}`)
    }
  }

  /**
   * Extract IP address from request (handles proxies)
   */
  static getClientIP(request: NextRequest): string {
    // Check various headers for real IP (in order of preference)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
    
    if (cfConnectingIP) return cfConnectingIP
    if (realIP) return realIP
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, first one is the client
      return forwardedFor.split(',')[0].trim()
    }
    
    // Fallback to localhost
    return '127.0.0.1'
  }

  /**
   * Get user agent from request
   */
  static getUserAgent(request: NextRequest): string {
    return request.headers.get('user-agent') || 'Unknown'
  }

  /**
   * Check if an IP address appears to be suspicious
   * (This is a basic implementation - you could enhance with IP reputation services)
   */
  static isSuspiciousIP(ipAddress: string): boolean {
    // Basic checks for obviously suspicious IPs
    if (ipAddress === '127.0.0.1' || ipAddress === 'localhost') {
      return false // Local development
    }
    
    // Add more sophisticated checks here:
    // - Known malicious IP lists
    // - Tor exit nodes
    // - VPN detection
    // - Geolocation checks
    
    return false
  }

  /**
   * Generate security report for admin dashboard
   */
  static async generateSecurityReport(): Promise<{
    recentStats: LoginStats[]
    summary: {
      totalAttempts: number
      successRate: number
      uniqueIPs: number
      suspiciousActivity: boolean
    }
  }> {
    try {
      const stats = await this.getLoginStats(7) // Last 7 days
      
      const summary = stats.reduce(
        (acc, day) => ({
          totalAttempts: acc.totalAttempts + day.totalAttempts,
          successfulLogins: acc.successfulLogins + day.successfulLogins,
          uniqueIPs: Math.max(acc.uniqueIPs, day.uniqueIPs)
        }),
        { totalAttempts: 0, successfulLogins: 0, uniqueIPs: 0 }
      )
      
      const overallSuccessRate = summary.totalAttempts > 0 
        ? (summary.successfulLogins / summary.totalAttempts) * 100 
        : 100
      
      // Simple suspicious activity detection
      const suspiciousActivity = overallSuccessRate < 50 || // Low success rate
        stats.some(day => day.failedLogins > 100) // High failed attempts in a day
      
      return {
        recentStats: stats,
        summary: {
          totalAttempts: summary.totalAttempts,
          successRate: Math.round(overallSuccessRate * 100) / 100,
          uniqueIPs: summary.uniqueIPs,
          suspiciousActivity
        }
      }
    } catch (error) {
      console.error('❌ Error generating security report:', error)
      throw new Error(`Failed to generate security report: ${error}`)
    }
  }
}

export default LoginSecurityService