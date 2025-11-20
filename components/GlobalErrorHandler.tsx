'use client'

import { useEffect } from 'react'
import { setupGlobalErrorHandlers } from '@/lib/client-error-handler'

/**
 * Global Error Handler Component
 * Initializes global error handlers on mount
 * Should be included in the root layout
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Set up global error handlers
    setupGlobalErrorHandlers()
  }, [])

  // This component doesn't render anything
  return null
}
