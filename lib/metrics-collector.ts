interface QueryMetrics {
  totalQueries: number
  successfulQueries: number
  failedQueries: number
  slowQueries: number
  averageQueryTime: number
  queriesPerSecond: number
}

interface PoolMetrics {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingClients: number
  maxConnections: number
  connectionUtilization: number
}

export class MetricsCollector {
  private static instance: MetricsCollector
  private queryMetrics: QueryMetrics
  private poolMetricsHistory: PoolMetrics[]
  private readonly historySize: number
  private lastReset: number

  private constructor() {
    this.historySize = 100 // Keep last 100 pool metrics
    this.lastReset = Date.now()
    this.queryMetrics = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      slowQueries: 0,
      averageQueryTime: 0,
      queriesPerSecond: 0
    }
    this.poolMetricsHistory = []
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  recordQueryExecution(duration: number, success: boolean) {
    this.queryMetrics.totalQueries++
    if (success) {
      this.queryMetrics.successfulQueries++
    } else {
      this.queryMetrics.failedQueries++
    }

    // Update average query time
    const oldTotal = this.queryMetrics.averageQueryTime * (this.queryMetrics.totalQueries - 1)
    this.queryMetrics.averageQueryTime = 
      (oldTotal + duration) / this.queryMetrics.totalQueries

    // Update queries per second
    const now = Date.now()
    const seconds = (now - this.lastReset) / 1000
    this.queryMetrics.queriesPerSecond = this.queryMetrics.totalQueries / seconds

    // Reset metrics periodically
    if (seconds > 3600) { // Reset every hour
      this.resetQueryMetrics()
    }
  }

  recordSlowQuery(duration: number) {
    this.queryMetrics.slowQueries++
  }

  recordPoolMetrics(metrics: PoolMetrics) {
    this.poolMetricsHistory.push(metrics)
    if (this.poolMetricsHistory.length > this.historySize) {
      this.poolMetricsHistory.shift()
    }
  }

  getQueryMetrics(): QueryMetrics {
    return { ...this.queryMetrics }
  }

  getPoolMetricsHistory(): PoolMetrics[] {
    return [...this.poolMetricsHistory]
  }

  private resetQueryMetrics() {
    this.queryMetrics = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      slowQueries: 0,
      averageQueryTime: 0,
      queriesPerSecond: 0
    }
    this.lastReset = Date.now()
  }
}