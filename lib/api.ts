// Use relative URL to avoid CORS issues - always use same origin
const API_URL = '/api'

interface RequestOptions extends RequestInit {
  token?: string
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Retry logic for network errors (especially useful for mobile)
  const maxRetries = 2
  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Parse response body
      let data: any
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        data = { error: 'Invalid response from server' }
      }

      if (!response.ok) {
        const errorDetails = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          data,
          attempt: attempt + 1,
          url: `${API_URL}${endpoint}`
        }

        // Only log if there's actual error information
        if (errorDetails.status || errorDetails.data) {
          console.error('API Error:', errorDetails)
        }
        
        // Extract error message from response
        let errorMessage = 'Request failed'
        
        if (data && typeof data === 'object') {
          if (data.error && typeof data.error === 'string') {
            errorMessage = data.error
          } else if (data.message && typeof data.message === 'string') {
            errorMessage = data.message
          } else if (data.error && typeof data.error === 'object') {
            errorMessage = JSON.stringify(data.error)
          } else {
            errorMessage = `Request failed with status ${response.status}`
          }
        } else if (typeof data === 'string') {
          errorMessage = data
        } else {
          errorMessage = `Request failed with status ${response.status}`
        }
        
        // Create an error with a clear message
        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).data = data
        throw error
      }

      return data
    } catch (error: any) {
      lastError = error
      
      // Check if it's a network error that we should retry
      const isNetworkError = 
        error.name === 'AbortError' ||
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('ECONNREFUSED')

      // Retry on network errors, but not on client errors (4xx) or application errors
      if (isNetworkError && attempt < maxRetries) {
        console.warn(`Network error, retrying (${attempt + 1}/${maxRetries})...`)
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        continue
      }

      // Don't retry, throw the error
      console.error('API Request Error:', {
        endpoint,
        error: error.message || error,
        stack: error.stack,
        attempt: attempt + 1
      })
      
      // If it's already an Error object with a message, re-throw it
      if (error instanceof Error && error.message) {
        throw error
      }
      
      // Otherwise create a new Error with a proper message
      throw new Error(error?.message || 'Network error. Please check your connection and try again.')
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error('Request failed after retries')
}

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; fullName: string; referralCode: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string; twoFactorCode?: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  verifyEmail: (token: string) =>
    apiRequest('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),

  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),

  enable2FA: (token: string) =>
    apiRequest('/auth/enable-2fa', { method: 'POST', token }),

  verify2FA: (code: string, token: string) =>
    apiRequest('/auth/verify-2fa', { method: 'POST', body: JSON.stringify({ code }), token }),
}

// User API
export const userAPI = {
  getProfile: (token: string) =>
    apiRequest('/user/profile', { token }),

  updateProfile: (data: any, token: string) =>
    apiRequest('/user/profile', { method: 'PUT', body: JSON.stringify(data), token }),

  getReferralCode: (token: string) =>
    apiRequest('/user/referral-code', { token }),
}

// Package API
export const packageAPI = {
  create: (data: { amount: number; network: string }, token: string) =>
    apiRequest('/packages/create', { method: 'POST', body: JSON.stringify(data), token }),

  getMyPackages: (params: any, token: string) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/packages/my-packages?${query}`, { token })
  },

  getPackageById: (id: string, token: string) =>
    apiRequest(`/packages/${id}`, { token }),

  verifyDeposit: (id: string, txHash: string, token: string) =>
    apiRequest(`/packages/${id}/verify-deposit`, { method: 'POST', body: JSON.stringify({ txHash }), token }),
}

// Bot API
export const botAPI = {
  activate: (data: { botType: string; network: string; txHash: string }, token: string) =>
    apiRequest('/bots/activate', { method: 'POST', body: JSON.stringify(data), token }),

  getMyBots: (token: string) =>
    apiRequest('/bots/my-bots', { token }),

  checkEligibility: (botType: string, token: string) =>
    apiRequest(`/bots/check-eligibility?botType=${botType}`, { token }),
}

// Earnings API
export const earningsAPI = {
  getSummary: (token: string) =>
    apiRequest('/earnings/summary', { token }),

  getHistory: (params: any, token: string) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/earnings/history?${query}`, { token })
  },

  getRoiSchedule: (token: string) =>
    apiRequest('/earnings/roi-schedule', { token }),
}

// Referral API
export const referralAPI = {
  getStats: (token: string) =>
    apiRequest('/referrals/stats', { token }),

  getTree: (level: number | undefined, token: string) => {
    const query = level ? `?level=${level}` : ''
    return apiRequest(`/referrals/tree${query}`, { token })
  },

  getDirect: (token: string) =>
    apiRequest('/referrals/direct', { token }),

  getLevelBreakdown: (token: string) =>
    apiRequest('/referrals/level-breakdown', { token }),
}

// Withdrawal API
export const withdrawalAPI = {
  request: (data: any, token: string) =>
    apiRequest('/withdrawals/request', { method: 'POST', body: JSON.stringify(data), token }),

  getHistory: (params: any, token: string) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/withdrawals/history?${query}`, { token })
  },

  checkEligibility: (token: string) =>
    apiRequest('/withdrawals/check-eligibility', { token }),
}

// Transaction API
export const transactionAPI = {
  getHistory: (params: any, token: string) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/transactions/history?${query}`, { token })
  },

  getById: (id: string, token: string) =>
    apiRequest(`/transactions/${id}`, { token }),
}

// Admin API
export const adminAPI = {
  // User Management
  getUsers: (params: any, token: string) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/admin/users?${query}`, { token })
  },

  // Withdrawal Management
  getPendingWithdrawals: (token: string) =>
    apiRequest('/admin/withdrawals/pending', { token }),

  approveWithdrawal: (id: string, token: string) =>
    apiRequest(`/admin/withdrawals/${id}/approve`, { method: 'POST', body: JSON.stringify({}), token }),

  rejectWithdrawal: (id: string, reason: string, token: string) =>
    apiRequest(`/admin/withdrawals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }), token }),

  // Statistics
  getStatistics: (token: string) =>
    apiRequest('/admin/statistics', { token }),

  // Bot Package Management
  getBotPackages: (token: string) =>
    apiRequest('/admin/bot-packages', { token }),

  createBotPackage: (data: { name: string; type: string; price: number; roi: number; duration?: number; description?: string; isActive?: boolean }, token: string) =>
    apiRequest('/admin/bot-packages', { method: 'POST', body: JSON.stringify(data), token }),

  updateBotPackage: (id: string, data: { name?: string; type?: string; price?: number; roi?: number; duration?: number; description?: string; isActive?: boolean }, token: string) =>
    apiRequest('/admin/bot-packages', { method: 'PUT', body: JSON.stringify({ id, ...data }), token }),

  deleteBotPackage: (id: string, token: string) =>
    apiRequest(`/admin/bot-packages?id=${id}`, { method: 'DELETE', token }),

  // System Settings
  updateSystemSettings: (data: { key: string; value: string }, token: string) =>
    apiRequest('/admin/system-settings', { method: 'POST', body: JSON.stringify(data), token }),
}
