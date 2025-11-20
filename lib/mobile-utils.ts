/**
 * Mobile utility functions for better mobile experience
 */

/**
 * Detect if user is on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Detect if user is on slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false
  }
  
  const connection = (navigator as any).connection
  
  if (!connection) return false
  
  // Check effective type (slow-2g, 2g, 3g, 4g)
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return true
  }
  
  // Check if saveData is enabled (user opted for reduced data usage)
  if (connection.saveData) {
    return true
  }
  
  return false
}

/**
 * Get recommended timeout based on connection
 */
export function getRecommendedTimeout(): number {
  if (isSlowConnection()) {
    return 60000 // 60 seconds for slow connections
  }
  
  if (isMobileDevice()) {
    return 30000 // 30 seconds for mobile
  }
  
  return 15000 // 15 seconds for desktop
}

/**
 * Add retry logic for fetch requests on mobile
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 2
): Promise<Response> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = getRecommendedTimeout()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      lastError = error
      
      // Check if it's a network error worth retrying
      const shouldRetry =
        error.name === 'AbortError' ||
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout')
      
      if (shouldRetry && attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      throw error
    }
  }
  
  throw lastError
}

/**
 * Show user-friendly error message based on error type
 */
export function getMobileFriendlyErrorMessage(error: any): string {
  if (!error) return 'An error occurred. Please try again.'
  
  const message = error.message || error.error || String(error)
  
  // Network errors
  if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
    return 'Connection timeout. Please check your internet and try again.'
  }
  
  if (message.includes('network') || message.includes('fetch failed')) {
    return 'Network error. Please check your connection and try again.'
  }
  
  if (message.includes('ECONNREFUSED') || message.includes('connect')) {
    return 'Cannot connect to server. Please try again later.'
  }
  
  // Database errors
  if (message.includes('database') || message.includes('Database')) {
    return 'Service temporarily unavailable. Please try again in a moment.'
  }
  
  // Auth errors
  if (message.includes('Invalid email or password')) {
    return 'Invalid email or password'
  }
  
  if (message.includes('blocked')) {
    return 'Your account has been blocked. Please contact support.'
  }
  
  if (message.includes('2FA')) {
    return message // Keep 2FA messages as-is
  }
  
  // Rate limiting
  if (message.includes('Too many')) {
    return message // Keep rate limit messages as-is
  }
  
  // Default
  return message || 'An error occurred. Please try again.'
}
