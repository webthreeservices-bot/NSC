/**
 * Client-safe helper functions
 * These can be used in both client and server components
 */

import QRCode from 'qrcode'

/**
 * Generate QR code for wallet address
 */
export async function generateQRCode(address: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(address)
    return qrCode
  } catch (error) {
    console.error('QR Code generation error:', error)
    return ''
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format date
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDate:', date)
      return 'N/A'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  } catch (error) {
    console.error('Date formatting error:', error, 'Date value:', date)
    return 'N/A'
  }
}

/**
 * Truncate address
 */
export function truncateAddress(address: string, chars: number = 6): string {
  if (!address) return ''
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
}

/**
 * Calculate ROI amount
 */
export function calculateRoi(amount: number, percentage: number): number {
  return (amount * percentage) / 100
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8
}
