import pool, { testConnection } from './db-connection'
import * as fs from 'fs'
import * as path from 'path'

// Initialize database schema using the SQL file
export async function initializeDatabase() {
  try {
    // First test the connection
    const isConnected = await testConnection()
    if (!isConnected) {
      console.error('Failed to connect to database, cannot initialize schema')
      return false
    }

    console.log('Initializing database schema...')
    
    // Read the SQL schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'db-schema.sql')
    if (!fs.existsSync(schemaPath)) {
      console.error('Schema file not found at:', schemaPath)
      return false
    }

    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the SQL schema
    await pool.query(schema)
    
    console.log('Database schema initialization complete')
    return true
  } catch (error) {
    console.error('Error initializing database schema:', error)
    
    // Fallback to creating just the ReferralCounter table if there's an error
    try {
      console.log('Attempting fallback initialization of ReferralCounter table...')
      
      // Create ReferralCounter table with simplified structure
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "ReferralCounter" (
          "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
          "counterType" TEXT NOT NULL,
          "currentValue" INTEGER NOT NULL DEFAULT 1,
          CONSTRAINT "ReferralCounter_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "ReferralCounter_counterType_key" UNIQUE ("counterType")
        );
      `)
      
      // Initialize with default values - simplified version without timestamps
      await pool.query(`
        INSERT INTO "ReferralCounter" ("counterType", "currentValue")
        VALUES 
          ('NSCREF', 1000)
        ON CONFLICT ("counterType") DO NOTHING;
      `)
      
      console.log('ReferralCounter table created and initialized')
      return true
    } catch (fallbackError) {
      console.error('Fallback initialization failed:', fallbackError)
      return false
    }
  }
}

// Initialize database on module import
initializeDatabase().catch(console.error)

export default pool
