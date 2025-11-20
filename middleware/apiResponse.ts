import { NextRequest, NextResponse } from 'next/server'
import { getRequestId } from './requestId'

/**
 * Standardized API Response Formats
 * Ensures consistent response structure across all endpoints
 */

export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
  details?: any
  requestId?: string
  timestamp: string
}

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  requestId?: string
  timestamp: string
}

export interface ApiPaginatedResponse<T = any> {
  success: true
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  requestId?: string
  timestamp: string
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  request?: NextRequest,
  details?: any
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  }

  if (request) {
    response.requestId = getRequestId(request)
  }

  return NextResponse.json(response, { status })
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  request?: NextRequest,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }

  if (request) {
    response.requestId = getRequestId(request)
  }

  return NextResponse.json(response, { status })
}

/**
 * Create standardized paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  },
  status: number = 200,
  request?: NextRequest
): NextResponse<ApiPaginatedResponse<T>> {
  const response: ApiPaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString()
  }

  if (request) {
    response.requestId = getRequestId(request)
  }

  return NextResponse.json(response, { status })
}

/**
 * Common error responses
 */
export const CommonErrors = {
  unauthorized: (request?: NextRequest) =>
    createErrorResponse('Unauthorized', 401, request),
  
  forbidden: (request?: NextRequest) =>
    createErrorResponse('Forbidden - insufficient permissions', 403, request),
  
  notFound: (resource: string, request?: NextRequest) =>
    createErrorResponse(`${resource} not found`, 404, request),
  
  badRequest: (message: string, request?: NextRequest, details?: any) =>
    createErrorResponse(message, 400, request, details),
  
  serverError: (request?: NextRequest, details?: any) =>
    createErrorResponse('Internal server error', 500, request, details),
  
  validationError: (details: any, request?: NextRequest) =>
    createErrorResponse('Validation failed', 400, request, details),
  
  rateLimitExceeded: (request?: NextRequest) =>
    createErrorResponse('Rate limit exceeded', 429, request),
  
  conflict: (message: string, request?: NextRequest) =>
    createErrorResponse(message, 409, request)
}
