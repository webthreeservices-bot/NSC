/**
 * Enhanced Database Query Functions
 * Replacement for Prisma-style queries with raw SQL
 */

import { query, queryOne, queryScalar, execute } from './db-new'
import { WhereClause, SelectClause, OrderByClause } from '../types/database'

interface QueryOptions {
  where?: WhereClause
  select?: SelectClause
  orderBy?: OrderByClause
  take?: number
  skip?: number
}

/**
 * Convert where clause to SQL conditions
 */
function buildWhereClause(where: WhereClause): { sql: string; params: any[] } {
  const conditions: string[] = []
  const params: any[] = []
  
  Object.entries(where).forEach(([key, value], index) => {
    if (value === null) {
      conditions.push(`"${key}" IS NULL`)
    } else if (typeof value === 'object') {
      // Handle operators like lt, gt, etc.
      Object.entries(value).forEach(([op, val]) => {
        switch(op) {
          case 'lt':
            conditions.push(`"${key}" < $${params.length + 1}`)
            params.push(val)
            break
          case 'gt':
            conditions.push(`"${key}" > $${params.length + 1}`)
            params.push(val)
            break
          case 'lte':
            conditions.push(`"${key}" <= $${params.length + 1}`)
            params.push(val)
            break
          case 'gte':
            conditions.push(`"${key}" >= $${params.length + 1}`)
            params.push(val)
            break
          case 'in':
            conditions.push(`"${key}" = ANY($${params.length + 1})`);
            params.push(Array.isArray(val) ? val : [val]);
            break
          default:
            console.warn(`Unsupported operator: ${op}`)
        }
      })
    } else {
      conditions.push(`"${key}" = $${params.length + 1}`)
      params.push(value)
    }
  })

  return {
    sql: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
    params
  }
}

/**
 * Convert select clause to SQL projection
 */
function buildSelectClause(select?: SelectClause): string {
  if (!select || Object.keys(select).length === 0) return '*'
  
  return Object.entries(select)
    .filter(([_, value]) => value)
    .map(([key]) => `"${key}"`)
    .join(', ')
}

/**
 * Convert orderBy to SQL ORDER BY clause
 */
function buildOrderByClause(orderBy?: OrderByClause): string {
  if (!orderBy) return ''
  
  const orders = Object.entries(orderBy)
    .map(([key, dir]) => `"${key}" ${dir.toUpperCase()}`)
    .join(', ')
  
  return orders ? `ORDER BY ${orders}` : ''
}

/**
 * Build pagination clause
 */
function buildPaginationClause(take?: number, skip?: number): string {
  const clauses: string[] = []
  
  if (take !== undefined) {
    clauses.push(`LIMIT ${take}`)
  }
  if (skip !== undefined) {
    clauses.push(`OFFSET ${skip}`)
  }
  
  return clauses.join(' ')
}

/**
 * Enhanced findMany with Prisma-like options
 */
export async function findMany<T = any>(
  table: string,
  options: QueryOptions = {}
): Promise<T[]> {
  const { where, select, orderBy, take, skip } = options
  
  const whereClause = buildWhereClause(where || {})
  const selectClause = buildSelectClause(select)
  const orderByClause = buildOrderByClause(orderBy)
  const paginationClause = buildPaginationClause(take, skip)
  
  const sql = `
    SELECT ${selectClause}
    FROM "${table}"
    ${whereClause.sql}
    ${orderByClause}
    ${paginationClause}
  `.trim()
  
  return query<T>(sql, whereClause.params)
}

/**
 * Enhanced findUnique with Prisma-like options
 */
export async function findUnique<T = any>(
  table: string,
  options: { where: WhereClause; select?: SelectClause }
): Promise<T | null> {
  const { where, select } = options
  
  const whereClause = buildWhereClause(where)
  const selectClause = buildSelectClause(select)
  
  const sql = `
    SELECT ${selectClause}
    FROM "${table}"
    ${whereClause.sql}
    LIMIT 1
  `.trim()
  
  return queryOne<T>(sql, whereClause.params)
}

/**
 * Enhanced create with Prisma-like options
 */
export async function create<T = any>(
  table: string,
  options: { data: Record<string, any> }
): Promise<T> {
  const { data } = options
  
  const columns = Object.keys(data).map(k => `"${k}"`).join(', ')
  const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')
  const values = Object.values(data)
  
  const sql = `
    INSERT INTO "${table}" (${columns})
    VALUES (${placeholders})
    RETURNING *
  `.trim()
  
  const result = await queryOne<T>(sql, values)
  if (!result) throw new Error(`Failed to create record in ${table}`)
  return result
}

/**
 * Enhanced update with Prisma-like options
 */
export async function update<T = any>(
  table: string,
  options: { where: WhereClause; data: Record<string, any> }
): Promise<T> {
  const { where, data } = options
  
  const whereClause = buildWhereClause(where)
  const setColumns = Object.keys(data)
    .map((k, i) => `"${k}" = $${i + 1}`)
    .join(', ')
  const values = [...Object.values(data), ...whereClause.params]
  
  const sql = `
    UPDATE "${table}"
    SET ${setColumns}
    ${whereClause.sql}
    RETURNING *
  `.trim()
  
  const result = await queryOne<T>(sql, values)
  if (!result) throw new Error(`Failed to update record in ${table}`)
  return result
}

/**
 * Enhanced delete with Prisma-like options
 */
export async function remove<T = any>(
  table: string,
  options: { where: WhereClause }
): Promise<T> {
  const { where } = options
  
  const whereClause = buildWhereClause(where)
  
  const sql = `
    DELETE FROM "${table}"
    ${whereClause.sql}
    RETURNING *
  `.trim()
  
  const result = await queryOne<T>(sql, whereClause.params)
  if (!result) throw new Error(`Failed to delete record in ${table}`)
  return result
}

/**
 * Enhanced count with Prisma-like options
 */
export async function count(
  table: string,
  options: { where?: WhereClause } = {}
): Promise<number> {
  const { where } = options
  
  const whereClause = buildWhereClause(where || {})
  
  const sql = `
    SELECT COUNT(*) as count
    FROM "${table}"
    ${whereClause.sql}
  `.trim()
  
  const result = await queryScalar<string>(sql, whereClause.params)
  return result ? parseInt(result, 10) : 0
}

export default {
  findMany,
  findUnique,
  create,
  update,
  remove,
  count
}

// Re-export low-level convenience functions for backwards compatibility
export { query, queryOne, queryScalar, execute }