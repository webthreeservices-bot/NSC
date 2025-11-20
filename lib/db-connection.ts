import { Pool } from 'pg'

// Load environment variables only in development
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = require('dotenv')
    dotenv.config()
  } catch (error) {
    // dotenv is optional, might not be installed in production
    console.log('dotenv not available, using system environment variables')
  }
}

// Parse DATABASE_URL to handle Neon and other providers
const getDatabaseConfig = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in environment variables')
    console.error('Please ensure your .env file contains a valid DATABASE_URL')
    throw new Error('DATABASE_URL is not defined in environment variables')
  }

  // For Neon and other cloud providers, always use SSL
  const isCloudProvider = connectionString.includes('neon.tech') ||
                         connectionString.includes('supabase.co') ||
                         connectionString.includes('amazonaws.com') ||
                         connectionString.includes('azure.com')

  // For Neon, we need specific SSL settings
  const isNeon = connectionString.includes('neon.tech')

  // SSL configuration based on provider
  const sslConfig = isNeon
    ? {
        rejectUnauthorized: false,
        ca: null,
        checkServerIdentity: () => undefined
      }
    : { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }

  // Optimized configuration for NeonDB
  return {
    connectionString,
    ssl: isCloudProvider ? sslConfig : false,
    max: 20, // ✅ Increased pool size for better concurrent request handling
    min: 5, // ✅ Keep more connections warm to avoid timeouts
    idleTimeoutMillis: 60000, // 60 seconds idle timeout (increased)
    connectionTimeoutMillis: 20000, // 20 seconds connection timeout (increased)
    allowExitOnIdle: false, // ✅ Don't exit on idle to maintain connections
    statement_timeout: 60000, // 60 seconds (increased)
    query_timeout: 60000, // 60 seconds (increased)
    keepAlive: true, // ✅ Keep connections alive
    keepAliveInitialDelayMillis: 5000, // 5 seconds
    // Additional Neon-specific optimizations
    application_name: 'nsc-bot-platform',
    idle_in_transaction_session_timeout: 120000 // 2 minutes (increased)
  }
}

// Single pool instance - NO resets, NO lazy initialization
let pool: Pool | null = null;
let isInitializing = false;

const getPool = () => {
  // Create pool only once
  if (!pool && !isInitializing) {
    isInitializing = true;
    try {
      pool = new Pool(getDatabaseConfig());

      // Add error handling for the pool - DO NOT reset pool or exit process
      pool.on('error', (err) => {
        console.error('❌ Unexpected error on idle client:', err);
        console.error('Connection will be removed from pool and recreated automatically');
        // ✅ Let pg handle reconnection automatically - don't reset pool
      });

      // Only log connection events when VERBOSE_DB_LOGS is set (not during build)
      const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
      const shouldLog = !isBuilding && (process.env.NODE_ENV !== 'production' || process.env.VERBOSE_DB_LOGS === 'true');

      if (shouldLog) {
        pool.on('connect', (client) => {
          console.log('✅ New client connected to NeonDB');
        });

        pool.on('remove', (client) => {
          console.log('🔌 Client removed from pool');
        });
      }

      if (!isBuilding) {
        console.log('🚀 Database pool initialized for NeonDB');
      }
    } catch (error) {
      isInitializing = false;
      console.error('❌ Failed to initialize database pool:', error);
      throw error;
    } finally {
      isInitializing = false;
    }
  }

  // Wait for initialization if it's in progress
  while (isInitializing && !pool) {
    // Busy wait - this is acceptable because initialization is fast
  }

  return pool!;
};

// Test database connection
export async function testConnection() {
  let client
  try {
    const poolInstance = getPool();
    client = await poolInstance.connect()
    const result = await client.query('SELECT NOW()')
    console.log('Database connection successful:', result.rows[0])
    return true
  } catch (err) {
    console.error('Database connection error:', err)
    return false
  } finally {
    if (client) client.release()
  }
}

// Warmup database connection - call this on server start (NOT during build)
export async function warmupConnection() {
  // Skip warmup during build phase
  const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
  if (isBuilding) {
    return;
  }

  console.log('🔥 Warming up database connection...')

  try {
    // Try to establish a connection and run a simple query
    const success = await testConnection()

    if (success) {
      console.log('✅ Database connection warmed up successfully')

      // Pre-establish a connection in the pool
      const poolInstance = getPool();
      const client = await poolInstance.connect()

      // Keep the connection alive briefly then release
      setTimeout(() => {
        client.release()
        console.log('🔌 Warmup connection released')
      }, 1000)

    } else {
      console.warn('⚠️ Database warmup failed, but continuing...')
    }
  } catch (error: any) {
    console.warn('⚠️ Database warmup error:', error?.message || 'Unknown error')
  }
}

// Export a proxy that lazily initializes the pool
const poolProxy = new Proxy({} as Pool, {
  get(target, prop) {
    const poolInstance = getPool();
    return poolInstance[prop as keyof Pool];
  }
});

/**
 * Get a database client with timeout protection
 * @param timeoutMs Timeout in milliseconds (default: 20000ms)
 * @returns Database client
 * @throws Error if connection times out or fails
 */
export async function getClientWithTimeout(timeoutMs: number = 20000) {
  const poolInstance = getPool();
  
  return Promise.race([
    poolInstance.connect(),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Database connection timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

/**
 * Execute a query with timeout protection
 * @param query SQL query string
 * @param params Query parameters
 * @param timeoutMs Query timeout in milliseconds (default: 20000ms)
 * @returns Query result
 */
export async function queryWithTimeout(query: string, params: any[] = [], timeoutMs: number = 20000) {
  let client;
  try {
    client = await getClientWithTimeout(timeoutMs);
    
    const queryPromise = client.query(query, params);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
    );
    
    return await Promise.race([queryPromise, timeoutPromise]);
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Export the pool for use in other modules
export default poolProxy
