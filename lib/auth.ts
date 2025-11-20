/**
 * Improved token management with better error handling and debugging
 */
export function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    // Try to get from localStorage first
    let token = localStorage.getItem('token')
    
    // If not in localStorage, try to get from cookie
    if (!token) {
      token = getCookie('token')
      if (token) {
        // Sync to localStorage for faster access
        try {
          localStorage.setItem('token', token)
          console.log('🔄 Token synced from cookie to localStorage')
        } catch (e) {
          console.warn('⚠️ Could not sync token to localStorage:', e)
        }
      }
    }
    
    if (token) {
      console.log('✅ Token found in storage')
    } else {
      console.log('❌ No token found in storage or cookies')
    }
    
    return token
  } catch (error) {
    console.error('❌ Error getting token from storage:', error)
    // Fallback to cookie only
    return getCookie('token')
  }
}

export function setTokenToStorage(token: string): void {
  if (typeof window === 'undefined') return
  
  try {
    // Store in localStorage
    localStorage.setItem('token', token)
    
    // Also set in cookie with longer expiration for middleware
    setCookie('token', token, 7) // 7 days
    
    console.log('✅ Token stored in localStorage and cookie')
  } catch (error) {
    console.error('❌ Error storing token:', error)
    // Try to at least set the cookie
    try {
      setCookie('token', token, 7)
      console.log('✅ Token stored in cookie only')
    } catch (cookieError) {
      console.error('❌ Failed to store token anywhere:', cookieError)
    }
  }
}

export function removeTokenFromStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    
    // Clear cookies
    deleteCookie('token')
    deleteCookie('refreshToken')
    
    console.log('✅ All tokens cleared from storage and cookies')
  } catch (error) {
    console.error('❌ Error clearing tokens:', error)
  }
}

export function getRefreshTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    let refreshToken = localStorage.getItem('refreshToken')
    
    if (!refreshToken) {
      refreshToken = getCookie('refreshToken')
      if (refreshToken) {
        try {
          localStorage.setItem('refreshToken', refreshToken)
        } catch (e) {
          // localStorage might be full or disabled
        }
      }
    }
    
    return refreshToken
  } catch (error) {
    // localStorage might be disabled or unavailable
    return getCookie('refreshToken')
  }
}

export function setRefreshTokenToStorage(token: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('refreshToken', token)
    setCookie('refreshToken', token, 30) // 30 days for refresh token
  } catch (error) {
    // Silent fail - no need to log in production
  }
}

// Cookie helper functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  try {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const part = parts.pop()
      if (part) {
        const cookieValue = part.split(';').shift()
        return cookieValue || null
      }
    }
    return null
  } catch (error) {
    // Silently handle cookie parsing errors
    return null
  }
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return
  
  try {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  } catch (error) {
    // Silently handle cookie setting errors
    console.error('Error setting cookie:', error)
  }
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  } catch (error) {
    // Silently handle cookie deletion errors
    console.error('Error deleting cookie:', error)
  }
}

export function isAuthenticated(): boolean {
  const token = getTokenFromStorage()
  return !!token
}

export function getUserFromToken(): any {
  // Token verification should be done server-side
  // This is just for client-side checks
  const token = getTokenFromStorage()
  if (!token) return null
  
  try {
    // Decode JWT without verification (client-side only)
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const base64Url = parts[1]
    if (!base64Url) return null
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export function isAdmin(): boolean {
  const user = getUserFromToken()
  return user?.isAdmin === true
}

export async function validateToken(token: string): Promise<boolean> {
  if (!token) return false

  try {
    // Make a request to validate the token with the server
    const response = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.valid === true
    }

    return false
  } catch (error) {
    // Silent fail - token validation failed
    return false
  }
}
