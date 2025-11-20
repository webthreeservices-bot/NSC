import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/lib/api'
import { getTokenFromStorage, setTokenToStorage, removeTokenFromStorage, setRefreshTokenToStorage } from '@/lib/auth'
import { extractErrorMessage, formatErrorForLogging } from '@/utils/error-helpers'
import { getMobileFriendlyErrorMessage } from '@/lib/mobile-utils'

export function useAuth() {
  const { user, setUser, clearUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  // Validate current token on hook initialization
  const validateToken = useCallback(async () => {
    const token = getTokenFromStorage()
    
    if (!token) {
      console.log('🔍 No token found, user not authenticated')
      clearUser()
      setInitializing(false)
      return false
    }

    try {
      console.log('🔍 Validating existing token...')
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.valid && data.user) {
          console.log('✅ Token valid, user authenticated:', data.user.email)
          setUser({
            id: data.user.id,
            email: data.user.email,
            username: data.user.email.split('@')[0], // Fallback username
            fullName: data.user.fullName || null,
            referralCode: data.user.referralCode || '',
            isAdmin: data.user.isAdmin || false,
            isEmailVerified: data.user.isEmailVerified || false,
            twoFactorEnabled: data.user.twoFactorEnabled || false
          })
          setInitializing(false)
          return true
        }
      }

      console.log('❌ Token invalid, clearing authentication')
      removeTokenFromStorage()
      clearUser()
      setInitializing(false)
      return false
    } catch (error) {
      console.error('❌ Token validation error:', error)
      removeTokenFromStorage()
      clearUser()
      setInitializing(false)
      return false
    }
  }, [setUser, clearUser])

  // Initialize auth state on mount
  useEffect(() => {
    validateToken()
  }, [validateToken])

  const login = useCallback(async (email: string, password: string, twoFactorCode?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response: any = await authAPI.login({ email, password, twoFactorCode })
      
      if (response?.success) {
        if (response.token) {
          // Store token in both localStorage and cookie
          setTokenToStorage(response.token)
          if (response.refreshToken) {
            setRefreshTokenToStorage(response.refreshToken)
          }
        }
        if (response.user) {
          setUser(response.user)
          // Store admin status
          if (response.user.isAdmin) {
            localStorage.setItem('adminToken', response.token)
          }
        }
        return { success: true }
      }
      
      // Handle 2FA requirement
      if (response?.requires2FA) {
        setError('Please enter your 2FA code')
        return { success: false, error: '2FA code required' }
      }
      
      setError('Login failed. Please try again.')
      return { success: false, error: 'Login failed' }
    } catch (err: any) {
      console.error('Login error in useAuth:', formatErrorForLogging(err))
      
      // Use mobile-friendly error messages
      const errorMessage = getMobileFriendlyErrorMessage(err)
      
      // Check for 2FA requirement
      if (errorMessage.includes('2FA')) {
        return { success: false, error: errorMessage }
      }
      
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [setUser])

  const register = useCallback(async (data: {
    email: string
    password: string
    fullName: string
    referralCode: string  // Now required, not optional
  }) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Registering with data:', data)
      const response: any = await authAPI.register(data)
      
      if (response?.token) {
        setTokenToStorage(response.token)
        if (response.user) {
          setUser(response.user)
        }
        return { success: true }
      }
      
      return { success: false, error: response?.message || 'Registration failed' }
    } catch (err: any) {
      console.error('Registration error in useAuth:', formatErrorForLogging(err))
      
      // Use mobile-friendly error messages
      const errorMessage = getMobileFriendlyErrorMessage(err)
      
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [setUser])

  const logout = useCallback(async () => {
    removeTokenFromStorage()
    clearUser()
    
    // Clear cookies by calling logout API
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Redirect to home
    window.location.href = '/'
  }, [clearUser])

  return {
    user,
    loading,
    error,
    initializing,
    login,
    register,
    logout,
    validateToken,
    setUser,
    isAuthenticated: !!user
  }
}
