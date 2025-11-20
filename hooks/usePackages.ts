import { useState, useEffect, useCallback, useRef } from 'react'
import { packageAPI } from '@/lib/api'
import { getTokenFromStorage } from '@/lib/auth'

export function usePackages() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Memoize fetchPackages to prevent infinite re-renders
  const fetchPackages = useCallback(async (filters?: any) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const token = getTokenFromStorage()
      if (!token) throw new Error('Not authenticated')

      const response: any = await packageAPI.getMyPackages(filters || {}, token)

      // Only update state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setPackages(response.packages || [])
      }
    } catch (err: any) {
      // Don't set error if request was aborted
      if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        setError(err.message || 'Failed to fetch packages')
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }, []) // Empty deps array - function is stable

  const createPackage = useCallback(async (amount: number, network: string) => {
    setLoading(true)
    setError(null)

    try {
      const token = getTokenFromStorage()
      if (!token) throw new Error('Not authenticated')

      const response = await packageAPI.create({ amount, network }, token)
      return { success: true, data: response }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create package'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyDeposit = useCallback(async (packageId: string, txHash: string) => {
    setLoading(true)
    setError(null)

    try {
      const token = getTokenFromStorage()
      if (!token) throw new Error('Not authenticated')

      await packageAPI.verifyDeposit(packageId, txHash, token)
      return { success: true }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify deposit'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch packages on mount
  useEffect(() => {
    fetchPackages()

    // Cleanup function - abort pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchPackages])

  return {
    packages,
    loading,
    error,
    fetchPackages,
    createPackage,
    verifyDeposit
  }
}
