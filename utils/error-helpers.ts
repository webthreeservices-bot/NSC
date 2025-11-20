/**
 * Extract a user-friendly error message from various error formats
 */
export function extractErrorMessage(err: any, defaultMessage: string = 'An error occurred'): string {
  // Handle null/undefined
  if (!err) {
    return defaultMessage
  }

  // Handle Error instances
  if (err instanceof Error) {
    return err.message || defaultMessage
  }

  // Handle response objects from API errors
  if (err.response?.data) {
    const data = err.response.data
    if (typeof data === 'string') {
      return data
    }
    if (data.error && typeof data.error === 'string') {
      return data.error
    }
    if (data.message && typeof data.message === 'string') {
      return data.message
    }
  }

  // Handle direct error property
  if (err.error) {
    if (typeof err.error === 'string') {
      return err.error
    }
    if (err.error.message && typeof err.error.message === 'string') {
      return err.error.message
    }
  }

  // Handle direct message property
  if (err.message && typeof err.message === 'string') {
    return err.message
  }

  // Handle string errors
  if (typeof err === 'string') {
    return err
  }

  // Handle objects we couldn't parse
  if (typeof err === 'object') {
    try {
      // Try to extract any string value
      const keys = Object.keys(err)
      for (const key of keys) {
        if (typeof err[key] === 'string' && err[key].length > 0) {
          return err[key]
        }
      }
      
      // If no string found, stringify the object (last resort)
      const stringified = JSON.stringify(err)
      if (stringified !== '{}' && stringified !== '[object Object]') {
        return stringified
      }
    } catch (e) {
      console.error('Error while extracting error message:', e)
    }
  }

  // Fallback to default message
  return defaultMessage
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(err: any): Record<string, any> {
  return {
    type: typeof err,
    constructor: err?.constructor?.name,
    message: err?.message,
    error: err?.error,
    response: err?.response?.data,
    status: err?.status || err?.response?.status,
    stack: err?.stack,
    raw: err
  }
}

/**
 * Check if error is a specific type
 */
export function isNetworkError(err: any): boolean {
  const message = extractErrorMessage(err, '').toLowerCase()
  return message.includes('network') || 
         message.includes('fetch') || 
         message.includes('connection') ||
         message.includes('timeout') ||
         err?.name === 'NetworkError' ||
         err?.code === 'NETWORK_ERROR'
}

export function isAuthError(err: any): boolean {
  const status = err?.status || err?.response?.status
  return status === 401 || status === 403
}

export function isValidationError(err: any): boolean {
  const status = err?.status || err?.response?.status
  return status === 400 || status === 422
}
