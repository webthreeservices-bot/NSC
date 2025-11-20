import pool from './db-connection'

let lastHealthCheck = 0
let isHealthy = false
const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

export async function checkDatabaseHealth(): Promise<boolean> {
  const now = Date.now()
  
  // Return cached result if checked recently
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return isHealthy
  }
  
  try {
    const client = await pool.connect()
    try {
      const result = await client.query('SELECT 1 as health')
      isHealthy = result.rows.length > 0
      lastHealthCheck = now
      console.log('✅ Database health check passed')
      return isHealthy
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    isHealthy = false
    lastHealthCheck = now
    return false
  }
}

export async function ensureDatabaseConnection(): Promise<void> {
  const healthy = await checkDatabaseHealth()
  if (!healthy) {
    throw new Error('Database connection is not healthy. Please check your DATABASE_URL configuration.')
  }
}

// Warmup the connection pool on first import
let warmupPromise: Promise<void> | null = null

export async function warmupPool(): Promise<void> {
  if (warmupPromise) {
    return warmupPromise
  }
  
  warmupPromise = (async () => {
    try {
      console.log('🔥 Warming up database connection pool...')
      await checkDatabaseHealth()
      console.log('✅ Database pool warmed up')
    } catch (error) {
      console.error('❌ Failed to warm up database pool:', error)
      throw error
    }
  })()
  
  return warmupPromise
}
