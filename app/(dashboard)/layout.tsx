'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useAuth } from '@/hooks/useAuth'
import { getTokenFromStorage, getUserFromToken } from '@/lib/auth'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, setUser, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = getTokenFromStorage()

        if (!token) {
          setIsLoading(false)
          return
        }

        // First try client-side validation (faster)
        const userFromToken = getUserFromToken()

        if (userFromToken) {
          // Server-side validation for security
          try {
            const response = await fetch('/api/auth/validate', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })

            if (response.ok) {
              const data = await response.json()
              if (data.valid) {
                // Set user in store if not already set
                if (!user) {
                  setUser(userFromToken)
                }
                setIsValidToken(true)
                setIsLoading(false)
                return
              }
            }
          } catch (serverError) {
            // Fall back to client-side validation if server is unavailable
            if (!user) {
              setUser(userFromToken)
            }
            setIsValidToken(true)
            setIsLoading(false)
            return
          }
        }

        // Token is invalid, clear it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
        }
        setIsLoading(false)

      } catch (error) {
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
        }
        setIsLoading(false)
      }
    }

    validateToken()
  }, [user, setUser])

  // Show loading while validating token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-[#00ff00] mx-auto"></div>
          <p className="mt-4 text-gray-400">Validating session...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isValidToken || !isAuthenticated) {
    router.push('/login')
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-[#00ff00] mx-auto"></div>
          <p className="mt-4 text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <DashboardLayout user={user}>
        {children}
      </DashboardLayout>
    </ErrorBoundary>
  )
}
