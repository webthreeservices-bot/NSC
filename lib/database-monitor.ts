import { MetricsCollector } from '../lib/metrics-collector'
import { dbLogger } from '../config/logging'
import { Pool } from 'pg'

interface PoolMetrics {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingClients: number
  maxConnections: number
  connectionUtilization: number
}

interface QueryMetrics {
  totalQueries: number
  successfulQueries: number
  failedQueries: number
  slowQueries: number
  averageQueryTime: number
  queriesPerSecond: number
}

export class DatabaseMonitor {
  private static instance: DatabaseMonitor
  private pool: Pool
  private metrics: MetricsCollector
  private readonly slowQueryThreshold: number
  private readonly checkInterval: number

  private constructor(pool: Pool) {
    this.pool = pool
    this.metrics = MetricsCollector.getInstance()
    this.slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000')
    this.checkInterval = parseInt(process.env.POOL_CHECK_INTERVAL || '30000')
    this.startMonitoring()
  }

  static getInstance(pool: Pool): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor(pool)
    }
    return DatabaseMonitor.instance
  }

  private async collectPoolMetrics(): Promise<PoolMetrics> {
    const poolState = this.pool as any
    const metrics = {
      totalConnections: poolState.totalCount || 0,
      activeConnections: poolState.totalCount - poolState.idleCount || 0,
      idleConnections: poolState.idleCount || 0,
      waitingClients: poolState.waitingCount || 0,
      maxConnections: poolState.options.max || 10,
      connectionUtilization: 0
    }

    metrics.connectionUtilization = 
      (metrics.activeConnections / metrics.maxConnections) * 100

    return metrics
  }

  private async checkPoolHealth() {
    try {
      const metrics = await this.collectPoolMetrics()
      
      // Log current pool state
      dbLogger.debug('Pool metrics', metrics)

      // Alert on high utilization
      if (metrics.connectionUtilization > 80) {
        dbLogger.warn('High connection pool utilization', {
          utilization: metrics.connectionUtilization,
          activeConnections: metrics.activeConnections,
          maxConnections: metrics.maxConnections
        })
      }

      // Alert on waiting clients
      if (metrics.waitingClients > 0) {
        dbLogger.warn('Clients waiting for connections', {
          waitingClients: metrics.waitingClients
        })
      }

      // Store metrics for trending
      this.metrics.recordPoolMetrics(metrics)

      // Test a connection if utilization is low
      if (metrics.connectionUtilization < 50) {
        const client = await this.pool.connect()
        try {
          await client.query('SELECT 1')
        } finally {
          client.release()
        }
      }
    } catch (error) {
      dbLogger.error('Error collecting pool metrics', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  private startMonitoring() {
    // Regular pool health checks
    setInterval(() => {
      this.checkPoolHealth()
    }, this.checkInterval)

    // Listen for pool events
    this.pool.on('error', (err) => {
      dbLogger.error('Pool error', { error: err.message })
    })

    this.pool.on('connect', () => {
      dbLogger.debug('New client connected to pool')
    })

    this.pool.on('remove', () => {
      dbLogger.debug('Client removed from pool')
    })
  }

  async getMetrics(): Promise<{pool: PoolMetrics, queries: QueryMetrics}> {
    const poolMetrics = await this.collectPoolMetrics()
    const queryMetrics = this.metrics.getQueryMetrics()
    
    return {
      pool: poolMetrics,
      queries: queryMetrics
    }
  }

  logSlowQuery(query: string, params: any[], duration: number) {
    if (duration > this.slowQueryThreshold) {
      dbLogger.warn('Slow query detected', {
        query,
        params,
        duration,
        threshold: this.slowQueryThreshold
      })
      this.metrics.recordSlowQuery(duration)
    }
  }

  logQueryExecution(duration: number, success: boolean) {
    this.metrics.recordQueryExecution(duration, success)
  }
}