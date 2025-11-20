import { useState, useEffect } from 'react'
import { earningsAPI } from '@/lib/api'
import { getTokenFromStorage } from '@/lib/auth'

export function useEarnings() {
  const [summary, setSummary] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getTokenFromStorage()
      if (!token) throw new Error('Not authenticated')
      
      const response = await earningsAPI.getSummary(token)
      setSummary(response)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch earnings summary')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (filters?: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getTokenFromStorage()
      if (!token) throw new Error('Not authenticated')
      
      const response: any = await earningsAPI.getHistory(filters || {}, token)
      setHistory(response.earnings || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch earnings history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  return {
    summary,
    history,
    loading,
    error,
    fetchSummary,
    fetchHistory
  }
}
