'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import { earningsAPI } from '@/lib/api'
import { getTokenFromStorage } from '@/lib/auth'

// Define types for referral bonus data
interface ReferralBonus {
  id: string
  amount: number
  referredUser: string
  status: string
  createdAt: string
}

interface ReferralBonusStats {
  totalEarned: number
  pendingBonuses: number
  referralCount: number
  conversionRate: number
}

export default function ReferralBonusPage() {
  const [loading, setLoading] = useState(true)
  const [bonuses, setBonuses] = useState<ReferralBonus[]>([])
  const [stats, setStats] = useState<ReferralBonusStats>({
    totalEarned: 0,
    pendingBonuses: 0,
    referralCount: 0,
    conversionRate: 0
  })
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')

  // Fetch referral data on component mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const token = getTokenFromStorage()
        if (!token) {
          throw new Error('Not authenticated')
        }
        
        // Fetch referral code
        const referralData = await fetch('/api/user/referral-code', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json())
        
        if (referralData && referralData.referralCode) {
          setReferralCode(referralData.referralCode)
          setReferralLink(`${window.location.origin}/register?ref=${referralData.referralCode}`)
        }

        // Fetch referral stats from referrals/stats endpoint
        const statsResponse = await fetch('/api/referrals/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json())

        if (statsResponse && statsResponse.success) {
          setStats({
            totalEarned: statsResponse.totalEarnings || 0,
            pendingBonuses: statsResponse.pendingBonuses || 0,
            referralCount: statsResponse.directCount || 0,
            conversionRate: statsResponse.conversionRate || 0
          })
        }

        // Fetch referral bonuses from earnings history with DIRECT_REFERRAL type
        const bonusesResponse = await earningsAPI.getHistory({ type: 'DIRECT_REFERRAL' }, token)
        
        // Type assertion for the API response
        interface EarningsResponse {
          success: boolean;
          earnings: Array<{
            id: string;
            amount: string | number;
            description?: string;
            paidDate: string;
          }>;
        }
        
        const typedResponse = bonusesResponse as EarningsResponse;
        
        if (typedResponse && typedResponse.earnings) {
          setBonuses(typedResponse.earnings.map(earning => ({
            id: earning.id,
            amount: Number(earning.amount),
            referredUser: earning.description || 'Anonymous User',
            status: 'Completed',
            createdAt: earning.paidDate
          })))
        }
      } catch (error) {
        toast.error('Failed to load referral bonus data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Referral link copied to clipboard')
      },
      (err) => {
        }
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading referral data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Referral Bonuses</h1>

      {/* Referral Link Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link to earn 2% direct commission on referred packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-800 p-3 rounded-lg mb-4 flex items-center justify-between">
            <div className="text-sm overflow-hidden text-ellipsis">
              {referralLink}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(referralLink)}
              className="ml-2 flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-green-900/20 p-3 rounded-lg flex items-center justify-between">
            <div className="text-sm font-mono">
              Code: <span className="font-bold text-primary">{referralCode}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(referralCode)}
              className="ml-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earned</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalEarned)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.referralCount}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Bonuses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.pendingBonuses)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversion Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.conversionRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Referral Bonuses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referral Bonuses</CardTitle>
          <CardDescription>
            Your direct referral commission earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bonuses.length > 0 ? (
            <div className="space-y-4">
              {bonuses.map(bonus => (
                <div 
                  key={bonus.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {bonus.referredUser}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(new Date(bonus.createdAt))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      +{formatCurrency(bonus.amount)}
                    </div>
                    <div className="text-xs text-green-500">
                      {bonus.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No referral bonuses yet. Share your referral link to start earning!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
