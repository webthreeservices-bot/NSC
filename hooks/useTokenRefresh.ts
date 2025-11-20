'use client'

import { useEffect, useCallback, useRef } from 'react'
import { 
  getTokenFromStorage, 
  getRefreshTokenFromStorage,
  setTokenToStorage,
  setRefreshTokenToStorage,
  removeTokenFromStorage
} from '@/lib/auth'
import jwt from 'jsonwebtoken'

export function useTokenRefresh() {
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  const refreshToken = useCallback(async () => {
    try {
      const currentRefreshToken = getRefreshTokenFromStorage()
      
      if (!currentRefreshToken) {
        console.log('No refresh token available')
        return false
      }

      console.log('Attempting to refresh token...')
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      })

      if (!response.ok) {
        console.error('Token refresh failed:', response.status, response.statusText)
        // Only logout if it's definitely a 401/403, not network errors
        if (response.status === 401 || response.status === 403) {
          removeTokenFromStorage()
          window.location.href = '/login?session_expired=true'
        }
        return false
      }

      const data = await response.json()
      
      if (data.token && data.refreshToken) {
        setTokenToStorage(data.token)
        setRefreshTokenToStorage(data.refreshToken)
        console.log('Token refreshed successfully')
        scheduleNextRefresh(data.token)
        return true
      }

      console.error('Token refresh response missing tokens')
      return false
    } catch (error) {
      console.error('Error refreshing token:', error)
      // Don't auto-logout on network errors, just try again later
      return false
    }
  }, [])

  const scheduleNextRefresh = useCallback((token: string) => {
    try {
      const decoded = jwt.decode(token) as any
      if (!decoded?.exp) return

      const now = Math.floor(Date.now() / 1000)
      const expiresIn = decoded.exp - now
      
      // Refresh 10 minutes before expiration, but at least 2 minutes
      const refreshIn = Math.max(expiresIn - 600, 120)
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      console.log(`Scheduling token refresh in ${Math.floor(refreshIn / 60)} minutes`)
      
      refreshTimeoutRef.current = setTimeout(() => {
        refreshToken()
      }, refreshIn * 1000)
    } catch (error) {
      console.error('Error scheduling token refresh:', error)
    }
  }, [refreshToken])

  useEffect(() => {
    const token = getTokenFromStorage()
    if (token) {
      scheduleNextRefresh(token)
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [scheduleNextRefresh])

  return { refreshToken }
}
