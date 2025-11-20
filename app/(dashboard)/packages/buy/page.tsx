'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PaymentModal } from '@/components/PaymentModal'
import { usePackages } from '@/hooks/usePackages'
import { formatCurrency } from '@/lib/utils'
import { getTokenFromStorage } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import {
  TrendingUp,
  Shield,
  Zap,
  Crown,
  Check,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Wallet,
  Network
} from 'lucide-react'

const PACKAGE_OPTIONS = [
  {
    amount: 500,
    type: 'NEO',
    roi: 3,
    tier: 'starter',
    popular: false,
    icon: Sparkles,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    features: ['12 Month Duration', 'Monthly Payouts', 'Basic Support']
  },
  {
    amount: 1000,
    type: 'NEO',
    roi: 3,
    tier: 'starter',
    popular: true,
    icon: Sparkles,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    features: ['12 Month Duration', 'Monthly Payouts', 'Priority Support']
  },
  {
    amount: 3000,
    type: 'NEO',
    roi: 3,
    tier: 'starter',
    popular: false,
    icon: Sparkles,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    features: ['12 Month Duration', 'Monthly Payouts', 'Priority Support']
  },
  {
    amount: 5000,
    type: 'NEURAL',
    roi: 4,
    tier: 'professional',
    popular: false,
    icon: Zap,
    gradient: 'from-green-600 to-teal-500',
    bgGradient: 'from-green-600/10 to-teal-500/10',
    features: ['12 Month Duration', 'Monthly Payouts', 'VIP Support', 'Bonus Rewards']
  },
  {
    amount: 10000,
    type: 'NEURAL',
    roi: 4,
    tier: 'professional',
    popular: true,
    icon: Zap,
    gradient: 'from-green-600 to-teal-500',
    bgGradient: 'from-green-600/10 to-teal-500/10',
    features: ['12 Month Duration', 'Monthly Payouts', 'VIP Support', 'Bonus Rewards']
  },
  {
    amount: 25000,
    type: 'ORACLE',
    roi: 5,
    tier: 'elite',
    popular: false,
    icon: Crown,
    gradient: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-500/10 to-green-600/10',
    features: ['12 Month Duration', 'Monthly Payouts', 'Dedicated Manager', 'Premium Rewards', 'Early Access']
  },
  {
    amount: 50000,
    type: 'ORACLE',
    roi: 5,
    tier: 'elite',
    popular: false,
    icon: Crown,
    gradient: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-500/10 to-green-600/10',
    features: ['12 Month Duration', 'Monthly Payouts', 'Dedicated Manager', 'Premium Rewards', 'Early Access', 'Exclusive Events']
  },
]

export default function BuyPackagePage() {
  const router = useRouter()
  const { createPackage, loading } = usePackages()
  const { success } = useToast()

  const [selectedAmount, setSelectedAmount] = useState<number>(1000)
  const [selectedNetwork, setSelectedNetwork] = useState<'BEP20' | 'TRC20'>('BEP20')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentPackageId, setCurrentPackageId] = useState<string>('')
  const [adminWalletAddress, setAdminWalletAddress] = useState('')
  const [loadingWallet, setLoadingWallet] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const selectedPackage = PACKAGE_OPTIONS.find(p => p.amount === selectedAmount)

  // Fetch admin wallet address when network changes
  useEffect(() => {
    const fetchWalletAddress = async () => {
      setLoadingWallet(true)
      try {
        const token = getTokenFromStorage()
        if (!token) return

        const response = await fetch(`/api/admin/wallet-address?network=${selectedNetwork}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()
        if (data.success) {
          setAdminWalletAddress(data.walletAddress)
        }
      } catch (error) {
      } finally {
        setLoadingWallet(false)
      }
    }

    fetchWalletAddress()
  }, [selectedNetwork])

  const handlePurchase = async () => {
    const result = await createPackage(selectedAmount, selectedNetwork)

    if (result.success && result.data) {
      setCurrentPackageId((result.data as any).id || '')
      setShowPaymentModal(true)
    }
  }

  const handlePaymentSuccess = async (txHash: string) => {
    if (!currentPackageId) {
      success('Package ID not found. Please try again.')
      return
    }

    try {
      const token = getTokenFromStorage()
      if (!token) {
        router.push('/login')
        return
      }

      // Automatically submit transaction hash for verification
      const response = await fetch(`/api/packages/${currentPackageId}/verify-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          txHash,
          network: selectedNetwork
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit transaction hash')
      }

      setShowPaymentModal(false)
      success('Transaction hash submitted successfully! Your package will be activated after admin verification.')
      router.push('/packages')
    } catch (error: any) {
      console.error('Error submitting transaction hash:', error)
      success(error.message || 'Payment successful but failed to submit transaction hash. Please contact support.')
      router.push('/packages')
    }
  }

  const getAdminWalletAddress = () => {
    return adminWalletAddress
  }

  const calculateTotalReturn = (amount: number, roi: number) => {
    return amount + (amount * roi / 100 * 12)
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Buy Investment Package</h1>
        <p className="text-gray-400 text-xs sm:text-sm">Choose your investment amount and start earning monthly ROI</p>
      </div>

      <div className="w-full max-w-full overflow-x-hidden">
        {/* Package Selection */}
        <div className="bg-black border border-gray-800 shadow-lg rounded-xl hover:border-[#00ff00]/30 transition-all w-full">
          <div className="p-3 sm:p-4">
            <h2 className="text-base font-bold mb-3 text-white">Select Package Amount</h2>

            <div className="space-y-3">
              {/* NEO Tier - 3% */}
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-[#00ff00]">NEO</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs font-bold text-[#00ff00]">3% Monthly ROI</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[500, 1000, 3000].map((amount) => {
                    const isSelected = selectedAmount === amount
                    return (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount)
                          setCurrentStep(2)
                        }}
                        className={`relative p-2 sm:p-2.5 rounded border transition-all text-left min-w-0 ${
                          isSelected
                            ? 'border-[#00ff00] bg-[#00ff00]/10'
                            : 'border-gray-800 hover:border-gray-700 bg-gray-800/50'
                        }`}
                      >
                        {isSelected && (
                          <>
                            <div className="absolute inset-0 z-0 flex items-center justify-center rounded">
                              <div className="absolute h-full w-full animate-orbit-glow rounded">
                                <div className="h-full w-full rounded bg-transparent shadow-[0_0_20px_5px_rgba(0,255,0,0.5)]"></div>
                              </div>
                            </div>
                            <style jsx>{`
                              @keyframes orbit-glow {
                                0% {
                                  transform: scale(1);
                                  box-shadow: 0 0 20px 5px rgba(0, 255, 0, 0.5);
                                }
                                50% {
                                  transform: scale(1.05);
                                  box-shadow: 0 0 30px 10px rgba(0, 255, 0, 0.3);
                                }
                                100% {
                                  transform: scale(1);
                                  box-shadow: 0 0 20px 5px rgba(0, 255, 0, 0.5);
                                }
                              }
                              .animate-orbit-glow {
                                animation: orbit-glow 4s ease-in-out infinite;
                              }
                            `}</style>
                          </>
                        )}
                        <div className="relative z-10 min-w-0">
                          <div className="text-xs sm:text-sm md:text-base font-bold text-white truncate">{formatCurrency(amount)}</div>
                          <div className="text-[10px] sm:text-xs font-bold text-[#00ff00] mt-0.5 truncate">+{formatCurrency((amount * 3 / 100) * 12)}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* NEURAL Tier - 4% */}
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-[#00ff00]">NEURAL</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs font-bold text-[#00ff00]">4% Monthly ROI</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {[5000, 10000].map((amount) => {
                    const isSelected = selectedAmount === amount
                    return (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount)
                          setCurrentStep(2)
                        }}
                        className={`relative p-2 sm:p-2.5 rounded border transition-all text-left min-w-0 ${
                          isSelected
                            ? 'border-[#00ff00] bg-[#00ff00]/10'
                            : 'border-gray-800 hover:border-gray-700 bg-gray-800/50'
                        }`}
                      >
                        {isSelected && (
                          <>
                            <div className="absolute inset-0 z-0 flex items-center justify-center rounded">
                              <div className="absolute h-full w-full animate-orbit-glow rounded">
                                <div className="h-full w-full rounded bg-transparent shadow-[0_0_20px_5px_rgba(0,255,0,0.5)]"></div>
                              </div>
                            </div>
                            <style jsx>{`
                              @keyframes orbit-glow {
                                0% {
                                  transform: scale(1);
                                  box-shadow: 0 0 20px 5px rgba(0, 255, 0, 0.5);
                                }
                                50% {
                                  transform: scale(1.05);
                                  box-shadow: 0 0 30px 10px rgba(0, 255, 0, 0.3);
                                }
                                100% {
                                  transform: scale(1);
                                  box-shadow: 0 0 20px 5px rgba(0, 255, 0, 0.5);
                                }
                              }
                              .animate-orbit-glow {
                                animation: orbit-glow 4s ease-in-out infinite;
                              }
                            `}</style>
                          </>
                        )}
                        <div className="relative z-10 min-w-0">
                          <div className="text-xs sm:text-sm md:text-base font-bold text-white truncate">{formatCurrency(amount)}</div>
                          <div className="text-[10px] sm:text-xs font-bold text-[#00ff00] mt-0.5 truncate">+{formatCurrency((amount * 4 / 100) * 12)}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ORACLE Tier - 5% */}
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-[#00ff00]">ORACLE</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs font-bold text-[#00ff00]">5% Monthly ROI</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {[25000, 50000].map((amount) => {
                    const isSelected = selectedAmount === amount
                    return (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount)
                          setCurrentStep(2)
                        }}
                        className={`relative p-2 sm:p-2.5 rounded border transition-all text-left min-w-0 ${
                          isSelected
                            ? 'border-[#00ff00] bg-[#00ff00]/10'
                            : 'border-gray-800 hover:border-gray-700 bg-gray-800/50'
                        }`}
                      >
                        {isSelected && (
                          <>
                            <div className="absolute inset-0 z-0 flex items-center justify-center rounded">
                              <div className="absolute h-full w-full animate-orbit-glow rounded">
                                <div className="h-full w-full rounded bg-transparent shadow-[0_0_20px_5px_rgba(0,255,0,0.5)]"></div>
                              </div>
                            </div>
                            <style jsx>{`
                              @keyframes orbit-glow {
                                0% {
                                  transform: scale(1);
                                  box-shadow: 0 0 20px 5px rgba(0, 255, 0, 0.5);
                                }
                                50% {
                                  transform: scale(1.05);
                                  box-shadow: 0 0 30px 10px rgba(0, 255, 0, 0.3);
                                }
                                100% {
                                  transform: scale(1);
                                  box-shadow: 0 0 20px 5px rgba(0, 255, 0, 0.5);
                                }
                              }
                              .animate-orbit-glow {
                                animation: orbit-glow 4s ease-in-out infinite;
                              }
                            `}</style>
                          </>
                        )}
                        <div className="relative z-10 min-w-0">
                          <div className="text-xs sm:text-sm md:text-base font-bold text-white truncate">{formatCurrency(amount)}</div>
                          <div className="text-[10px] sm:text-xs font-bold text-[#00ff00] mt-0.5 truncate">+{formatCurrency((amount * 5 / 100) * 12)}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network and Summary Section */}
        {selectedPackage && (
          <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full">
            {/* Network Selection */}
            <div className="lg:col-span-2 w-full max-w-full">
              <div className="bg-black border border-gray-800 shadow-lg rounded-xl hover:border-[#00ff00]/30 transition-all w-full">
                <div className="p-3 sm:p-4">
                  <h2 className="text-sm sm:text-base font-bold mb-3 text-white">Select Network</h2>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => {
                        setSelectedNetwork('BEP20')
                        setCurrentStep(3)
                      }}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedNetwork === 'BEP20'
                          ? 'border-[#00ff00] bg-[#00ff00]/10'
                          : 'border-gray-800 hover:border-gray-700 bg-gray-900'
                      }`}
                    >
                      <div className="font-semibold text-white text-sm">BEP20 (BSC)</div>
                      <div className="text-xs text-gray-400 mt-1">Binance Smart Chain</div>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedNetwork('TRC20')
                        setCurrentStep(3)
                      }}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedNetwork === 'TRC20'
                          ? 'border-[#00ff00] bg-[#00ff00]/10'
                          : 'border-gray-800 hover:border-gray-700 bg-gray-900'
                      }`}
                    >
                      <div className="font-semibold text-white text-sm">TRC20 (TRON)</div>
                      <div className="text-xs text-gray-400 mt-1">TRON Network</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1 w-full max-w-full">
              <div className="bg-black border border-gray-800 shadow-lg rounded-xl hover:border-[#00ff00]/30 transition-all w-full">
                <div className="p-3 sm:p-4">
                  <h2 className="text-sm sm:text-base font-bold mb-3 text-white">Summary</h2>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between p-2 bg-gray-900 rounded-lg">
                      <span className="text-gray-400 text-xs sm:text-sm">Package</span>
                      <span className="text-white font-semibold text-xs sm:text-sm truncate ml-2">{selectedPackage.type}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-900 rounded-lg">
                      <span className="text-gray-400 text-xs sm:text-sm">Investment</span>
                      <span className="text-white font-semibold text-xs sm:text-sm truncate ml-2">{formatCurrency(selectedAmount)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#00ff00]/10 rounded-lg border border-[#00ff00]/30">
                      <span className="text-gray-400 font-medium text-xs sm:text-sm">Monthly ROI</span>
                      <span className="text-[#00ff00] font-bold text-sm sm:text-base">{selectedPackage.roi}%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-900 rounded-lg">
                      <span className="text-gray-400 text-xs sm:text-sm">Duration</span>
                      <span className="text-white font-semibold text-xs sm:text-sm">12 months</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-900 rounded-lg">
                      <span className="text-gray-400 text-xs sm:text-sm">Network</span>
                      <span className="text-white font-semibold text-xs sm:text-sm truncate ml-2">{selectedNetwork}</span>
                    </div>

                    <div className="h-px bg-gray-800 my-2" />

                    <div className="flex justify-between p-2 bg-[#00ff00]/10 rounded-lg border border-[#00ff00]/30">
                      <span className="text-gray-400 font-medium text-xs sm:text-sm">Total Profit</span>
                      <span className="text-[#00ff00] font-bold text-sm sm:text-base truncate ml-2">
                        +{formatCurrency((selectedAmount * selectedPackage.roi / 100) * 12)}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-[#00ff00]/10 rounded-lg border border-[#00ff00]/30">
                      <span className="text-gray-400 font-medium text-xs sm:text-sm">Total Return</span>
                      <span className="text-white font-bold text-sm sm:text-lg truncate ml-2">
                        {formatCurrency(calculateTotalReturn(selectedAmount, selectedPackage.roi))}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePurchase}
                    disabled={loading || loadingWallet || !adminWalletAddress}
                    className="w-full mt-3 sm:mt-4 bg-[#00ff00] hover:bg-[#00cc00] text-black font-semibold text-xs sm:text-sm py-2 sm:py-2.5"
                  >
                    {loading ? 'Processing...' : loadingWallet ? 'Loading...' : 'Continue to Payment'}
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={selectedAmount}
        network={selectedNetwork}
        adminWalletAddress={getAdminWalletAddress()}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
