/**
 * Minimal Database Layer
 * Direct SQL queries without custom ORMs or bloat
 * 
 * Philosophy: Write SQL explicitly, keep it simple and fast
 * Type Safety: Use TypeScript interfaces for query results
 */

import pool from './db-connection'

/**
 * Execute a raw SQL query and return rows
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result = await pool.query(sql, params)
    return result.rows as T[]
  } catch (error) {
    console.error('Query error:', { sql, params, error })
    throw error
  }
}

/**
 * Execute a query expecting a single row result
 */
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

/**
 * Execute a query expecting a single value (e.g., COUNT, MAX, etc.)
 */
export async function queryScalar<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query(sql, params)
  if (rows.length === 0) return null
  const firstRow = rows[0]
  return Object.values(firstRow)[0] as T
}

/**
 * Execute a query and return the count of affected rows
 */
export async function execute(
  sql: string,
  params?: any[]
): Promise<number> {
  try {
    const result = await pool.query(sql, params)
    return result.rowCount || 0
  } catch (error) {
    console.error('Execute error:', { sql, params, error })
    throw error
  }
}

/**
 * Execute multiple queries in a transaction
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
 * Helper: Build WHERE clause from object
 * 
 * @example
 * buildWhere({ userId: 123, status: 'ACTIVE' })
 * // Returns: { clause: 'WHERE "userId" = $1 AND "status" = $2', params: [123, 'ACTIVE'] }
 */
export function buildWhere(
  conditions: Record<string, any>,
  startParamIndex: number = 1
): { clause: string; params: any[] } {
  const parts: string[] = []
  const params: any[] = []
  let paramIndex = startParamIndex

  for (const [key, value] of Object.entries(conditions)) {
    if (value === null) {
      parts.push(`"${key}" IS NULL`)
    } else if (value === undefined) {
      // Skip undefined values
      continue
    } else {
      parts.push(`"${key}" = $${paramIndex}`)
      params.push(value)
      paramIndex++
    }
  }

  const clause = parts.length > 0 ? 'WHERE ' + parts.join(' AND ') : ''
  return { clause, params }
}

/**
 * Helper: Build SET clause for UPDATE statements
 * 
 * @example
 * buildSet({ name: 'John', email: 'john@example.com' })
 * // Returns: { clause: '"name" = $1, "email" = $2', params: ['John', 'john@example.com'] }
 */
export function buildSet(
  data: Record<string, any>,
  startParamIndex: number = 1
): { clause: string; params: any[] } {
  const parts: string[] = []
  const params: any[] = []
  let paramIndex = startParamIndex

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      parts.push(`"${key}" = $${paramIndex}`)
      params.push(value)
      paramIndex++
    }
  }

  const clause = parts.join(', ')
  return { clause, params }
}

/**
 * Helper: Build INSERT clause
 * 
 * @example
 * buildInsert({ name: 'John', email: 'john@example.com' })
 * // Returns: { columns: '"name", "email"', values: '$1, $2', params: ['John', 'john@example.com'] }
 */
export function buildInsert(
  data: Record<string, any>
): { columns: string; values: string; params: any[] } {
  const keys = Object.keys(data).filter(k => data[k] !== undefined)
  const columns = keys.map(k => `"${k}"`).join(', ')
  const values = keys.map((_, i) => `$${i + 1}`).join(', ')
  const params = keys.map(k => data[k])

  return { columns, values, params }
}

/**
 * Helper: Build ORDER BY clause
 * 
 * @example
 * buildOrderBy({ createdAt: 'DESC', name: 'ASC' })
 * // Returns: 'ORDER BY "createdAt" DESC, "name" ASC'
 */
export function buildOrderBy(
  order: Record<string, 'ASC' | 'DESC'>
): string {
  const parts = Object.entries(order).map(
    ([key, direction]) => `"${key}" ${direction}`
  )
  return parts.length > 0 ? 'ORDER BY ' + parts.join(', ') : ''
}

// ============================================================================
// TYPED QUERY HELPERS - Add these as you need them
// ============================================================================

/**
 * User queries
 */
export const users = {
  async findById(id: string) {
    return queryOne(
      `SELECT * FROM "User" WHERE "id" = $1`,
      [id]
    )
  },

  async findByEmail(email: string) {
    return queryOne(
      `SELECT * FROM "User" WHERE "email" = $1`,
      [email]
    )
  },

  async findMany(limit: number = 50, offset: number = 0) {
    return query(
      `SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
  },

  async count() {
    return queryScalar<number>(
      `SELECT COUNT(*) as count FROM "User"`
    )
  },

  async update(id: string, data: Record<string, any>) {
    const { clause, params } = buildSet(data)
    return execute(
      `UPDATE "User" SET ${clause} WHERE "id" = $${params.length + 1} RETURNING *`,
      [...params, id]
    )
  },

  async create(data: Record<string, any>) {
    const { columns, values, params } = buildInsert(data)
    return queryOne(
      `INSERT INTO "User" (${columns}) VALUES (${values}) RETURNING *`,
      params
    )
  },

  async delete(id: string) {
    return execute(
      `DELETE FROM "User" WHERE "id" = $1`,
      [id]
    )
  }
}

/**
 * Package queries
 */
export const packages = {
  async findById(id: string) {
    return queryOne(
      `SELECT * FROM "Package" WHERE "id" = $1`,
      [id]
    )
  },

  async findByUserId(userId: string) {
    return query(
      `SELECT * FROM "Package" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [userId]
    )
  },

  async count() {
    return queryScalar<number>(
      `SELECT COUNT(*) as count FROM "Package"`
    )
  },

  async countByStatus(status: string) {
    return queryScalar<number>(
      `SELECT COUNT(*) as count FROM "Package" WHERE "status" = $1`,
      [status]
    )
  },

  async create(data: Record<string, any>) {
    const { columns, values, params } = buildInsert(data)
    return queryOne(
      `INSERT INTO "Package" (${columns}) VALUES (${values}) RETURNING *`,
      params
    )
  },

  async update(id: string, data: Record<string, any>) {
    const { clause, params } = buildSet(data)
    return execute(
      `UPDATE "Package" SET ${clause} WHERE "id" = $${params.length + 1}`,
      [...params, id]
    )
  }
}

/**
 * Transaction queries
 */
export const transactions = {
  async findById(id: string) {
    return queryOne(
      `SELECT * FROM "Transaction" WHERE "id" = $1`,
      [id]
    )
  },

  async findByUserId(userId: string) {
    return query(
      `SELECT * FROM "Transaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [userId]
    )
  },

  async findByType(type: string) {
    return query(
      `SELECT * FROM "Transaction" WHERE "type" = $1 ORDER BY "createdAt" DESC`,
      [type]
    )
  },

  async count() {
    return queryScalar<number>(
      `SELECT COUNT(*) as count FROM "Transaction"`
    )
  },

  async create(data: Record<string, any>) {
    const { columns, values, params } = buildInsert(data)
    return queryOne(
      `INSERT INTO "Transaction" (${columns}) VALUES (${values}) RETURNING *`,
      params
    )
  }
}

/**
 * Withdrawal queries
 */
export const withdrawals = {
  async findById(id: string) {
    return queryOne(
      `SELECT * FROM "Withdrawal" WHERE "id" = $1`,
      [id]
    )
  },

  async findByUserId(userId: string) {
    return query(
      `SELECT * FROM "Withdrawal" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [userId]
    )
  },

  async findByStatus(status: string) {
    return query(
      `SELECT * FROM "Withdrawal" WHERE "status" = $1 ORDER BY "createdAt" DESC`,
      [status]
    )
  },

  async countByStatus(status: string) {
    return queryScalar<number>(
      `SELECT COUNT(*) as count FROM "Withdrawal" WHERE "status" = $1`,
      [status]
    )
  },

  async create(data: Record<string, any>) {
    const { columns, values, params } = buildInsert(data)
    return queryOne(
      `INSERT INTO "Withdrawal" (${columns}) VALUES (${values}) RETURNING *`,
      params
    )
  },

  async update(id: string, data: Record<string, any>) {
    const { clause, params } = buildSet(data)
    return execute(
      `UPDATE "Withdrawal" SET ${clause} WHERE "id" = $${params.length + 1}`,
      [...params, id]
    )
  }
}

/**
 * ROI Settings queries
 */
export const roiSettings = {
  async findAll() {
    return query(`SELECT * FROM "RoiSettings" ORDER BY "updatedAt" DESC`)
  },

  async findByKey(key: string) {
    return queryOne(
      `SELECT * FROM "RoiSettings" WHERE "key" = $1`,
      [key]
    )
  },

  async update(key: string, value: any) {
    return execute(
      `UPDATE "RoiSettings" SET "value" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "key" = $2`,
      [value, key]
    )
  }
}

// ============================================================================
// EXPORT FOR DIRECT SQL ACCESS
// ============================================================================

export default {
  query,
  queryOne,
  queryScalar,
  execute,
  transaction,
  buildWhere,
  buildSet,
  buildInsert,
  buildOrderBy,
  users,
  packages,
  transactions,
  withdrawals,
  roiSettings
}
