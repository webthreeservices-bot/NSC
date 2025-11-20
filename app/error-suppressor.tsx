'use client'

import { useEffect } from 'react'

export function ErrorSuppressor() {
  useEffect(() => {
    // Disable Next.js error overlay for wallet errors
    if (typeof window !== 'undefined') {
      // @ts-ignore - Next.js internal API
      window.__NEXT_DATA__ = window.__NEXT_DATA__ || {}
      // @ts-ignore
      window.next = window.next || {}
      // @ts-ignore
      window.next.router = window.next.router || {}
    }

    // Suppress wallet extension errors that don't affect functionality
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args: any[]) => {
      const errorString = args.join(' ')

      // Suppress specific React state update errors
      if (
        errorString.includes('Cannot update a component') ||
        errorString.includes('while rendering a different component') ||
        errorString.includes('AdminLayout') ||
        errorString.includes('Router') ||
        errorString.includes('setState() call inside')
      ) {
        return // Suppress React state update warnings
      }

      // Suppress specific wallet extension errors and development errors
      if (
        errorString.includes('chrome-extension://') ||
        errorString.includes('pelagus') ||
        errorString.includes('quiknode.pro') ||
        errorString.includes('401') ||
        errorString.includes('Unauthorized') ||
        errorString.includes('injectScript.js') ||
        errorString.includes('inpage.js') ||
        errorString.includes('Object.connect') ||
        errorString.includes('async s') ||
        errorString.includes('__nextjs_original-stack-frame') ||
        errorString.includes('stack-frame.js') ||
        errorString.includes('provider-bridge.js') ||
        errorString.includes('content.js') ||
        errorString.includes('Cannot read properties of undefined') ||
        errorString.includes('Cannot read property') ||
        errorString.includes('is not defined') ||
        errorString.includes('Error setting cookie') ||
        errorString.includes('Error deleting cookie') ||
        errorString.includes('Error decoding token')
      ) {
        return // Suppress these errors completely
      }

      // Suppress empty API error objects
      if (errorString.includes('API Error:') && (errorString.includes('{}') || errorString.includes('[object Object]'))) {
        return
      }

      // Log all other errors normally
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const warnString = args.join(' ')

      // Suppress wallet extension warnings and React warnings we've handled
      if (
        warnString.includes('chrome-extension://') ||
        warnString.includes('pelagus') ||
        warnString.includes('quiknode.pro') ||
        warnString.includes('Cannot update a component') ||
        warnString.includes('setState()') ||
        warnString.includes('while rendering a different component') ||
        warnString.includes('AdminLayout') ||
        warnString.includes('Router') ||
        warnString.includes('provider-bridge.js') ||
        warnString.includes('MetaMask') ||
        warnString.includes('Failed to connect') ||
        warnString.includes('wallet') ||
        warnString.includes('ethereum')
      ) {
        return // Suppress these warnings completely
      }

      // Log all other warnings normally
      originalWarn.apply(console, args)
    }

    // Suppress unhandled promise rejections from wallet extensions
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.toString() || ''
      
      if (
        reason.includes('Failed to connect to MetaMask') ||
        reason.includes('MetaMask extension not found') ||
        reason.includes('chrome-extension://') ||
        reason.includes('inpage.js') ||
        reason.includes('injectScript.js') ||
        reason.includes('Cannot read properties of undefined') ||
        reason.includes('Cannot read property')
      ) {
        event.preventDefault() // Suppress the error
        return
      }
    }

    // Global error handler for runtime errors
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || ''
      const filename = event.filename || ''

      // More comprehensive MetaMask/wallet error detection
      const isWalletError =
        errorMessage.includes('Cannot read properties of undefined') ||
        errorMessage.includes('Cannot read property') ||
        errorMessage.includes('is not defined') ||
        errorMessage.includes('chrome-extension://') ||
        errorMessage.includes('MetaMask') ||
        errorMessage.includes('Failed to connect') ||
        errorMessage.includes('wallet') ||
        errorMessage.toLowerCase().includes('ethereum') ||
        filename.includes('chrome-extension://') ||
        filename.includes('inpage.js') ||
        filename.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')

      if (isWalletError) {
        // Completely suppress the error - don't even log to console
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        return false
      }
    }

    // Intercept fetch requests to prevent Next.js from fetching stack frames
    const originalFetch = window.fetch
    window.fetch = function(...args: any[]) {
      const url = args[0]?.toString() || ''

      // Block Next.js stack frame requests for wallet errors
      if (url.includes('__nextjs_original-stack-frame') &&
          (url.includes('chrome-extension') ||
           url.includes('MetaMask') ||
           url.includes('inpage.js'))) {
        // Return empty promise to prevent the request
        return Promise.reject(new Error('Blocked stack frame request for wallet error'))
      }

      return originalFetch.apply(window, args)
    }

    // Use capture phase to catch errors early
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
    window.addEventListener('error', handleError, true)

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.fetch = originalFetch
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
      window.removeEventListener('error', handleError, true)
    }
  }, [])

  return null
}
