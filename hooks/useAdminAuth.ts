import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const router = useRouter()

  const handleUnauthorizedResponse = useCallback(async (response: Response) => {
    if (response.status === 401) {
      try {
        const data = await response.json()
        if (data.requiresAuth && data.redirectUrl) {
          // Clear admin token
          localStorage.removeItem('adminToken')
          // Redirect to login
          router.push(data.redirectUrl)
          return true
        }
      } catch (error) {
        console.error('Error parsing unauthorized response:', error)
      }
    }
    return false
  }, [router])

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    // Get admin token
    const token = localStorage.getItem('adminToken')
    
    // Add authorization header and default values
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers
      })

      // Handle unauthorized responses
      if (await handleUnauthorizedResponse(response)) {
        return null
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Admin API error:', error)
      throw error
    }
  }, [handleUnauthorizedResponse])

  return {
    fetchWithAuth,
  }
}