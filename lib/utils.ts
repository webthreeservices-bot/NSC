import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined | any): string {
  if (!date) return 'N/A'

  try {
    let dateObj: Date

    // Handle various date formats
    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'string') {
      // Check for empty string
      if (date.trim() === '') return 'N/A'
      dateObj = new Date(date)
    } else if (typeof date === 'number') {
      // Check for 0 or negative numbers (epoch = 1970)
      if (date <= 0) return 'N/A'
      dateObj = new Date(date)
    } else if (typeof date === 'object' && date !== null) {
      // Handle objects that might be serialized dates
      if (typeof date.toISOString === 'function') {
        dateObj = date as Date
      } else if (date.date || date.value) {
        // Handle wrapped date objects
        dateObj = new Date(date.date || date.value)
      } else {
        // Try to convert object to string or use first property
        const firstValue = Object.values(date)[0]
        if (typeof firstValue === 'string' || typeof firstValue === 'number') {
          dateObj = new Date(firstValue as string | number)
        } else {
          dateObj = new Date(String(date))
        }
      }
    } else {
      return 'N/A'
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A'
    }

    // Check if date is epoch (Jan 1, 1970) or before
    if (dateObj.getTime() < 86400000) { // Less than 1 day after epoch
      return 'N/A'
    }

    // Use proper localization with better formatting
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Use UTC to avoid timezone shifts
    }).format(dateObj)
  } catch (error) {
    console.warn('Date formatting error:', error, 'Date value:', date)
    return 'N/A'
  }
}

/**
 * Format date with time for detailed display
 */
export function formatDateTime(date: Date | string | null | undefined | any): string {
  if (!date) return 'N/A'

  try {
    let dateObj: Date

    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'string') {
      if (date.trim() === '') return 'N/A'
      dateObj = new Date(date)
    } else if (typeof date === 'number') {
      if (date <= 0) return 'N/A'
      dateObj = new Date(date)
    } else {
      dateObj = new Date(String(date))
    }

    if (isNaN(dateObj.getTime()) || dateObj.getTime() < 86400000) {
      return 'N/A'
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    }).format(dateObj)
  } catch (error) {
    console.warn('DateTime formatting error:', error)
    return 'N/A'
  }
}

export function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export function daysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Safe localStorage getter that works during SSR
 * Returns null if localStorage is not available (during SSR/build)
 */
export function getFromLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error('Error accessing localStorage:', error)
    return null
  }
}
