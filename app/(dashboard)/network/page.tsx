'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { referralAPI } from '@/lib/api'
import { getTokenFromStorage } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function NetworkPage() {
  const [stats, setStats] = useState<any>(null)
  const [directReferrals, setDirectReferrals] = useState<any>(null)
  const [levelBreakdown, setLevelBreakdown] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const token = getTokenFromStorage()
        if (!token) {
          console.error('No authentication token found')
          setLoading(false)
          return
        }

        const [statsRes, directRes, levelsRes] = await Promise.all([
          referralAPI.getStats(token),
          referralAPI.getDirect(token),
          referralAPI.getLevelBreakdown(token)
        ])

        console.log('Network stats:', statsRes)
        console.log('Direct referrals:', directRes)
        console.log('Level breakdown:', levelsRes)

        setStats(statsRes.stats || {})
        setDirectReferrals(directRes || {})
        setLevelBreakdown(levelsRes.levels || [])
      } catch (error) {
        console.error('Error fetching network data:', error)
        // Set empty defaults to show zero values instead of undefined
        setStats({})
        setDirectReferrals({})
        setLevelBreakdown([])
      } finally {
        setLoading(false)
      }
    }

    fetchNetworkData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading network...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Network</h1>

      {/* Network Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Direct Referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.directReferrals || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalNetwork || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All 6 levels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Network Value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.networkValue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Referral Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalReferralEarnings || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Level Breakdown</CardTitle>
          <CardDescription>
            Network statistics by level (1-6)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto mobile-scroll">
            <div className="space-y-3">
              {levelBreakdown.length === 0 ? (
                // Show all 6 levels with zero data if no breakdown available
                Array.from({ length: 6 }, (_, i) => i + 1).map((levelNum) => (
                  <div
                    key={levelNum}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">L{levelNum}</span>
                      </div>
                      <div>
                        <div className="font-medium">Level {levelNum}</div>
                        <div className="text-sm text-muted-foreground">
                          0 members • $0.00 invested
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">$0.00</div>
                      <div className="text-xs text-muted-foreground">earned</div>
                    </div>
                  </div>
                ))
              ) : (
                levelBreakdown.map((level) => (
                  <div
                    key={level.level}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">L{level.level}</span>
                      </div>
                      <div>
                        <div className="font-medium">Level {level.level}</div>
                        <div className="text-sm text-muted-foreground">
                          {level.count || 0} members • {formatCurrency(level.totalInvested || 0)} invested
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(level.totalEarned || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">earned</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Direct Referrals List */}
      {directReferrals && directReferrals.referrals && directReferrals.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Direct Referrals</CardTitle>
            <CardDescription>
              Users you directly referred ({directReferrals.totalCount} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mobile-scroll">
              <div className="space-y-3">
                {directReferrals.referrals.map((referral: any) => (
                <div 
                  key={referral.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{referral.fullName || referral.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {referral.email}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Joined {formatDate(new Date(referral.createdAt))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(referral.totalInvested)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {referral.activePackages} active packages
                    </div>
                    <Badge variant={referral.isActive ? 'default' : 'secondary'} className="mt-1">
                      {referral.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
