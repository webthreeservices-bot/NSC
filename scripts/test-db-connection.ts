import { checkDatabaseHealth, ensureDatabaseConnection } from '../lib/db-health'

async function testConnection() {
  console.log('Testing database connection...')
  
  try {
    const isHealthy = await checkDatabaseHealth()
    console.log('Database health:', isHealthy ? '✅ Healthy' : '❌ Unhealthy')
    
    if (isHealthy) {
      console.log('\nTesting ensureDatabaseConnection...')
      await ensureDatabaseConnection()
      console.log('✅ Database connection ensured')
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    process.exit(1)
  }
}

testConnection()
