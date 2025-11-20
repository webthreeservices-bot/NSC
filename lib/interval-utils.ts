/**
 * Centralized utilities for managing intervals and timeouts
 * Ensures proper cleanup and prevents memory leaks
 */

/**
 * Create a safe interval that can be easily cleaned up
 * Returns a cleanup function
 */
export function createInterval(callback: () => void, ms: number): () => void {
  const intervalId = setInterval(callback, ms)
  return () => clearInterval(intervalId)
}

/**
 * Create a safe timeout that can be easily cleaned up
 * Returns a cleanup function
 */
export function createTimeout(callback: () => void, ms: number): () => void {
  const timeoutId = setTimeout(callback, ms)
  return () => clearTimeout(timeoutId)
}

/**
 * Create an abortable fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - server took too long to respond')
    }
    throw error
  }
}

/**
 * Debounce function to limit how often a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, waitMs)
  }
}

/**
 * Throttle function to ensure a function is called at most once in a specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRun = 0
  let timeoutId: NodeJS.Timeout | null = null
  
  return function (...args: Parameters<T>) {
    const now = Date.now()
    
    if (now - lastRun >= limitMs) {
      func(...args)
      lastRun = now
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        func(...args)
        lastRun = Date.now()
        timeoutId = null
      }, limitMs - (now - lastRun))
    }
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (i < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }
  
  throw lastError
}
