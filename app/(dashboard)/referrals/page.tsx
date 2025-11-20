'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Users, UserPlus, TrendingUp, ChevronRight } from 'lucide-react'
import ReferralLinkGenerator from '@/components/referral-link-generator'
import { formatDate } from '@/lib/date-utils'

export default function ReferralsPage() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalReferrals: 0,
    directReferrals: 0,
    totalEarnings: 0
  })

  useEffect(() => {
    // Fetch referrals data
    const fetchReferrals = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/user/referrals')
        const data = await response.json()

        if (data.success) {
          setReferrals(data.referrals || [])
          setStats({
            totalReferrals: data.totalReferrals || 0,
            directReferrals: data.directReferrals || 0,
            totalEarnings: data.totalEarnings || 0
          })
        }
      } catch (error) {
        console.error('Error fetching referrals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferrals()
  }, [user])

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Referral Program</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00]/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ff00]/10 p-3 rounded-lg">
              <Users className="h-5 w-5 text-[#00ff00]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Referrals</p>
              <h3 className="text-xl font-bold text-white">{loading ? '...' : stats.totalReferrals}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00]/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ff00]/10 p-3 rounded-lg">
              <UserPlus className="h-5 w-5 text-[#00ff00]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Direct Referrals</p>
              <h3 className="text-xl font-bold text-white">{loading ? '...' : stats.directReferrals}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00]/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ff00]/10 p-3 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#00ff00]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <h3 className="text-xl font-bold text-white">{loading ? '...' : `$${stats.totalEarnings.toFixed(2)}`}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <ReferralLinkGenerator referralCode={user.referralCode || ''} />

          <div className="bg-black border border-gray-800 rounded-xl p-4 mt-4 hover:border-[#00ff00]/30 transition-all">
            <h3 className="text-base sm:text-lg font-semibold text-[#00ff00] mb-3">Referral Commission</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Direct Referral</span>
                <span className="text-white font-semibold text-sm">2.00%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Level 1</span>
                <span className="text-white font-semibold text-sm">0.75%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Level 2</span>
                <span className="text-white font-semibold text-sm">0.50%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Level 3</span>
                <span className="text-white font-semibold text-sm">0.25%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Level 4</span>
                <span className="text-white font-semibold text-sm">0.15%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 text-sm">Level 5</span>
                <span className="text-white font-semibold text-sm">0.10%</span>
              </div>
            </div>
          </div>
        </div>


        <div className="lg:col-span-2">
          <div className="bg-black border border-gray-800 rounded-xl overflow-hidden hover:border-[#00ff00]/30 transition-all">
            <div className="p-4 border-b border-gray-800 sticky-header">
              <h3 className="text-base sm:text-lg font-semibold text-white">Your Referrals</h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00ff00] border-t-transparent mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading referrals...</p>
              </div>
            ) : referrals.length > 0 ? (
              <div className="overflow-x-auto mobile-scroll">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs sm:text-sm">
                      <th className="p-3 sm:p-4">User</th>
                      <th className="p-3 sm:p-4">Date Joined</th>
                      <th className="p-3 sm:p-4">Level</th>
                      <th className="p-3 sm:p-4">Earnings</th>
                      <th className="p-3 sm:p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {referrals.map((referral: any) => (
                      <tr key={referral.id} className="hover:bg-gray-900/30 transition-colors">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-[#00ff00]/20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-[#00ff00] font-bold text-sm">{referral.fullName?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">{referral.fullName || 'User'}</p>
                              <p className="text-gray-400 text-xs truncate">{referral.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-gray-400 text-sm whitespace-nowrap">
                                                  <td className="py-3 px-4 text-sm text-gray-300">
                          {formatDate(referral.createdAt)}
                        </td>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="bg-[#00ff00]/10 text-[#00ff00] text-xs px-2 py-1 rounded-full whitespace-nowrap">
                            {referral.level === 0 ? 'Direct' : `Level ${referral.level}`}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-white font-medium text-sm whitespace-nowrap">
                          ${referral.earnings?.toFixed(2) || '0.00'}
                        </td>
                        <td className="p-3 sm:p-4">
                          <button className="text-[#00ff00] hover:text-[#00cc00] active:scale-95 transition-all p-1">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="bg-[#00ff00]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-[#00ff00]" />
                </div>
                <h4 className="text-white font-medium mb-1">No Referrals Yet</h4>
                <p className="text-gray-400 text-sm mb-4">Share your referral link to start earning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
