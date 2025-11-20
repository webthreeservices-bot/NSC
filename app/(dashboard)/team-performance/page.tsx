'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, DollarSign, Award, ArrowUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function TeamPerformancePage() {
  const [teamStats, setTeamStats] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found')
        setLoading(false)
        return
      }

      // Fetch referral stats with authorization
      const response = await fetch('/api/referrals/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Referral stats response:', data)

        // Map the response correctly to match the API structure
        setTeamStats({
          totalTeamSize: data.stats?.totalNetwork || 0,
          teamVolume: data.stats?.networkValue || 0,
          teamEarnings: data.stats?.totalReferralEarnings || 0,
          activeMembers: data.stats?.directReferrals || 0
        })
      } else {
        console.error('Failed to fetch stats:', response.status, await response.text())
      }

      // Fetch direct referrals with authorization
      const membersResponse = await fetch('/api/referrals/direct', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        console.log('Direct referrals response:', membersData)
        setTeamMembers(membersData.referrals || [])
      } else {
        console.error('Failed to fetch members:', membersResponse.status, await membersResponse.text())
      }
    } catch (error) {
      console.error('Error fetching team data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-[#00ff00]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Team Performance</h1>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Team Size</p>
              <p className="text-2xl font-bold text-white">{teamStats?.totalTeamSize}</p>
            </div>
            <Users className="h-8 w-8 text-[#00ff00]" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Team Volume</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(teamStats?.teamVolume)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-[#00ff00]" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Team Earnings</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(teamStats?.teamEarnings)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-[#00ff00]" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Members</p>
              <p className="text-2xl font-bold text-white">{teamStats?.activeMembers}</p>
            </div>
            <Award className="h-8 w-8 text-[#00ff00]" />
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Team Members</h3>
        
        <div className="overflow-x-auto mobile-scroll">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 text-gray-400 font-medium">Level</th>
                <th className="text-left py-3 text-gray-400 font-medium">Investment</th>
                <th className="text-left py-3 text-gray-400 font-medium">Earnings</th>
                <th className="text-left py-3 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No team members yet. Start referring to build your team!
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4 text-white font-medium">
                      {member.fullName || member.username || 'N/A'}
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 text-[#00ff00]">
                        <ArrowUp className="h-4 w-4" />
                        Level 1
                      </span>
                    </td>
                    <td className="py-4 text-white">{formatCurrency(member.totalInvested || 0)}</td>
                    <td className="py-4 text-[#00ff00] font-medium">
                      {formatCurrency(0)}
                    </td>
                    <td className="py-4">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${member.isActive
                          ? 'bg-green-900 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                        }
                      `}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Team Growth Chart</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-500">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  )
}