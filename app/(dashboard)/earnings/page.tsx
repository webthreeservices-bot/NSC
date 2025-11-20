'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEarnings } from '@/hooks/useEarnings'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function EarningsPage() {
  const { summary, history, loading, fetchSummary, fetchHistory } = useEarnings()

  useEffect(() => {
    fetchSummary()
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading earnings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Earnings</h1>
        <Link href="/withdrawals/request" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto active:scale-95 transition-transform">Request Withdrawal</Button>
        </Link>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs sm:text-sm">Total Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {formatCurrency(summary?.totalEarnings || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs sm:text-sm">ROI Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {formatCurrency(summary?.roiEarnings || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Referral Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.referralEarnings || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Level Income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.levelEarnings || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawable Balance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Withdrawable Balance</CardTitle>
          <CardDescription>
            Available for withdrawal after deducting previous withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600 mb-4">
            {formatCurrency(summary?.withdrawableBalance || 0)}
          </div>
          <Link href="/withdrawals/request">
            <Button>Withdraw Now</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>ROI Earnings</CardTitle>
            <CardDescription>Monthly returns from packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatCurrency(summary?.roiEarnings || 0)}
            </div>
            <Link href="/earnings/history?type=ROI">
              <Button variant="outline" size="sm">View History</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct Referrals</CardTitle>
            <CardDescription>2% from direct referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatCurrency(summary?.referralEarnings || 0)}
            </div>
            <Link href="/earnings/history?type=DIRECT_REFERRAL">
              <Button variant="outline" size="sm">View History</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Level Income</CardTitle>
            <CardDescription>6 levels (0.75% - 0.10%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatCurrency(summary?.levelEarnings || 0)}
            </div>
            <Link href="/earnings/history?type=LEVEL_INCOME">
              <Button variant="outline" size="sm">View History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
            <CardDescription>Latest earnings transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mobile-scroll">
              <div className="space-y-3">
                {history.slice(0, 10).map((earning: any) => (
                <div 
                  key={earning.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {earning.earningType === 'DIRECT_REFERRAL' && 'Direct Referral Bonus'}
                      {earning.earningType === 'LEVEL_INCOME' && `Level ${earning.level} Income`}
                      {earning.earningType === 'ROI' && 'ROI Payment'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(new Date(earning.paidDate))}
                      {earning.percentage && ` • ${Number(earning.percentage)}%`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      +{formatCurrency(Number(earning.amount))}
                    </div>
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
