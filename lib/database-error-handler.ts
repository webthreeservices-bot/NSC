import { dbLogger } from '../config/logging'

export class DatabaseError extends Error {
  code?: string
  query?: string
  params?: any[]
  details?: string

  constructor(message: string, options: {
    code?: string,
    query?: string,
    params?: any[],
    details?: string
  } = {}) {
    super(message)
    this.name = 'DatabaseError'
    Object.assign(this, options)
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, options = {}) {
    super(message, options)
    this.name = 'ConnectionError'
  }
}

export class QueryError extends DatabaseError {
  constructor(message: string, options = {}) {
    super(message, options)
    this.name = 'QueryError'
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, options = {}) {
    super(message, options)
    this.name = 'ValidationError'
  }
}

export function handleDatabaseError(error: any): never {
  // PostgreSQL error codes
  const errorCodeMap: { [key: string]: typeof DatabaseError } = {
    '08000': ConnectionError, // connection_exception
    '08003': ConnectionError, // connection_does_not_exist
    '08006': ConnectionError, // connection_failure
    '08001': ConnectionError, // sqlclient_unable_to_establish_sqlconnection
    '08004': ConnectionError, // sqlserver_rejected_establishment_of_sqlconnection
    '23505': ValidationError, // unique_violation
    '23503': ValidationError, // foreign_key_violation
    '23502': ValidationError, // not_null_violation
    '22P02': ValidationError  // invalid_text_representation
  }

  let ErrorClass = DatabaseError
  let message = 'Database error occurred'
  const options: any = {}

  if (error instanceof Error) {
    message = error.message
    if ('code' in error) {
      options.code = (error as any).code
      ErrorClass = errorCodeMap[options.code] || DatabaseError
    }
    if ('query' in error) {
      options.query = (error as any).query
    }
    if ('parameters' in error) {
      options.params = (error as any).parameters
    }
  }

  // Log the error with appropriate level
  const errorInstance = new ErrorClass(message, options)
  
  if (errorInstance instanceof ConnectionError) {
    dbLogger.error('Database connection error', {
      error: errorInstance,
      stack: error.stack
    })
  } else if (errorInstance instanceof ValidationError) {
    dbLogger.warn('Database validation error', {
      error: errorInstance
    })
  } else {
    dbLogger.error('Database query error', {
      error: errorInstance,
      stack: error.stack
    })
  }

  throw errorInstance
}

export function isRetryableError(error: any): boolean {
  if (!(error instanceof Error)) return false

  const retryableCodes = [
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '40001', // serialization_failure
    '40P01', // deadlock_detected
    '55P03', // lock_not_available
    'XX000'  // internal_error
  ]

  return 'code' in error && retryableCodes.includes((error as any).code)
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error
      }

      const delay = delayMs * Math.pow(2, attempt - 1) // Exponential backoff
      dbLogger.warn('Retrying database operation', {
        attempt,
        maxRetries,
        delay,
        error: lastError.message
      })

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}