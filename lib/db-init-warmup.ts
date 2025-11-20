import { warmupPool } from '@/lib/db-health'

// This file will be imported early in the Next.js lifecycle
// to ensure database connections are warmed up

let warmupStarted = false

export async function initializeDatabase() {
  if (warmupStarted) {
    return
  }
  
  warmupStarted = true
  
  if (typeof window === 'undefined') {
    // Only run on server-side
    try {
      console.log('🔥 Database pool initialization deferred to first query')
      // DISABLED: Don't warmup to save connections
      // await warmupPool()
      console.log('✅ Database will connect on first query')
    } catch (error) {
      console.error('❌ Failed to initialize database:', error)
      // Don't throw - allow the app to start and retry on demand
    }
  }
}

// Auto-initialize on import (but warmup is disabled)
initializeDatabase()
