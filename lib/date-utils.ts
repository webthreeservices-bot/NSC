/**
 * Centralized date utility functions for consistent date handling across the app
 */

/**
 * Safely convert any date value to ISO string
 * Handles Date objects, strings, and invalid values
 */
export function toISOString(date: any): string | null {
  if (!date) return null
  
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date.toISOString()
  }
  
  if (typeof date === 'string' || typeof date === 'number') {
    const parsed = new Date(date)
    return isNaN(parsed.getTime()) ? null : parsed.toISOString()
  }
  
  return null
}

/**
 * Format date for display in local timezone
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @param fallback - What to show if date is invalid (default: 'N/A')
 */
export function formatDate(
  date: any,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = 'N/A'
): string {
  if (!date) return fallback

  try {
    let dateObj: Date

    // Handle various input formats
    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'string') {
      // Handle ISO strings and other string formats
      dateObj = new Date(date)
    } else if (typeof date === 'number') {
      // Handle timestamps
      dateObj = new Date(date)
    } else if (typeof date === 'object' && date !== null) {
      // Handle serialized dates from API
      if (typeof date.toISOString === 'function') {
        dateObj = date
      } else {
        // Try to extract date from object
        dateObj = new Date(String(date))
      }
    } else {
      return fallback
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) return fallback

    // Check if date is epoch (Jan 1, 1970) or before - likely invalid
    if (dateObj.getTime() < 86400000) { // Less than 1 day after epoch
      return fallback
    }

    // Use proper localization
    return new Intl.DateTimeFormat('en-US', options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Use UTC to prevent timezone issues
    }).format(dateObj)
  } catch (error) {
    console.warn('Date formatting error:', error, 'Input:', date)
    return fallback
  }
}

/**
 * Format date with time
 */
export function formatDateTime(date: any, fallback: string = 'N/A'): string {
  if (!date) return fallback

  try {
    let dateObj: Date

    // Handle various input formats
    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else if (typeof date === 'object' && date !== null) {
      if (typeof date.toISOString === 'function') {
        dateObj = date
      } else {
        dateObj = new Date(String(date))
      }
    } else {
      return fallback
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) return fallback

    // Check if date is epoch (Jan 1, 1970) or before - likely invalid
    if (dateObj.getTime() < 86400000) { // Less than 1 day after epoch
      return fallback
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC' // Use UTC to prevent timezone issues
    }).format(dateObj)
  } catch (error) {
    console.warn('DateTime formatting error:', error, 'Input:', date)
    return fallback
  }
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: any): string {
  if (!date) return 'N/A'
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return formatDate(dateObj)
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: any): boolean {
  if (!date) return false
  const dateObj = date instanceof Date ? date : new Date(date)
  return !isNaN(dateObj.getTime())
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Check if date is in the past
 */
export function isPast(date: any): boolean {
  if (!isValidDate(date)) return false
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.getTime() < new Date().getTime()
}

/**
 * Check if date is in the future
 */
export function isFuture(date: any): boolean {
  if (!isValidDate(date)) return false
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.getTime() > new Date().getTime()
}
