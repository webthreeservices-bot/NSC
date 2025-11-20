'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Shield, LogIn, AlertCircle, Crown } from 'lucide-react'

export const dynamic = 'force-dynamic'

function AdminLoginForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  })
  const [requires2FA, setRequires2FA] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Check if already authenticated as admin
  useEffect(() => {
    let isMounted = true

    const checkAdminAuth = async () => {
      try {
        // Check localStorage for token first
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

        if (!token) {
          // No token, show login form
          return
        }

        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (response.ok && isMounted) {
          const data = await response.json()
          if (data.valid && data.user?.isAdmin) {
            // Already authenticated as admin
            console.log('Admin already authenticated, redirecting to dashboard')
            router.push('/admin/dashboard')
          }
        }
      } catch (error) {
        // Not authenticated, continue to login form
        if (isMounted) {
          console.log('Not authenticated, showing login form')
        }
      }
    }

    checkAdminAuth()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          twoFactorCode: formData.twoFactorCode || undefined
        })
      })

      const data = await response.json()
      console.log('Login response:', { status: response.status, data })

      if (response.ok && data.success) {
        // Admin login successful
        console.log('Admin login successful:', data.user)

        // CRITICAL: Store tokens in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token)
          console.log('✅ Token stored in localStorage')
        }
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
          console.log('✅ Refresh token stored in localStorage')
        }

        // Store user data
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
          console.log('✅ User data stored:', data.user.email)
        }

        // Check if there's a stored redirect path
        const redirectPath = typeof window !== 'undefined'
          ? sessionStorage.getItem('adminRedirectAfterLogin')
          : null

        if (redirectPath) {
          sessionStorage.removeItem('adminRedirectAfterLogin')
          console.log('Redirecting to stored path:', redirectPath)
          router.push(redirectPath)
        } else {
          console.log('Redirecting to admin dashboard')
          router.push('/admin/dashboard')
        }
      } else if (data.requires2FA) {
        setRequires2FA(true)
        setLoginError('Please enter your 2FA code')
      } else {
        console.error('Login failed:', data)
        setLoginError(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Admin login error:', error)
      setLoginError('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-black border border-red-800 w-full max-w-md shadow-xl rounded-xl hover:border-red-600/50 transition-all">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Crown className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-400">Admin Access Portal</h2>
            <p className="text-gray-400 text-xs mt-1">Authorized Personnel Only</p>
            <div className="mt-2 px-3 py-1 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-xs text-red-300">⚠️ Admin credentials required</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="block">
                <span className="text-gray-300 text-sm font-medium">Admin Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter admin email"
                  className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-700 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white text-sm placeholder-gray-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="email"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block">
                <span className="text-gray-300 text-sm font-medium">Admin Password</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-700 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white text-sm placeholder-gray-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {requires2FA && (
              <div className="space-y-2">
                <label className="block">
                  <span className="text-gray-300 text-sm font-medium">2FA Code</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-700 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white text-sm placeholder-gray-500"
                    value={formData.twoFactorCode}
                    onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            )}

            {loginError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-300">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-sm font-semibold mt-4 rounded-lg flex items-center justify-center gap-2 transition-all border border-red-600 hover:border-red-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center mb-3">
              <div className="flex-1 h-px bg-gray-800"></div>
              <span className="px-4 text-gray-500 text-xs">SECURITY NOTICE</span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>
            <p className="text-xs text-gray-500">
              This is a restricted area. All access attempts are logged and monitored.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Need user access? <a href="/login" className="text-blue-400 hover:text-blue-300">Go to User Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <AdminLoginForm />
    </Suspense>
  )
}