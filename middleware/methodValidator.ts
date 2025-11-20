import { NextRequest, NextResponse } from 'next/server'

/**
 * HTTP Method Validation Middleware
 * Validates that only allowed methods are used
 */

export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  const method = request.method

  if (!allowedMethods.includes(method)) {
    return NextResponse.json(
      {
        error: 'Method not allowed',
        allowedMethods
      },
      {
        status: 405,
        headers: {
          'Allow': allowedMethods.join(', ')
        }
      }
    )
  }

  return null
}

/**
 * Create method validator for route handlers
 */
export function createMethodValidator(...allowedMethods: string[]) {
  return (request: NextRequest) => validateMethod(request, allowedMethods)
}

// Pre-configured validators
export const allowGetPost = createMethodValidator('GET', 'POST')
export const allowPost = createMethodValidator('POST')
export const allowGet = createMethodValidator('GET')
export const allowPut = createMethodValidator('PUT')
export const allowDelete = createMethodValidator('DELETE')
