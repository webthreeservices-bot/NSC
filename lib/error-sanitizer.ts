/**
 * Error Sanitization Utility
 * Prevents sensitive information leakage in production error responses
 */

export interface SanitizedError {
  message: string
  code?: string
  statusCode: number
}

/**
 * Sanitize error for client response
 * In production, hides stack traces and internal details
 */
export function sanitizeError(error: any, isProduction: boolean = process.env.NODE_ENV === 'production'): SanitizedError {
  // Default sanitized error
  const sanitized: SanitizedError = {
    message: 'An error occurred',
    statusCode: 500
  }

  // Known error patterns and their safe messages
  const errorPatterns = [
    {
      pattern: /unique constraint|duplicate key/i,
      message: 'This record already exists',
      code: 'DUPLICATE_ENTRY',
      statusCode: 409
    },
    {
      pattern: /not found|does not exist/i,
      message: 'Resource not found',
      code: 'NOT_FOUND',
      statusCode: 404
    },
    {
      pattern: /unauthorized|authentication failed/i,
      message: 'Authentication required',
      code: 'UNAUTHORIZED',
      statusCode: 401
    },
    {
      pattern: /forbidden|permission denied/i,
      message: 'You do not have permission to perform this action',
      code: 'FORBIDDEN',
      statusCode: 403
    },
    {
      pattern: /invalid.*format|validation failed/i,
      message: 'Invalid input format',
      code: 'VALIDATION_ERROR',
      statusCode: 400
    },
    {
      pattern: /timeout|timed out/i,
      message: 'Request timed out. Please try again.',
      code: 'TIMEOUT',
      statusCode: 504
    },
    {
      pattern: /connection.*refused|ECONNREFUSED/i,
      message: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
      statusCode: 503
    },
    {
      pattern: /too many requests|rate limit/i,
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429
    }
  ]

  // If error is a string
  if (typeof error === 'string') {
    if (isProduction) {
      // Check for known patterns
      for (const { pattern, message, code, statusCode } of errorPatterns) {
        if (pattern.test(error)) {
          return { message, code, statusCode }
        }
      }
      return sanitized
    }
    return { message: error, statusCode: 500 }
  }

  // If error is an Error object
  if (error instanceof Error) {
    const errorMessage = error.message || ''

    // Check for known patterns
    for (const { pattern, message, code, statusCode } of errorPatterns) {
      if (pattern.test(errorMessage)) {
        return { message, code, statusCode }
      }
    }

    // In development, return full error message
    if (!isProduction) {
      return {
        message: errorMessage,
        code: error.name,
        statusCode: 500
      }
    }

    // In production, return generic message
    return sanitized
  }

  // If error has a custom message property
  if (error?.message) {
    const errorMessage = String(error.message)

    for (const { pattern, message, code, statusCode } of errorPatterns) {
      if (pattern.test(errorMessage)) {
        return { message, code, statusCode }
      }
    }

    if (!isProduction) {
      return {
        message: errorMessage,
        code: error.code || error.name,
        statusCode: error.statusCode || 500
      }
    }
  }

  return sanitized
}

/**
 * Log error with full details (internal use only)
 */
export function logError(error: any, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString()
  const errorDetails = {
    timestamp,
    message: error?.message || String(error),
    stack: error?.stack,
    code: error?.code || error?.name,
    context
  }

  // In production, send to logging service (e.g., CloudWatch, Datadog)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with production logging service
    console.error('[ERROR]', JSON.stringify(errorDetails))
  } else {
    // In development, log full error to console
    console.error('[ERROR]', errorDetails)
  }
}

/**
 * Create sanitized error response
 */
export function createErrorResponse(
  error: any,
  context?: Record<string, any>
): { message: string; code?: string; statusCode: number } {
  // Log full error internally
  logError(error, context)

  // Return sanitized error for client
  return sanitizeError(error)
}

/**
 * Blacklist of sensitive keywords that should never appear in error messages
 */
const SENSITIVE_KEYWORDS = [
  'password',
  'secret',
  'token',
  'api_key',
  'private_key',
  'connection string',
  'database',
  'pg:',
  'postgres:',
  'mysql:',
  'mongodb:',
  'AWS_',
  'NODE_ENV'
]

/**
 * Check if error message contains sensitive information
 */
export function containsSensitiveInfo(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return SENSITIVE_KEYWORDS.some(keyword => lowerMessage.includes(keyword.toLowerCase()))
}

/**
 * Redact sensitive information from error message
 */
export function redactSensitiveInfo(message: string): string {
  let redacted = message

  // Redact connection strings
  redacted = redacted.replace(/postgresql:\/\/[^\s]+/gi, '[REDACTED_CONNECTION_STRING]')
  redacted = redacted.replace(/mysql:\/\/[^\s]+/gi, '[REDACTED_CONNECTION_STRING]')
  redacted = redacted.replace(/mongodb:\/\/[^\s]+/gi, '[REDACTED_CONNECTION_STRING]')

  // Redact tokens and secrets
  redacted = redacted.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
  redacted = redacted.replace(/token["\s:=]+[^\s"]+/gi, 'token: [REDACTED]')
  redacted = redacted.replace(/secret["\s:=]+[^\s"]+/gi, 'secret: [REDACTED]')
  redacted = redacted.replace(/password["\s:=]+[^\s"]+/gi, 'password: [REDACTED]')

  // Redact API keys
  redacted = redacted.replace(/[A-Za-z0-9_-]{32,}/g, (match) => {
    // Only redact if it looks like an API key (long alphanumeric string)
    if (match.length >= 32 && /^[A-Za-z0-9_-]+$/.test(match)) {
      return '[REDACTED_KEY]'
    }
    return match
  })

  return redacted
}
