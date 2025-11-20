import cron from 'node-cron'
import { db } from '../lib/enhanced-db'
import { dbLogger } from '../config/logging'

// Run health check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    // Get current metrics
    const metrics = await db.monitor.getMetrics()

    // Log current state
    dbLogger.info('Database health check', metrics)

    // Check connection pool health
    if (metrics.waitingClients > 0) {
      dbLogger.warn('Clients waiting for database connections', {
        waitingCount: metrics.waitingClients,
        totalConnections: metrics.totalConnections,
        maxConnections: metrics.maxConnections
      })
    }

    // Check error rate
    const totalConnections = metrics.totalConnections || 0
    const idleConnections = metrics.idleConnections || 0
    const utilization = totalConnections > 0 ? (totalConnections - idleConnections) / totalConnections : 0

    if (utilization > 0.9) { // More than 90% connection utilization
      dbLogger.warn('High connection pool utilization', {
        utilization: `${(utilization * 100).toFixed(2)}%`,
        activeConnections: totalConnections - idleConnections,
        totalConnections
      })
    }

    // Test a simple query
    await db.query('SELECT 1')
  } catch (error) {
    dbLogger.error('Database health check failed', {
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// Run vacuum analyze daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  try {
    dbLogger.info('Starting daily database maintenance')

    // Get list of tables
    const { rows } = await db.query<{ tablename: string }>(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `)

    // Run vacuum analyze on each table
    for (const { tablename } of rows) {
      try {
        await db.query(`VACUUM ANALYZE "${tablename}"`)
        dbLogger.info('Vacuum analyze completed', { table: tablename })
      } catch (error) {
        dbLogger.error('Vacuum analyze failed', {
          table: tablename,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    dbLogger.info('Daily database maintenance completed')
  } catch (error) {
    dbLogger.error('Daily database maintenance failed', {
      error: error instanceof Error ? error.message : String(error)
    })
  }
})