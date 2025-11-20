'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, Users, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export const dynamic = 'force-dynamic'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, loading, error } = useAuth()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  })
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    // First try to get referral code from URL
    const ref = searchParams.get('ref')
    
    if (ref) {
      // If found in URL, save to session storage and use it
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('referralCode', ref)
      }
      setFormData(prev => ({ ...prev, referralCode: ref }))
    } else {
      // If not in URL, try to get from session storage
      if (typeof window !== 'undefined') {
        const savedRef = sessionStorage.getItem('referralCode')
        if (savedRef) {
          setFormData(prev => ({ ...prev, referralCode: savedRef }))
        } else {
          // If no referral code in URL or session storage, use the main referral code
          setFormData(prev => ({ ...prev, referralCode: 'NSCREF1000' }))
        }
      } else {
        // Default to main referral code if window is not defined (SSR)
        setFormData(prev => ({ ...prev, referralCode: 'NSCREF1000' }))
      }
    }
    
    // No cleanup needed for session storage as it persists across page navigations
    // But we could clear it on successful registration if needed
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setPasswordError('')

    // Validate referral code presence
    if (!formData.referralCode || formData.referralCode.trim() === '') {
      setPasswordError('Referral code is required for registration')
      return
    }
    
    const registrationData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      referralCode: formData.referralCode.trim()
    }

    console.log('Submitting registration with data:', registrationData)
    const result = await register(registrationData)

    if (result.success) {
      // Clear referral code from session storage on successful registration
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('referralCode')
      }
      router.push('/login?message=Registration successful! Please log in.')
    } else if (result.error === 'You cannot use your own referral code') {
      setPasswordError('You cannot use your own referral code')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-black border border-gray-800 w-full max-w-md shadow-xl rounded-xl hover:border-[#00ff00]/30 transition-all">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#00ff00]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <UserPlus className="h-6 w-6 nsc-text-accent" />
            </div>
            <h2 className="text-xl font-bold nsc-text-primary">Create Account</h2>
            <p className="nsc-text-secondary text-xs mt-1">Join NSC Bot and start earning</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="block">
                <span className="nsc-text-primary text-sm font-medium">Full Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="nsc-input w-full pl-9 text-sm"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 nsc-text-muted" />
              </div>
            </div>

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
                  placeholder="Minimum 8 characters"
                  className="nsc-input w-full pl-9 text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block">
                <span className="nsc-text-primary text-sm font-medium">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="nsc-input w-full pl-9 text-sm"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block flex justify-between items-center">
                <span className="nsc-text-primary text-sm font-medium">Referral Code</span>
                <span className="nsc-text-accent text-xs font-semibold">Required</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter referral code"
                  className="nsc-input w-full pl-9 text-sm"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  required
                />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 nsc-text-muted" />
              </div>
            </div>

            {(error || passwordError) && (
              <div className="space-y-2">
                {error && (
                  <div className="nsc-alert-error flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                    {error.includes('Invalid referral code') && (
                      <div className="text-xs mt-1 flex flex-col gap-1">
                        <p>Please try one of the following:</p>
                        <ul className="list-disc pl-4">
                          <li>Double-check the referral code for typos</li>
                          <li>Ask the person who referred you for their correct code</li>
                          <li>
                            <Link href="/contact" className="text-[#00ff00] hover:underline">
                              Contact support for assistance
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {passwordError && (
                  <div className="nsc-alert-warning flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{passwordError}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="nsc-btn-primary w-full py-3 text-sm font-semibold mt-4 rounded-lg flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Sign Up
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
              Already have an account?{' '}
              <Link href="/login" className="nsc-text-accent hover:text-[#00cc00] font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
