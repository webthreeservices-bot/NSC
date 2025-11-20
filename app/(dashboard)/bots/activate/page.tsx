'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const ActivateBotPageContent = dynamic(() => import('./ActivateBotPageContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
    </div>
  )
})

// Wrap the page with ErrorBoundary to catch any uncaught errors
export default function ActivateBotPage() {
  return (
    <ErrorBoundary fallbackMessage="Failed to load bot activation page. This might be due to wallet connection issues. Please refresh the page or try using QR Code payment.">
      <ActivateBotPageContent />
    </ErrorBoundary>
  )
}
