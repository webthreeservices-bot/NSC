import { create } from 'zustand'

interface EarningsSummary {
  totalEarnings: number
  roiEarnings: number
  referralEarnings: number
  levelEarnings: number
  withdrawableBalance: number
}

interface Earning {
  id: string
  earningType: string
  amount: number
  level: number | null
  paidDate: Date
}

interface EarningsState {
  summary: EarningsSummary | null
  earnings: Earning[]
  setSummary: (summary: EarningsSummary) => void
  setEarnings: (earnings: Earning[]) => void
  addEarning: (earning: Earning) => void
}

export const useEarningsStore = create<EarningsState>((set) => ({
  summary: null,
  earnings: [],
  setSummary: (summary) => set({ summary }),
  setEarnings: (earnings) => set({ earnings }),
  addEarning: (earning) =>
    set((state) => ({ earnings: [...state.earnings, earning] })),
}))
