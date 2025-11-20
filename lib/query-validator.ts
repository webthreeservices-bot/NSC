/**
 * SQL Query Field Whitelisting
 * Prevents SQL injection by validating field names against allowed lists
 */

// Allowed fields for user queries
export const ALLOWED_USER_FIELDS = [
  'id',
  'email',
  'username',
  'firstName',
  'lastName',
  'createdAt',
  'updatedAt',
  'status',
  'role',
  'emailVerified',
  'lastLoginAt',
] as const

// Allowed fields for payment queries
export const ALLOWED_PAYMENT_FIELDS = [
  'id',
  'userId',
  'amount',
  'network',
  'status',
  'txHash',
  'fromAddress',
  'toAddress',
  'createdAt',
  'updatedAt',
  'confirmedAt',
] as const

// Allowed fields for package queries
export const ALLOWED_PACKAGE_FIELDS = [
  'id',
  'userId',
  'packageId',
  'amount',
  'status',
  'roiPercentage',
  'duration',
  'startDate',
  'endDate',
  'createdAt',
  'updatedAt',
] as const

// Allowed fields for referral queries
export const ALLOWED_REFERRAL_FIELDS = [
  'id',
  'referrerId',
  'referredUserId',
  'level',
  'commission',
  'status',
  'createdAt',
  'updatedAt',
] as const

// Allowed sort orders
export const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const

type AllowedField = 
  | typeof ALLOWED_USER_FIELDS[number]
  | typeof ALLOWED_PAYMENT_FIELDS[number]
  | typeof ALLOWED_PACKAGE_FIELDS[number]
  | typeof ALLOWED_REFERRAL_FIELDS[number]

/**
 * Validate field name against whitelist
 */
export function isValidField(field: string, whitelist: readonly string[]): boolean {
  return whitelist.includes(field)
}

/**
 * Validate sort order
 */
export function isValidSortOrder(order: string): order is 'asc' | 'desc' {
  return ALLOWED_SORT_ORDERS.includes(order as any)
}
/**
 * Sanitize and validate orderBy parameter for SQL queries
 */
export function validateOrderBy(
  orderBy: unknown,
  whitelist: readonly string[]
): Record<string, 'asc' | 'desc'> | null {
  if (!orderBy || typeof orderBy !== 'object') {
    return null
  }

  const entries = Object.entries(orderBy)
  if (entries.length === 0) {
    return null
  }

  const [field, order] = entries[0]
  
  if (!isValidField(field, whitelist)) {
    throw new Error(`Invalid field name: ${field}`)
  }

  if (!isValidSortOrder(order as string)) {
    throw new Error(`Invalid sort order: ${order}`)
  }

  return { [field]: order }
}

/**
 * Validate select fields for SQL queries
 */
export function validateSelect(
  select: unknown,
  whitelist: readonly string[]
): Record<string, boolean> | null {
  if (!select || typeof select !== 'object') {
    return null
  }

  const validated: Record<string, boolean> = {}
  
  for (const [field, value] of Object.entries(select)) {
    if (!isValidField(field, whitelist)) {
      throw new Error(`Invalid select field: ${field}`)
    }
    
    if (typeof value !== 'boolean') {
      throw new Error(`Select value must be boolean for field: ${field}`)
    }
    
    validated[field] = value
  }

  return Object.keys(validated).length > 0 ? validated : null
}

/**
 * Validate where clause field names
 */
export function validateWhereFields(
  where: unknown,
  whitelist: readonly string[]
): void {
  if (!where || typeof where !== 'object') {
    return
  }

  for (const field of Object.keys(where)) {
    // Skip SQL operators (AND, OR, NOT)
    if (['AND', 'OR', 'NOT'].includes(field)) {
      const operatorValue = (where as any)[field]
      if (Array.isArray(operatorValue)) {
        operatorValue.forEach(clause => validateWhereFields(clause, whitelist))
      } else {
        validateWhereFields(operatorValue, whitelist)
      }
      continue
    }

    if (!isValidField(field, whitelist)) {
      throw new Error(`Invalid where field: ${field}`)
    }
  }
}

/**
 * Sanitize pagination parameters
 */
export function validatePagination(params: {
  skip?: unknown
  take?: unknown
}): { skip?: number; take?: number } {
  const result: { skip?: number; take?: number } = {}

  if (params.skip !== undefined) {
    const skip = Number(params.skip)
    if (!Number.isInteger(skip) || skip < 0) {
      throw new Error('Invalid skip parameter')
    }
    result.skip = skip
  }

  if (params.take !== undefined) {
    const take = Number(params.take)
    if (!Number.isInteger(take) || take < 1 || take > 100) {
      throw new Error('Invalid take parameter (must be 1-100)')
    }
    result.take = take
  }

  return result
}
