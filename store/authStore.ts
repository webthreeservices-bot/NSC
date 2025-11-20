import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  username: string
  fullName: string | null
  referralCode: string
  isAdmin: boolean
  isEmailVerified: boolean
  twoFactorEnabled: boolean
}

interface AuthState {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
