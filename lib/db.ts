/**
 * Pure PostgreSQL Database Layer
 * NO PRISMA. NO ORM. Just direct SQL via pg driver.
 * Neon DB (Serverless PostgreSQL)
 */

import pool from './db-connection'

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
      acc[camelKey] = toCamelCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

// Helper to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(toSnakeCase)
  if (obj !== null && typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = toSnakeCase(obj[key])
      }
    }
    return result
  }
  return obj
}

/**
 * Execute any PostgreSQL query and return rows
 * @example
 * const users = await query<User>('SELECT * FROM "User" WHERE "isActive" = $1', [true])
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  // Validate that sql is actually a string
  if (typeof sql !== 'string' || sql.trim().length === 0) {
    const error = new Error('A query must have either text or a name. Supplying neither is unsupported.')
    console.error('PostgreSQL Error:', {
      message: error.message,
      sql: sql,
      code: undefined,
    })
    throw error
  }

  try {
    const result = await pool.query(sql, params)
    return result.rows as T[]
  } catch (error: any) {
    console.error('PostgreSQL Error:', {
      message: error.message,
      sql: typeof sql === 'string' ? sql.substring(0, 200) : sql,
      code: error.code,
    })
    throw error
  }
}

/**
 * Get a single row from query (or null)
 * @example
 * const user = await queryOne<User>('SELECT * FROM "User" WHERE "id" = $1', [userId])
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

/**
 * Get a single scalar value (for COUNT, SUM, MAX, AVG, etc.)
 * @example
 * const count = await queryScalar<number>('SELECT COUNT(*) as count FROM "User"')
 */
export async function queryScalar<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<any>(sql, params)
  if (rows.length === 0) return null
  const firstValue = Object.values(rows[0])[0]
  return firstValue as T
}

/**
 * Execute INSERT/UPDATE/DELETE query
 * Returns number of affected rows
 * @example
 * const count = await execute('UPDATE "User" SET "isActive" = $1 WHERE "id" = $2', [true, userId])
 */
export async function execute(sql: string, params: any[] = []): Promise<number> {
  // Validate that sql is actually a string
  if (typeof sql !== 'string' || sql.trim().length === 0) {
    const error = new Error('A query must have either text or a name. Supplying neither is unsupported.')
    console.error('PostgreSQL Error:', {
      message: error.message,
      sql: sql,
      code: undefined,
    })
    throw error
  }

  try {
    const result = await pool.query(sql, params)
    return result.rowCount || 0
  } catch (error: any) {
    console.error('PostgreSQL Error:', {
      message: error.message,
      sql: typeof sql === 'string' ? sql.substring(0, 200) : sql,
      code: error.code,
    })
    throw error
  }
}

/**
 * Run multiple queries atomically in a transaction
 * Automatically COMMIT on success or ROLLBACK on error
 * @example
 * await transaction(async (client) => {
 *   await client.query('INSERT INTO "User" VALUES (...)')
 *   await client.query('UPDATE "Package" SET ...')
 * })
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Disconnect from database (graceful shutdown)
 */
export async function disconnect(): Promise<void> {
  await pool.end()
}

// Re-export pool for advanced use cases
export { pool }

// Export helpers for use in refactored code
export { toCamelCase, toSnakeCase }

/**
 * SQL translator - Converts SQL-style calls to pure queries
 * Translates ALL SQL calls to direct database queries underneath
 * This allows 60+ existing files to work while transitioning to pure SQL
 */
export const prisma: any = new Proxy({}, {
  get: (target, table: string | symbol) => {
    if (typeof table !== 'string') return undefined
    
    return {
      async findUnique({ where, select }: any) {
        const [key, value] = Object.entries(where)[0] as [string, any]
        const fields = select ? Object.keys(select).map(k => `"${k}"`).join(', ') : '*'
        const row = await queryOne(
          `SELECT ${fields} FROM "${table}" WHERE "${key}" = $1 LIMIT 1`,
          [value]
        )
        return row ? toCamelCase(row) : null
      },
      
      async findMany({ where, select, orderBy, take, skip }: any = {}) {
        const params: any[] = []
        const fields = select ? Object.keys(select).map(k => `"${k}"`).join(', ') : '*'
        let sql = `SELECT ${fields} FROM "${table}"`

        if (where) {
          const conditions: string[] = []
          for (const [key, value] of Object.entries(where)) {
            if (value === null) {
              conditions.push(`"${key}" IS NULL`)
            } else if (typeof value === 'object' && value !== null) {
              // Handle various operators
              if ('in' in value) {
                const placeholders = (value as any).in.map((_: any, i: number) => `$${params.length + i + 1}`).join(', ')
                params.push(...(value as any).in)
                conditions.push(`"${key}" IN (${placeholders})`)
              } else if ('notIn' in value) {
                const placeholders = (value as any).notIn.map((_: any, i: number) => `$${params.length + i + 1}`).join(', ')
                params.push(...(value as any).notIn)
                conditions.push(`"${key}" NOT IN (${placeholders})`)
              } else if ('lt' in value) {
                params.push((value as any).lt)
                conditions.push(`"${key}" < $${params.length}`)
              } else if ('lte' in value) {
                params.push((value as any).lte)
                conditions.push(`"${key}" <= $${params.length}`)
              } else if ('gt' in value) {
                params.push((value as any).gt)
                conditions.push(`"${key}" > $${params.length}`)
              } else if ('gte' in value) {
                params.push((value as any).gte)
                conditions.push(`"${key}" >= $${params.length}`)
              } else if ('contains' in value) {
                params.push(`%${(value as any).contains}%`)
                conditions.push(`"${key}" ILIKE $${params.length}`)
              } else if ('startsWith' in value) {
                params.push(`${(value as any).startsWith}%`)
                conditions.push(`"${key}" ILIKE $${params.length}`)
              } else if ('endsWith' in value) {
                params.push(`%${(value as any).endsWith}`)
                conditions.push(`"${key}" ILIKE $${params.length}`)
              } else if ('not' in value) {
                params.push((value as any).not)
                conditions.push(`"${key}" != $${params.length}`)
              } else {
                // Fallback: treat as direct value
                params.push(value)
                conditions.push(`"${key}" = $${params.length}`)
              }
            } else {
              params.push(value)
              conditions.push(`"${key}" = $${params.length}`)
            }
          }
          if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`
        }

        if (orderBy) {
          const orderClauses: string[] = []
          for (const [field, dir] of Object.entries(orderBy)) {
            orderClauses.push(`"${field}" ${(dir as string).toUpperCase()}`)
          }
          sql += ` ORDER BY ${orderClauses.join(', ')}`
        }

        if (take) sql += ` LIMIT ${take}`
        if (skip) sql += ` OFFSET ${skip}`

        const rows = await query(sql, params)
        return rows.map(r => toCamelCase(r))
      },
      
      async findFirst({ where, select, orderBy }: any) {
        // Use findMany with take: 1 to reuse the logic
        const result = await this.findMany({ where, select, orderBy, take: 1 })
        return result.length > 0 ? result[0] : null
      },
      
      async count({ where }: any = {}) {
        const params: any[] = []
        let sql = `SELECT COUNT(*) as cnt FROM "${table}"`

        if (where) {
          const conditions: string[] = []
          for (const [key, value] of Object.entries(where)) {
            if (value === null) {
              conditions.push(`"${key}" IS NULL`)
            } else if (typeof value === 'object' && value !== null) {
              // Handle operators for count
              if ('in' in value) {
                const placeholders = (value as any).in.map((_: any, i: number) => `$${params.length + i + 1}`).join(', ')
                params.push(...(value as any).in)
                conditions.push(`"${key}" IN (${placeholders})`)
              } else if ('not' in value) {
                params.push((value as any).not)
                conditions.push(`"${key}" != $${params.length}`)
              } else {
                params.push(value)
                conditions.push(`"${key}" = $${params.length}`)
              }
            } else {
              params.push(value)
              conditions.push(`"${key}" = $${params.length}`)
            }
          }
          if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`
        }

        const row = await queryOne<any>(sql, params)
        return row ? parseInt(row.cnt) : 0
      },
      
      async create({ data, select }: any) {
        const keys = Object.keys(data)
        const values = Object.values(data)
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
        const keyString = keys.map(k => `"${k}"`).join(', ')
        const fields = select ? Object.keys(select).map(k => `"${k}"`).join(', ') : '*'
        
        const row = await queryOne(
          `INSERT INTO "${table}" (${keyString}) VALUES (${placeholders}) RETURNING ${fields}`,
          values
        )
        return row ? toCamelCase(row) : null
      },
      
      async update({ where, data, select }: any) {
        const params: any[] = []
        const sets: string[] = []

        // Build SET clause
        for (const [key, value] of Object.entries(data)) {
          if (value !== undefined) {
            if (typeof value === 'object' && value !== null) {
              // Handle increment/decrement operations
              if ('increment' in value) {
                params.push((value as any).increment)
                sets.push(`"${key}" = COALESCE("${key}", 0) + $${params.length}`)
              } else if ('decrement' in value) {
                params.push((value as any).decrement)
                sets.push(`"${key}" = COALESCE("${key}", 0) - $${params.length}`)
              } else {
                // Regular object value
                params.push(JSON.stringify(value))
                sets.push(`"${key}" = $${params.length}`)
              }
            } else {
              params.push(value)
              sets.push(`"${key}" = $${params.length}`)
            }
          }
        }

        // Build WHERE clause
        const whereConditions: string[] = []
        for (const [key, value] of Object.entries(where)) {
          params.push(value)
          whereConditions.push(`"${key}" = $${params.length}`)
        }

        const fields = select ? Object.keys(select).map(k => `"${k}"`).join(', ') : '*'
        const row = await queryOne(
          `UPDATE "${table}" SET ${sets.join(', ')} WHERE ${whereConditions.join(' AND ')} RETURNING ${fields}`,
          params
        )
        return row ? toCamelCase(row) : null
      },
      
      async delete({ where }: any) {
        const [key, value] = Object.entries(where)[0] as [string, any]
        await execute(`DELETE FROM "${table}" WHERE "${key}" = $1`, [value])
        return {}
      },
      
      async deleteMany({ where }: any = {}) {
        const params: any[] = []
        let sql = `DELETE FROM "${table}"`
        
        if (where) {
          const conditions: string[] = []
          for (const [key, value] of Object.entries(where)) {
            params.push(value)
            conditions.push(`"${key}" = $${params.length}`)
          }
          if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`
        }
        
        const count = await execute(sql, params)
        return { count }
      },
      
      async aggregate({ where, _sum, _count }: any) {
        const params: any[] = []
        const aggs: string[] = []
        
        if (_sum) {
          Object.keys(_sum).forEach(field => {
            aggs.push(`SUM("${field}") as sum_${field}`)
          })
        }
        if (_count) aggs.push('COUNT(*) as cnt')
        
        let sql = `SELECT ${aggs.join(', ')} FROM "${table}"`
        
        if (where) {
          const conditions: string[] = []
          for (const [key, value] of Object.entries(where)) {
            params.push(value)
            conditions.push(`"${key}" = $${params.length}`)
          }
          if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`
        }
        
        const row = await queryOne<any>(sql, params)
        const result: any = {}
        if (_sum && row) {
          result._sum = {}
          Object.keys(_sum).forEach(field => {
            result._sum[field] = row[`sum_${field}`] ? parseFloat(row[`sum_${field}`]) : 0
          })
        }
        if (_count && row) result._count = row.cnt ? parseInt(row.cnt) : 0
        return result
      },
      
      async groupBy({ by, _count, _sum, where }: any) {
        const params: any[] = []
        const fields = (Array.isArray(by) ? by : [by]).map(f => `"${f}"`)
        const aggs: string[] = []
        
        if (_count) aggs.push('COUNT(*) as cnt')
        if (_sum) {
          Object.keys(_sum).forEach(field => {
            aggs.push(`SUM("${field}") as sum_${field}`)
          })
        }
        
        let sql = `SELECT ${fields.join(', ')}${aggs.length ? ', ' + aggs.join(', ') : ''} FROM "${table}"`
        
        if (where) {
          const conditions: string[] = []
          for (const [key, value] of Object.entries(where)) {
            params.push(value)
            conditions.push(`"${key}" = $${params.length}`)
          }
          if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`
        }
        
        sql += ` GROUP BY ${fields.join(', ')}`
        const rows = await query(sql, params)
        
        return rows.map((row: any) => {
          const transformed: any = {}
          (Array.isArray(by) ? by : [by]).forEach(field => {
            transformed[field] = row[field]
          })
          if (_count) transformed._count = row.cnt ? parseInt(row.cnt) : 0
          if (_sum) {
            transformed._sum = {}
            Object.keys(_sum).forEach(field => {
              transformed._sum[field] = row[`sum_${field}`] ? parseFloat(row[`sum_${field}`]) : 0
            })
          }
          return transformed
        })
      },
      
      async upsert({ where, create, update }: any) {
        const existing = await this.findUnique({ where })
        return existing ? this.update({ where, data: update }) : this.create({ data: create })
      }
    }
  }
})

// Support for await transaction
export const $transaction = transaction

export default {
  query,
  queryOne,
  queryScalar,
  execute,
  transaction,
  disconnect,
  pool,
  toCamelCase,
  toSnakeCase,
  prisma,
  $transaction,
}