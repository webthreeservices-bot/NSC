/**
 * Pagination Helper
 * Standardizes pagination across all list endpoints
 */

import { NextRequest } from 'next/server'

export interface PaginationParams {
  page: number
  limit: number
  skip: number
  take: number
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Extract and validate pagination parameters from request
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url)
  
  // Parse page number
  let page = parseInt(searchParams.get('page') || String(DEFAULT_PAGE))
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  
  // Parse limit
  let limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))
  if (isNaN(limit) || limit < 1) {
    limit = DEFAULT_LIMIT
  }
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT
  }
  
  // Calculate skip and take for SQL queries
  const skip = (page - 1) * limit
  const take = limit
  
  return {
    page,
    limit,
    skip,
    take
  }
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  totalItems: number,
  params: PaginationParams
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / params.limit)
  
  return {
    currentPage: params.page,
    totalPages,
    totalItems,
    itemsPerPage: params.limit,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1
  }
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(totalItems, params)
  }
}

/**
 * Validate and sanitize sort parameters
 */
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

export function getSortParams(
  request: NextRequest,
  allowedFields: string[],
  defaultField: string = 'createdAt'
): SortParams {
  const { searchParams } = new URL(request.url)
  
  let field = searchParams.get('sortBy') || defaultField
  let order = searchParams.get('order')?.toLowerCase() as 'asc' | 'desc' || 'desc'
  
  // Validate field is in whitelist
  if (!allowedFields.includes(field)) {
    field = defaultField
  }
  
  // Validate order
  if (order !== 'asc' && order !== 'desc') {
    order = 'desc'
  }
  
  return { field, order }
}

/**
 * Extract search/filter parameters
 */
export function getSearchParams(request: NextRequest): Record<string, string> {
  const { searchParams } = new URL(request.url)
  const filters: Record<string, string> = {}
  
  // Common filter parameters
  const filterKeys = ['status', 'network', 'type', 'search', 'startDate', 'endDate']
  
  for (const key of filterKeys) {
    const value = searchParams.get(key)
    if (value) {
      filters[key] = value
    }
  }
  
  return filters
}
