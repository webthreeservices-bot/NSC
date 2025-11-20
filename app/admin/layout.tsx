'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  // Wait for Zustand store to hydrate
  useEffect(() => {
    setHydrated(true)
  }, [])

  // Pages that don't require authentication
  const publicAdminPages = ['/admin/login']
  const isPublicPage = publicAdminPages.includes(pathname)

  useEffect(() => {
    // Don't run auth check until store is hydrated
    if (!hydrated) return

    let isMounted = true

    const checkAdminAccess = async () => {
      if (!isMounted) return

      setIsLoading(true)

      // If it's a public admin page (like login), don't check authentication
      if (isPublicPage) {
        if (isMounted) {
          setIsAuthorized(true)
          setIsLoading(false)
        }
        return
      }

      // Check for token in localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      if (!token) {
        console.log('No token found, redirecting to admin login')
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('adminRedirectAfterLogin', pathname)
        }
        router.push('/admin/login')
        return
      }

      // Validate token with API
      try {
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (!isMounted) return

        if (response.ok) {
          const data = await response.json()

          if (data.valid && data.user?.isAdmin) {
            console.log('Admin access verified for user:', data.user.email)
            if (isMounted) {
              setIsAuthorized(true)
              setIsLoading(false)
            }
            return
          }
        }

        // Token invalid or not admin
        console.log('Token invalid or user not admin, redirecting to admin login')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          sessionStorage.setItem('adminRedirectAfterLogin', pathname)
        }
        router.push('/admin/login')
      } catch (error) {
        console.error('Admin auth check error:', error)
        if (isMounted) {
          router.push('/admin/login')
        }
      }
    }

    checkAdminAccess()

    return () => {
      isMounted = false
    }
  }, [hydrated, router, isPublicPage, pathname])

  // Show loading state with better debugging
  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 mb-2">Verifying admin access...</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-600 space-y-1">
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User: {user?.email || 'None'}</p>
              <p>Is Admin: {user?.isAdmin ? 'Yes' : 'No'}</p>
              {!isAuthenticated && (
                <button 
                  onClick={() => router.push('/admin/login')} 
                  className="mt-2 text-red-400 underline text-xs"
                >
                  Go to Admin Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  )
}