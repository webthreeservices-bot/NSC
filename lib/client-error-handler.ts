/**
 * Client-Side Global Error Handler
 * Sets up handlers for unhandled errors and promise rejections on the client
 */

/**
 * Handle unhandled promise rejections
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') {
    return // Server-side, no need to setup
  }

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)

    // Check if it's a MetaMask error
    if (event.reason?.message?.includes('MetaMask') || event.reason?.message?.includes('connect')) {
      console.warn('MetaMask error caught globally:', event.reason.message)
      // Prevent the error from crashing the app
      event.preventDefault()

      // Show a user-friendly message
      const message = 'A wallet connection error occurred. Please refresh the page or try using QR Code payment.'

      // Try to display a toast if available
      try {
        const customEvent = new CustomEvent('global-error', {
          detail: { message, type: 'wallet' }
        })
        window.dispatchEvent(customEvent)
      } catch (err) {
        console.error('Failed to dispatch global error event:', err)
      }

      return
    }

    // Check if it's a network error
    if (
      event.reason?.message?.includes('fetch') ||
      event.reason?.message?.includes('network') ||
      event.reason?.code === 'ERR_NETWORK'
    ) {
      console.warn('Network error caught globally:', event.reason.message)
      event.preventDefault()
      return
    }

    // For other errors, let them be handled normally but log them
    // Don't prevent default for non-wallet errors to maintain normal error flow
  })

  // Handle global errors (including from extensions)
  window.addEventListener('error', (event) => {
    // Check if it's from MetaMask extension or contains MetaMask errors
    const isMetaMaskError =
      event.filename?.includes('chrome-extension') ||
      event.filename?.includes('inpage.js') ||
      event.message?.includes('MetaMask') ||
      event.message?.includes('Failed to connect to MetaMask') ||
      event.message?.toLowerCase().includes('wallet') ||
      event.message?.toLowerCase().includes('ethereum')

    if (isMetaMaskError) {
      console.warn('🛑 MetaMask/Wallet extension error intercepted:', event.message)

      // Prevent the error from showing to user
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      // Log for debugging but don't crash
      console.debug('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })

      // Don't even show a toast - just silently handle it
      // User can use QR code payment if wallet doesn't work

      return false // Prevent default error handling
    }
  }, true) // Use capture phase to intercept earlier

  // Additional safeguard: Handle errors from specific extension sources
  const originalConsoleError = console.error
  console.error = function(...args: any[]) {
    // Suppress MetaMask-related console errors
    const errorString = args.join(' ')
    if (
      errorString.includes('chrome-extension') ||
      errorString.includes('Failed to connect to MetaMask') ||
      errorString.includes('inpage.js')
    ) {
      console.debug('🔕 Suppressed MetaMask extension error:', ...args)
      return
    }
    // Call original console.error for non-wallet errors
    originalConsoleError.apply(console, args)
  }

  console.log('🛡️ Global error handlers initialized')
}

/**
 * Clean up global error handlers
 */
export function cleanupGlobalErrorHandlers() {
  if (typeof window === 'undefined') {
    return
  }

  // Remove event listeners if needed
  // Note: We don't remove them by default as they should persist
  // But this function is here if you need to clean up during unmount
}

/**
 * Manually dispatch an error event
 */
export function dispatchGlobalError(message: string, type: string = 'general') {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const event = new CustomEvent('global-error', {
      detail: { message, type }
    })
    window.dispatchEvent(event)
  } catch (err) {
    console.error('Failed to dispatch global error:', err)
  }
}
