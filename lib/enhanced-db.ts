import { Pool, QueryResult } from 'pg'
import { WhereClause, SelectClause, OrderByClause, QueryOptions } from '../types/database'
import DatabaseLogger from './db-logger'
import DatabaseCache from './db-cache'
import PoolMonitor from './pool-monitor'

export interface DatabaseClient {
  pool: Pool
  cache: typeof DatabaseCache
  logger: typeof DatabaseLogger
  monitor: PoolMonitor
  
  // Generic query methods
  query<T>(sql: string, params?: any[]): Promise<QueryResult<T>>
  queryWithCache<T>(sql: string, params: any[], ttl?: number): Promise<QueryResult<T>>
  
  // Transaction support
  transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>
  
  // Utility methods
  validateSchema(schema: any, data: any): boolean
  close(): Promise<void>
}

class EnhancedDatabaseClient implements DatabaseClient {
  pool: Pool
  cache: typeof DatabaseCache
  logger: typeof DatabaseLogger
  monitor: PoolMonitor

  constructor(pool: Pool) {
    this.pool = pool
    this.cache = DatabaseCache
    this.logger = DatabaseLogger
    this.monitor = PoolMonitor.getInstance(pool)
  }

  async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now()
    try {
      const result = await this.pool.query<T>(sql, params)
      const duration = Date.now() - start
      
      this.logger.logQuery({
        query: sql,
        params,
        duration,
        result: result.rows
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.logger.logQuery({
        query: sql,
        params,
        duration,
        error: error as Error
      })
      throw error
    }
  }

  async queryWithCache<T>(
    sql: string,
    params: any[],
    ttl: number = 60000
  ): Promise<QueryResult<T>> {
    const cacheKey = DatabaseCache.generateKey(
      'query',
      sql,
      params
    )
    
    const cached = this.cache.get<QueryResult<T>>(cacheKey)
    if (cached) return cached

    const result = await this.query<T>(sql, params)
    this.cache.set(cacheKey, result, ttl)
    return result
  }

  async transaction<T>(
    callback: (client: DatabaseClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect()
    
    try {
      await client.query('BEGIN')
      const result = await callback(this)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  validateSchema(schema: any, data: any): boolean {
    try {
      schema.parse(data)
      return true
    } catch (error) {
      return false
    }
  }

  async close(): Promise<void> {
    this.monitor.stopMonitoring()
    await this.pool.end()
  }
}

// Export enhanced client instance
import pool from './db-connection'

export const db = new EnhancedDatabaseClient(pool)

// Export individual components for direct access
export { DatabaseCache, DatabaseLogger, PoolMonitor }