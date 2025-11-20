import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

/**
 * Request ID Middleware
 * Adds unique request ID to every request for tracking and debugging
 */

export function addRequestId(request: NextRequest, response: NextResponse): NextResponse {
  const requestId = request.headers.get('x-request-id') || uuidv4()
  
  // Add request ID to response headers
  response.headers.set('x-request-id', requestId)
  
  return response
}

/**
 * Get or generate request ID from request
 */
export function getRequestId(request: NextRequest): string {
  return request.headers.get('x-request-id') || uuidv4()
}

/**
 * Create response with request ID
 */
export function createResponseWithRequestId(
  data: any,
  status: number,
  request: NextRequest
): NextResponse {
  const requestId = getRequestId(request)
  
  const response = NextResponse.json(
    {
      ...data,
      requestId
    },
    { status }
  )
  
  response.headers.set('x-request-id', requestId)
  return response
}
