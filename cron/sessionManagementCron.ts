import { SessionManagementService } from '../services/sessionManagementService';

/**
 * Session Management Cron Job
 * 
 * This cron job handles:
 * 1. Cleanup of expired sessions
 * 2. Performance monitoring of session operations
 * 3. Security alerts for suspicious session activity
 */

interface SessionCleanupResult {
  cleanedSessions: number;
  activeSessionsAfterCleanup: number;
  uniqueUsersAfterCleanup: number;
  timestamp: Date;
}

export class SessionManagementCron {
  private static isRunning = false;
  private static lastCleanup: Date | null = null;
  private static cleanupHistory: SessionCleanupResult[] = [];

  /**
   * Main session cleanup task
   */
  static async performSessionCleanup(): Promise<SessionCleanupResult> {
    if (this.isRunning) {
      console.log('⚠️ Session cleanup already running, skipping...');
      throw new Error('Session cleanup already in progress');
    }

    try {
      this.isRunning = true;
      console.log('🧹 Starting session cleanup...');

      // Clean up expired sessions
      const cleanedCount = await SessionManagementService.cleanupExpiredSessions();
      
      // Get updated stats
      const stats = await SessionManagementService.getSessionStats();
      
      const result: SessionCleanupResult = {
        cleanedSessions: cleanedCount,
        activeSessionsAfterCleanup: stats.activeSessions,
        uniqueUsersAfterCleanup: stats.uniqueUsers,
        timestamp: new Date()
      };

      // Store in history (keep last 100 entries)
      this.cleanupHistory.push(result);
      if (this.cleanupHistory.length > 100) {
        this.cleanupHistory = this.cleanupHistory.slice(-100);
      }

      this.lastCleanup = new Date();

      console.log(`✅ Session cleanup completed:
        🗑️ Cleaned: ${cleanedCount} expired sessions
        💾 Active: ${stats.activeSessions} sessions
        👥 Users: ${stats.uniqueUsers} unique users
        ⏰ Time: ${new Date().toISOString()}`);

      return result;
    } catch (error) {
      console.error('❌ Session cleanup failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Enhanced session monitoring and alerts
   */
  static async performSessionMonitoring(): Promise<void> {
    try {
      console.log('📊 Performing session monitoring...');

      const stats = await SessionManagementService.getSessionStats();
      
      // Alert thresholds
      const HIGH_SESSION_COUNT = 1000;
      const HIGH_USER_COUNT = 500;
      const RAPID_GROWTH_THRESHOLD = 2.0; // 2x growth in 24h

      // Check for high session counts
      if (stats.activeSessions > HIGH_SESSION_COUNT) {
        console.warn(`⚠️ HIGH SESSION COUNT ALERT: ${stats.activeSessions} active sessions`);
      }

      if (stats.uniqueUsers > HIGH_USER_COUNT) {
        console.warn(`⚠️ HIGH USER COUNT ALERT: ${stats.uniqueUsers} unique users`);
      }

      // Check for rapid session growth
      if (this.cleanupHistory.length >= 2) {
        const currentStats = this.cleanupHistory[this.cleanupHistory.length - 1];
        const previousStats = this.cleanupHistory[this.cleanupHistory.length - 2];
        
        if (currentStats.activeSessionsAfterCleanup > previousStats.activeSessionsAfterCleanup * RAPID_GROWTH_THRESHOLD) {
          console.warn(`⚠️ RAPID SESSION GROWTH ALERT: Sessions grew from ${previousStats.activeSessionsAfterCleanup} to ${currentStats.activeSessionsAfterCleanup}`);
        }
      }

      console.log(`📈 Session monitoring complete:
        📊 Current Stats: ${stats.activeSessions} active, ${stats.uniqueUsers} users
        📈 24h Sessions: ${stats.sessionsLast24h}
        🕐 Last Cleanup: ${this.lastCleanup?.toISOString() || 'Never'}`);

    } catch (error) {
      console.error('❌ Session monitoring failed:', error);
    }
  }

  /**
   * Get session cleanup statistics
   */
  static getCleanupStats(): {
    lastCleanup: Date | null;
    totalCleanups: number;
    totalSessionsCleaned: number;
    averageSessionsCleaned: number;
    isCurrentlyRunning: boolean;
  } {
    const totalSessionsCleaned = this.cleanupHistory.reduce(
      (sum, result) => sum + result.cleanedSessions, 
      0
    );

    const averageSessionsCleaned = this.cleanupHistory.length > 0 
      ? totalSessionsCleaned / this.cleanupHistory.length 
      : 0;

    return {
      lastCleanup: this.lastCleanup,
      totalCleanups: this.cleanupHistory.length,
      totalSessionsCleaned,
      averageSessionsCleaned: Math.round(averageSessionsCleaned * 100) / 100,
      isCurrentlyRunning: this.isRunning
    };
  }

  /**
   * Get recent cleanup history
   */
  static getRecentCleanupHistory(limit: number = 10): SessionCleanupResult[] {
    return this.cleanupHistory.slice(-limit);
  }

  /**
   * Manual trigger for immediate cleanup (for admin use)
   */
  static async forceCleanup(): Promise<SessionCleanupResult> {
    console.log('🔧 Manual session cleanup triggered...');
    return await this.performSessionCleanup();
  }

  /**
   * Health check for session management system
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    details: string;
    stats: any;
  }> {
    try {
      // Test basic session operations
      const stats = await SessionManagementService.getSessionStats();
      
      // Check if cleanup is overdue (more than 25 hours)
      const isCleanupOverdue = this.lastCleanup 
        ? (Date.now() - this.lastCleanup.getTime()) > (25 * 60 * 60 * 1000)
        : true;

      if (isCleanupOverdue) {
        return {
          status: 'warning',
          details: 'Session cleanup is overdue. Last cleanup: ' + (this.lastCleanup?.toISOString() || 'Never'),
          stats
        };
      }

      return {
        status: 'healthy',
        details: 'Session management system is operating normally',
        stats: {
          ...stats,
          lastCleanup: this.lastCleanup,
          cleanupStats: this.getCleanupStats()
        }
      };

    } catch (error) {
      return {
        status: 'error',
        details: `Session management system error: ${error.message}`,
        stats: null
      };
    }
  }
}

export default SessionManagementCron;