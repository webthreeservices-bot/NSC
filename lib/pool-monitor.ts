import { Pool } from 'pg'
import DatabaseLogger from './db-logger'

export class PoolMonitor {
  private static instance: PoolMonitor
  private pool: Pool
  private checkInterval: NodeJS.Timeout | null = null
  private readonly monitoringInterval = 30000 // 30 seconds

  private constructor(pool: Pool) {
    this.pool = pool
    this.startMonitoring()
  }

  static getInstance(pool: Pool): PoolMonitor {
    if (!PoolMonitor.instance) {
      PoolMonitor.instance = new PoolMonitor(pool)
    }
    return PoolMonitor.instance
  }

  private async checkPoolHealth() {
    try {
      const totalCount = (this.pool as any).totalCount
      const idleCount = (this.pool as any).idleCount
      const waitingCount = (this.pool as any).waitingCount

      DatabaseLogger.logPoolStatus({
        totalCount,
        idleCount,
        waitingCount
      })

      // Alert if pool is near capacity
      if (totalCount > 0 && waitingCount / totalCount > 0.8) {
        // Log the pool status and a warning when waiting ratio is high
        DatabaseLogger.logPoolStatus({
          totalCount,
          idleCount,
          waitingCount
        })
        DatabaseLogger.logConnectionError(new Error('High waiting connection ratio'))
      }

      // Test a connection
      const client = await this.pool.connect()
      try {
        await client.query('SELECT 1')
      } finally {
        client.release()
      }
    } catch (error) {
      DatabaseLogger.logConnectionError(error as Error)
    }
  }

  startMonitoring() {
    if (!this.checkInterval) {
      this.checkInterval = setInterval(() => {
        this.checkPoolHealth()
      }, this.monitoringInterval)
    }
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  // Get current pool metrics
  async getMetrics() {
    return {
      totalConnections: (this.pool as any).totalCount,
      idleConnections: (this.pool as any).idleCount,
      waitingClients: (this.pool as any).waitingCount,
      maxConnections: (this.pool as any).options.max
    }
  }
}

export default PoolMonitor