import { createLogger, format, transports } from 'winston'
import { maskSensitiveData } from './security'

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      // Mask sensitive data in logs
      const maskedMeta = maskSensitiveData(meta)
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...maskedMeta
      })
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/db.log' })
  ]
})

export interface QueryLogData {
  query: string
  params?: any[]
  duration: number
  result?: any
  error?: Error
}

class DatabaseLogger {
  private static SLOW_QUERY_THRESHOLD = 1000 // 1 second

  static logQuery(data: QueryLogData) {
    const { query, params, duration, result, error } = data

    // Mask sensitive data in parameters
    const maskedParams = maskSensitiveData(params)

    if (error) {
      logger.error('Database query failed', {
        query,
        params: maskedParams,
        duration,
        error: error.message,
        stack: error.stack
      })
      return
    }

    // Log slow queries as warnings
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      logger.warn('Slow query detected', {
        query,
        params: maskedParams,
        duration,
        resultCount: Array.isArray(result) ? result.length : 1
      })
      return
    }

    // Log successful queries as debug
    logger.debug('Query executed', {
      query,
      params: maskedParams,
      duration,
      resultCount: Array.isArray(result) ? result.length : 1
    })
  }

  static logPoolStatus(poolStatus: {
    totalCount: number
    idleCount: number
    waitingCount: number
  }) {
    logger.info('Connection pool status', poolStatus)
  }

  static logConnectionError(error: Error) {
    logger.error('Database connection error', {
      message: error.message,
      stack: error.stack
    })
  }
}

export default DatabaseLogger