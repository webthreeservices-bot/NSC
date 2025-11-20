import { useState, useEffect } from 'react'
import { withdrawalAPI } from '@/lib/api'
import { getTokenFromStorage } from '@/lib/auth'

export function useWithdrawals() {
  const isClient = typeof window !== 'undefined';
  if (!isClient) {
    return {
      withdrawals: [],
      eligibility: null,
      loading: true,
      error: null,
      fetchWithdrawals: () => {},
      checkEligibility: () => {},
      requestWithdrawal: async () => ({ success: false })
    };
  }

  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [eligibility, setEligibility] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWithdrawals = async (filters?: any) => {
    setLoading(true);
    setError(null);

    try {
      const token = getTokenFromStorage();
      if (!token) return; // FIXED → do not throw during SSR

      const response: any = await withdrawalAPI.getHistory(filters || {}, token);
      setWithdrawals(response?.withdrawals || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getTokenFromStorage();
      if (!token) return; // FIXED

      const response = await withdrawalAPI.checkEligibility(token);
      setEligibility(response || null);
    } catch (err: any) {
      setError(err.message || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const requestWithdrawal = async (data: any) => {
    setLoading(true)
    setError(null)

    try {
      const token = getTokenFromStorage()
      if (!token) return { success: false, error: 'Not authenticated' }

      const response = await withdrawalAPI.request(data, token)
      return { success: true, data: response }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to request withdrawal'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
    checkEligibility()
  }, [])

  return {
    withdrawals,
    eligibility,
    loading,
    error,
    fetchWithdrawals,
    checkEligibility,
    requestWithdrawal
  }
}
