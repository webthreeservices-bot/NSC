import { NextRequest, NextResponse } from 'next/server'

export interface APIError extends Error {
  statusCode?: number
  code?: string
}

export class AppError extends Error implements APIError {
  statusCode: number
  code?: string

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

// Error logging function
export function logError(error: Error, context?: any) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
    context
  }

  if (process.env.NODE_ENV === 'production') {
    // In production, you might want to send to external logging service
    console.error('ERROR:', JSON.stringify(errorInfo, null, 2))
  } else {
    // Development logging
    console.error('🚨 ERROR:', error.message)
    console.error('📍 Context:', context)
    console.error('📚 Stack:', error.stack)
  }
}

// Handle database errors
export function handleDatabaseError(error: any): AppError {
  // PostgreSQL error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (error.code) {
    switch (error.code) {
      // Unique violation
      case '23505':
        const match = error.detail?.match(/Key \((.+?)\)=\((.+?)\)/) || []
        const fieldName = match[1] || 'field'
        return new ConflictError(`${fieldName} already exists`)
      
      // Foreign key violation
      case '23503':
        return new ValidationError('Invalid reference to related record')
      
      // Not null violation
      case '23502':
        const column = error.column || 'field'
        return new ValidationError(`${column} cannot be null`)
      
      // Check constraint violation
      case '23514':
        return new ValidationError('Check constraint failed: ' + (error.constraint || ''))
      
      // Connection errors
      case '08000':
      case '08003':
      case '08006':
      case '08001':
      case '08004':
        logError(error)
        return new AppError('Database connection failed', 500, 'DATABASE_CONNECTION_ERROR')
      
      // General database errors
      default:
        logError(error)
        return new AppError('Database operation failed', 500, 'DATABASE_ERROR')
    }
  }
  
  // Handle connection timeout or network issues
  if (error.message && (
      error.message.includes('connect ETIMEDOUT') ||
      error.message.includes('connection refused') ||
      error.message.includes('network timeout')
    )) {
    logError(error)
    return new AppError('Database connection failed', 500, 'DATABASE_CONNECTION_ERROR')
  }

  // Not a known database error, return as-is or wrap
  if (error instanceof AppError) {
    return error
  }

  logError(error)
  return new AppError('An unexpected error occurred', 500, 'UNKNOWN_ERROR')
}

// Main error handler for API routes
export function handleAPIError(error: any, req?: NextRequest): NextResponse {
  let appError: AppError

  if (error instanceof AppError) {
    appError = error
  } else {
    appError = handleDatabaseError(error)
  }

  // Log the error with context
  logError(appError, {
    url: req?.url,
    method: req?.method,
    userAgent: req?.headers.get('user-agent'),
    userId: req?.headers.get('x-user-id')
  })

  // Prepare response
  const response = {
    error: true,
    message: appError.message,
    code: appError.code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: appError.stack
    })
  }

  return NextResponse.json(response, { 
    status: appError.statusCode || 500,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// Async wrapper for API route handlers
export function asyncHandler(handler: Function) {
  return async function(req: NextRequest, context?: any) {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleAPIError(error, req)
    }
  }
}

// Validation helper
export function validateRequired(data: any, fields: string[]): void {
  const missing = fields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })

  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`)
  }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  
  return { valid: true }
}

// Amount validation
export function validateAmount(amount: number, min: number = 0, max?: number): void {
  if (amount < min) {
    throw new ValidationError(`Amount must be at least ${min}`)
  }
  
  if (max && amount > max) {
    throw new ValidationError(`Amount must not exceed ${max}`)
  }
  
  if (!Number.isFinite(amount)) {
    throw new ValidationError('Amount must be a valid number')
  }
}
