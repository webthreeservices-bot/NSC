'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Shield, LogIn, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getTokenFromStorage } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loading, error } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  })
  const [requires2FA, setRequires2FA] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Handle success message from registration
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('') // Clear any success messages
    
    try {
      const result = await login(
        formData.email,
        formData.password,
        formData.twoFactorCode || undefined
      )

      if (result.success) {
        // Wait a moment for the auth store to update
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Get user data from auth storage
        const token = getTokenFromStorage()
        if (token) {
          try {
            // Decode JWT to check admin status
            const payload = JSON.parse(atob(token.split('.')[1]))
            
            if (payload.isAdmin) {
              // Admin user - redirect to new admin portal
              window.location.href = '/admin/dashboard'
            } else {
              // Regular user - redirect to user dashboard
              window.location.href = '/dashboard'
            }
          } catch (error) {
            // Fallback to regular dashboard
            window.location.href = '/dashboard'
          }
        } else {
          // Token not found, fallback to dashboard
          window.location.href = '/dashboard'
        }
      } else if (result.error?.includes('2FA')) {
        setRequires2FA(true)
      }
    } catch (err: any) {
      // Error will be displayed from useAuth hook
      // No need to log - already handled by auth layer
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-black border border-gray-800 w-full max-w-md shadow-xl rounded-xl hover:border-[#00ff00]/30 transition-all">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#00ff00]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 nsc-text-accent" />
            </div>
            <h2 className="text-xl font-bold nsc-text-primary">Welcome Back</h2>
            <p className="nsc-text-secondary text-xs mt-1">Sign in to your NSC Bot account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="block">
                <span className="nsc-text-primary text-sm font-medium">Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="nsc-input w-full pl-9 text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="email"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 nsc-text-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block">
                <span className="nsc-text-primary text-sm font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="nsc-input w-full pl-9 text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 nsc-text-muted" />
              </div>
              <div className="text-right">
                <Link href="/forgot-password" className="nsc-text-accent hover:text-[#00cc00] text-xs font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {requires2FA && (
              <div className="space-y-2">
                <label className="block">
                  <span className="nsc-text-primary text-sm font-medium">2FA Code</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="nsc-input w-full pl-9 text-sm"
                    value={formData.twoFactorCode}
                    onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 nsc-text-muted" />
                </div>
              </div>
            )}

            {successMessage && (
              <div className="nsc-alert-success flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="nsc-alert-error flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="nsc-btn-primary w-full py-3 text-sm font-semibold mt-4 rounded-lg flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/30 border-t-black"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px nsc-border-subtle"></div>
            <span className="px-4 nsc-text-muted text-xs">OR</span>
            <div className="flex-1 h-px nsc-border-subtle"></div>
          </div>

          <div className="text-center">
            <p className="text-xs nsc-text-secondary">
              Don't have an account?{' '}
              <Link href="/register" className="nsc-text-accent hover:text-[#00cc00] font-semibold transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
