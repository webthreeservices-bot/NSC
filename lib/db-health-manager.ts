import { Pool } from 'pg'
import { warmupConnection } from './db-connection'

// Database connection health checker
export class DatabaseHealthChecker {
  private static lastHealthCheck = 0
  private static isHealthy = false
  private static readonly HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

  static async checkHealth(): Promise<boolean> {
    const now = Date.now()
    
    // Return cached result if check was recent
    if (now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
      return this.isHealthy
    }

    try {
      console.log('🏥 Checking database health...')
      
      // Import here to avoid circular dependencies
      const { testConnection } = await import('./db-connection')
      this.isHealthy = await testConnection()
      this.lastHealthCheck = now
      
      if (this.isHealthy) {
        console.log('✅ Database health check passed')
      } else {
        console.warn('⚠️ Database health check failed')
      }
      
      return this.isHealthy
    } catch (error) {
      console.error('❌ Database health check error:', error.message)
      this.isHealthy = false
      this.lastHealthCheck = now
      return false
    }
  }

  static async ensureConnection(): Promise<void> {
    const isHealthy = await this.checkHealth()
    
    if (!isHealthy) {
      console.log('🔧 Attempting to restore database connection...')
      
      try {
        // Try to warmup the connection
        await warmupConnection()
        
        // Check again
        const restored = await this.checkHealth()
        
        if (restored) {
          console.log('✅ Database connection restored')
        } else {
          console.error('❌ Failed to restore database connection')
          throw new Error('Database connection could not be restored')
        }
      } catch (error) {
        console.error('❌ Error restoring database connection:', error.message)
        throw error
      }
    }
  }
}

// Connection manager for critical operations
export class CriticalConnectionManager {
  private static activeConnections = 0
  private static readonly MAX_CONCURRENT_CONNECTIONS = 1 // Very conservative for Neon

  static async executeWithConnection<T>(
    operation: () => Promise<T>,
    operationName: string = 'Unknown operation'
  ): Promise<T> {
    // Check if we're at connection limit
    if (this.activeConnections >= this.MAX_CONCURRENT_CONNECTIONS) {
      console.warn(`⚠️ Connection limit reached, queuing ${operationName}`)
      
      // Wait for a connection to free up
      await this.waitForAvailableConnection()
    }

    this.activeConnections++
    console.log(`🔗 Starting ${operationName} (active: ${this.activeConnections}/${this.MAX_CONCURRENT_CONNECTIONS})`)

    try {
      // Ensure database is healthy before executing
      await DatabaseHealthChecker.ensureConnection()
      
      // Execute the operation with timeout
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Operation timeout: ${operationName}`)), 30000)
        )
      ])

      console.log(`✅ Completed ${operationName}`)
      return result
    } catch (error) {
      console.error(`❌ Failed ${operationName}:`, error.message)
      throw error
    } finally {
      this.activeConnections--
      console.log(`🔌 Released connection for ${operationName} (active: ${this.activeConnections}/${this.MAX_CONCURRENT_CONNECTIONS})`)
    }
  }

  private static async waitForAvailableConnection(): Promise<void> {
    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.activeConnections < this.MAX_CONCURRENT_CONNECTIONS) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100) // Check every 100ms
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        resolve() // Proceed anyway after timeout
      }, 10000)
    })
  }
}

export default {
  DatabaseHealthChecker,
  CriticalConnectionManager
}