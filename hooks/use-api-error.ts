import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface ApiError {
  message: string
  status?: number
  code?: string
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleApiCall = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void
      onError?: (error: ApiError) => void
      showToast?: boolean
      successMessage?: string
      errorMessage?: string
    }
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      
      if (options?.onSuccess) {
        options.onSuccess(result)
      }
      
      if (options?.showToast && options?.successMessage) {
        toast.success(options.successMessage)
      }
      
      return result
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'An unexpected error occurred',
        status: err.status,
        code: err.code
      }
      
      setError(apiError)
      
      if (options?.onError) {
        options.onError(apiError)
      }
      
      if (options?.showToast !== false) {
        toast.error(options?.errorMessage || apiError.message)
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    isLoading,
    handleApiCall,
    clearError
  }
}
