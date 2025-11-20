'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWithdrawals } from '@/hooks/useWithdrawals'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function WithdrawalsPage() {
  const { withdrawals, eligibility, loading, fetchWithdrawals, checkEligibility } = useWithdrawals()

  useEffect(() => {
    fetchWithdrawals()
    checkEligibility()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'PENDING':
        return 'secondary'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading withdrawals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Withdrawals</h1>
        {eligibility?.eligible && (
          <Link href="/withdrawals/request" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto active:scale-95 transition-transform">Request Withdrawal</Button>
          </Link>
        )}
      </div>

      {/* Eligibility Card */}
      {eligibility && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Withdrawal Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            {eligibility.eligible ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">✓ You are eligible to withdraw</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(eligibility.availableBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Capital</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(eligibility.availableCapital)}
                    </p>
                  </div>
                </div>
                <Link href="/withdrawals/request">
                  <Button className="w-full">Request Withdrawal</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-800 font-medium">⚠️ {eligibility.reason}</p>
                  {eligibility.nextWithdrawalDate && (
                    <p className="text-sm text-yellow-700 mt-2">
                      Next withdrawal available: {formatDate(new Date(eligibility.nextWithdrawalDate))}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(eligibility.availableBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Minimum Required</p>
                    <p className="text-xl font-bold">$20 USDT</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Your past withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals && withdrawals.length > 0 ? (
            <div className="overflow-x-auto mobile-scroll">
              <div className="space-y-4">
                {withdrawals.map((withdrawal: any) => (
                <div 
                  key={withdrawal.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {withdrawal.withdrawalType.replace('_', ' ')}
                      </span>
                      <Badge variant={getStatusColor(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(new Date(withdrawal.requestDate))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {withdrawal.network} • {withdrawal.walletAddress.substring(0, 10)}...
                    </div>
                    {withdrawal.rejectionReason && (
                      <div className="text-sm text-red-600 mt-1">
                        Reason: {withdrawal.rejectionReason}
                      </div>
                    )}
                    {withdrawal.txHash && (
                      <div className="text-sm text-green-600 mt-1 font-mono">
                        TX: {withdrawal.txHash.substring(0, 20)}...
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(withdrawal.amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Fee: {formatCurrency(withdrawal.fee)}
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      Net: {formatCurrency(withdrawal.netAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No withdrawal history yet</p>
              {eligibility?.eligible && (
                <Link href="/withdrawals/request">
                  <Button>Make Your First Withdrawal</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
