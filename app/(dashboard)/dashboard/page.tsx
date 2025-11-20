'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { StatsCard } from '@/components/ui/stats-card'
import { PackageCard } from '@/components/ui/package-card'
import {
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Wallet,
  Activity,
  Award,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  Calendar,
  CalendarDays
} from 'lucide-react'
import { userAPI, packageAPI, earningsAPI } from '@/lib/api'
import { getTokenFromStorage } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function DashboardPage() {
  const { success } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [earnings, setEarnings] = useState<any>({
    totalEarnings: 0,
    roiEarnings: 0,
    referralEarnings: 0,
    levelEarnings: 0,
    withdrawableBalance: 0,
    lockedCapital: 0
  })
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const token = getTokenFromStorage()
      if (!token) {
        setLoading(false)
        return
      }

      // Use Promise.allSettled to handle partial failures gracefully
      const [profileResult, packageResult, earningsResult] = await Promise.allSettled([
        userAPI.getProfile(token),
        packageAPI.getMyPackages({ status: 'ACTIVE' }, token),
        earningsAPI.getSummary(token)
      ])

      // Only update state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        // Update stats if profile fetch succeeded
        if (profileResult.status === 'fulfilled') {
          setStats(profileResult.value?.stats)
          setProfile(profileResult.value?.user)
        } else {
          console.warn('Failed to fetch profile:', profileResult.reason)
        }

        // Update packages if fetch succeeded
        if (packageResult.status === 'fulfilled') {
          setPackages(packageResult.value?.packages || [])
        } else {
          console.warn('Failed to fetch packages:', packageResult.reason)
        }

        // Update earnings if fetch succeeded
        if (earningsResult.status === 'fulfilled') {
          console.log('✅ Earnings data received:', earningsResult.value)
          setEarnings(earningsResult.value?.summary)
        } else {
          console.error('❌ Failed to fetch earnings:', earningsResult.reason)
          // Set default values instead of leaving undefined
          setEarnings({
            totalEarnings: 0,
            roiEarnings: 0,
            referralEarnings: 0,
            levelEarnings: 0,
            withdrawableBalance: 0,
            lockedCapital: 0
          })
        }
      }
    } catch (error: any) {
      // Don't log error if request was aborted
      if (error.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        console.error('Failed to fetch dashboard data:', error)
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()

    // Cleanup function - abort pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchDashboardData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-[#00ff00] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate daily and monthly ROI income from active packages
  const calculateIncomeProjections = () => {
    if (!packages || packages.length === 0) {
      return { dailyIncome: 0, monthlyIncome: 0 }
    }

    let totalMonthlyIncome = 0

    packages.forEach((pkg: any) => {
      const amount = Number(pkg.amount)
      const roiPercentage = Number(pkg.roiPercentage)

      // Calculate monthly ROI for this package
      const monthlyRoi = (amount * roiPercentage) / 100
      totalMonthlyIncome += monthlyRoi
    })

    // Calculate daily income (monthly / 30 days)
    const dailyIncome = totalMonthlyIncome / 30

    return {
      dailyIncome,
      monthlyIncome: totalMonthlyIncome
    }
  }

  const { dailyIncome, monthlyIncome } = calculateIncomeProjections()

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-xs">Track your investments and earnings</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="active:scale-95 transition-transform"
              title="Refresh dashboard"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/packages/buy" className="flex-1 md:flex-none bg-[#00ff00] hover:bg-[#00cc00] text-black px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
              <Plus className="h-4 w-4" />
              New Investment
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Invested"
            value={formatCurrency(stats?.totalInvested || 0)}
            icon={DollarSign}
            variant="primary"
          />
          <StatsCard
            title="Total Earnings"
            value={formatCurrency(earnings?.totalEarnings || 0)}
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Active Packages"
            value={stats?.activePackages || 0}
            subtitle={`${packages.length} total packages`}
            icon={Package}
            variant="info"
          />
        </div>

        {/* Daily & Monthly Income Projections */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gradient-to-br from-[#00ff00]/10 to-[#00ff00]/5 border-2 border-[#00ff00]/30 shadow-lg rounded-xl p-4 hover:border-[#00ff00]/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#00ff00]/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-[#00ff00]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Daily ROI Income</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(dailyIncome)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">Calculation</p>
              <p className="text-xs text-gray-300">Monthly ROI ÷ 30 days</p>
              <p className="text-xs text-[#00ff00] mt-2">
                {formatCurrency(monthlyIncome)} ÷ 30 = {formatCurrency(dailyIncome)}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/30 shadow-lg rounded-xl p-4 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Monthly ROI Income</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(monthlyIncome)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">Calculation</p>
              <p className="text-xs text-gray-300">Investment × ROI %</p>
              {packages.length > 0 && (
                <div className="mt-2 space-y-1">
                  {packages.slice(0, 2).map((pkg: any, idx: number) => (
                    <p key={idx} className="text-xs text-blue-400">
                      {formatCurrency(pkg.amount)} × {pkg.roiPercentage}% = {formatCurrency((Number(pkg.amount) * Number(pkg.roiPercentage)) / 100)}
                    </p>
                  ))}
                  {packages.length > 2 && (
                    <p className="text-xs text-gray-500">+{packages.length - 2} more packages</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-2 border-orange-500/30 shadow-lg rounded-xl p-4 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Referrals</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalReferrals || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">Referral Earnings</p>
              <p className="text-xs text-gray-300">2% direct + level income</p>
              <p className="text-xs text-orange-400 mt-2">
                Total: {formatCurrency((earnings?.referralEarnings || 0) + (earnings?.levelEarnings || 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-black border border-gray-800 shadow-lg rounded-xl hover:border-[#00ff00]/30 transition-all">
              <div className="p-4">
                <h2 className="text-base font-bold flex items-center gap-2 mb-3 text-white">
                  <Activity className="h-4 w-4 text-[#00ff00]" />
                  Earnings Breakdown
                </h2>

                {/* Debug Info - Remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-700 rounded text-xs">
                    <p className="text-yellow-300">Debug: Earnings Data</p>
                    <pre className="text-yellow-200 mt-1 overflow-auto">
                      {JSON.stringify(earnings, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00ff00]/20 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-[#00ff00]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">ROI Earnings</p>
                        <p className="text-xs text-gray-400">Monthly returns</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-[#00ff00]">
                      {formatCurrency(earnings?.roiEarnings || 0)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#00ff00]/20 rounded-lg">
                        <Award className="h-4 w-4 text-[#00ff00]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Referral Earnings</p>
                        <p className="text-xs text-gray-400">Direct & level income</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-[#00ff00]">
                      {formatCurrency((earnings?.referralEarnings || 0) + (earnings?.levelEarnings || 0))}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Wallet className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Withdrawable Balance</p>
                        <p className="text-xs text-gray-400">Available for withdrawal</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-orange-500">
                      {formatCurrency(earnings?.withdrawableBalance || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-black border border-gray-800 shadow-lg rounded-xl hover:border-[#00ff00]/30 transition-all">
            <div className="p-4">
              <h2 className="text-base font-bold mb-3 text-white">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/packages/buy" className="bg-[#00ff00] hover:bg-[#00cc00] text-black px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all w-full">
                  <Package className="h-4 w-4" />
                  Buy Package
                </Link>
                <Link href="/bots" className="border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all w-full">
                  <Activity className="h-4 w-4" />
                  Activate Bot
                </Link>
                <Link href="/withdrawals" className="border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all w-full">
                  <Wallet className="h-4 w-4" />
                  Withdraw Funds
                </Link>
                <Link href="/network" className="border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all w-full">
                  <Users className="h-4 w-4" />
                  View Network
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Active Packages */}
        {packages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold flex items-center gap-2 text-white">
                <Package className="h-4 w-4 text-[#00ff00]" />
                Active Packages
              </h2>
              <Link href="/packages" className="text-[#00ff00] hover:text-[#00cc00] text-xs flex items-center gap-1 transition-colors">
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {packages.slice(0, 3).map((pkg: any) => (
                <PackageCard
                  key={pkg.id}
                  packageType={pkg.packageType}
                  amount={Number(pkg.amount)}
                  roiPercentage={Number(pkg.roiPercentage)}
                  status={pkg.status}
                  investmentDate={pkg.investmentDate}
                  expiryDate={pkg.expiryDate}
                  totalRoiPaid={Number(pkg.totalRoiPaid)}
                  roiPaidCount={pkg.roiPaidCount}
                  nextRoiDate={pkg.nextRoiDate}
                  onViewDetails={() => window.location.href = `/packages/${pkg.id}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Referral Information */}
        <div className="bg-black border border-gray-800 shadow-lg rounded-xl hover:border-[#00ff00]/30 transition-all">
          <div className="p-4">
            <h2 className="text-base font-bold flex items-center gap-2 mb-3 text-white">
              <Users className="h-4 w-4 text-[#00ff00]" />
              Referral Information
            </h2>

            {!profile?.hasPurchasedBot ? (
              // User hasn't purchased a bot - Show their unique code but no earnings warning
              <div className="space-y-3">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                      <Activity className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-yellow-500 mb-1">⚠️ Referral Income Not Active</h3>
                      <p className="text-xs text-gray-400 mb-2">
                        You can share your referral link, but <strong className="text-yellow-500">you will NOT earn any referral or direct income</strong> until you purchase a bot.
                      </p>
                      <Link 
                        href="/bots" 
                        className="inline-flex items-center gap-2 bg-[#00ff00] hover:bg-[#00cc00] text-black px-4 py-2 rounded-lg font-semibold text-xs transition-all"
                      >
                        <Package className="h-3 w-3" />
                        Buy Bot to Start Earning
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <label className="text-xs text-gray-400 mb-2 block">Your Referral Link (No Earnings Until Bot Purchase)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={profile?.referralCode ? `${window.location.origin}/register?ref=${profile.referralCode}` : ''}
                      readOnly
                      className="flex-1 bg-black border border-gray-800 text-gray-500 font-mono text-sm px-3 py-2 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const referralUrl = `${window.location.origin}/register?ref=${profile?.referralCode || ''}`
                        navigator.clipboard.writeText(referralUrl)
                        success('Referral link copied! Buy a bot to earn from referrals.')
                      }}
                      className="border border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-gray-300 px-3 py-2 rounded text-xs font-semibold transition-all"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-red-400 mt-2">
                    ⚠️ This link won't generate any income for you until you purchase a bot
                  </p>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <label className="text-xs text-gray-400 mb-2 block">Referred By</label>
                  <input
                    type="text"
                    value={profile?.referredBy || 'None'}
                    readOnly
                    className="w-full bg-black border border-gray-800 text-gray-400 text-sm px-3 py-2 rounded"
                  />
                </div>
              </div>
            ) : (
              // User has purchased a bot - Show referral link
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-lg p-3">
                  <label className="text-xs text-gray-400 mb-2 block">Your Referral Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={profile?.referralCode ? `${window.location.origin}/register?ref=${profile.referralCode}` : ''}
                      readOnly
                      className="flex-1 bg-black border border-gray-800 text-[#00ff00] font-mono text-sm px-3 py-2 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const referralUrl = `${window.location.origin}/register?ref=${profile?.referralCode || ''}`
                        navigator.clipboard.writeText(referralUrl)
                        success('Referral link copied to clipboard!')
                      }}
                      className="border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black px-3 py-2 rounded text-xs font-semibold transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <label className="text-xs text-gray-400 mb-2 block">Referred By</label>
                  <input
                    type="text"
                    value={profile?.referredBy || 'None'}
                    readOnly
                    className="w-full bg-black border border-gray-800 text-gray-400 text-sm px-3 py-2 rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
