'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AdminPage() {
  const router = useRouter()
  const { user, initializing } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Prevent redirect if already redirecting or still initializing
    if (isRedirecting || initializing) return

    let isMounted = true

    const performRedirect = () => {
      if (!isMounted) return

      setIsRedirecting(true)

      if (user?.isAdmin) {
        // User is authenticated as admin, redirect to dashboard
        router.replace('/admin/dashboard')
      } else {
        // User is not authenticated or not admin, redirect to login
        router.replace('/admin/login')
      }
    }

    performRedirect()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [user, initializing, router, isRedirecting])

  // Show loading while determining redirect
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff00] mx-auto mb-4"></div>
        <p>Redirecting to admin panel...</p>
      </div>
    </div>
  )
}