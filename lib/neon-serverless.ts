import { neon } from '@neondatabase/serverless'

/**
 * Neon Serverless Database Connection
 * Optimized for Neon's serverless environment
 */

let sql: ReturnType<typeof neon> | null = null

export function getNeonSQL() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables')
    }
    
    console.log('🚀 Initializing Neon Serverless SQL connection')
    sql = neon(databaseUrl)
  }
  return sql
}

/**
 * Execute a query with Neon Serverless Driver
 * This bypasses traditional connection pooling issues
 * Uses tagged template literals as required by Neon
 */
export async function neonQuery<T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> {
  const sql = getNeonSQL()
  
  try {
    console.log(`🔍 Executing Neon query: ${query.substring(0, 100)}...`)
    
    // For Neon serverless, we need to use sql.query() for parameterized queries
    const result = await sql.query(query, params)
    
    const resultArray = Array.isArray(result) ? result : [result]
    console.log(`✅ Neon query completed, returned ${resultArray.length} rows`)
    return resultArray as T[]
    
  } catch (error) {
    console.error('❌ Neon query failed:', error.message)
    console.error('Query:', query)
    console.error('Params:', params)
    throw error
  }
}

/**
 * Execute a prepared statement with Neon Serverless Driver
 * For queries that need parameter binding
 */
export async function neonQueryPrepared<T = any>(
  queryTemplate: (sql: ReturnType<typeof neon>) => Promise<T[]>
): Promise<T[]> {
  const sql = getNeonSQL()
  
  try {
    console.log(`🔍 Executing Neon prepared query...`)
    
    const result = await queryTemplate(sql)
    
    console.log(`✅ Neon prepared query completed, returned ${result.length} rows`)
    return result
    
  } catch (error) {
    console.error('❌ Neon prepared query failed:', error.message)
    throw error
  }
}

export default {
  getNeonSQL,
  neonQuery,
  neonQueryPrepared
}