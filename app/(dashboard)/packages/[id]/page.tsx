'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { packageAPI } from '@/lib/api'
import { getTokenFromStorage } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PackageDetailsPage() {
  const params = useParams()
  const packageId = params.id as string
  
  const [pkg, setPkg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const token = getTokenFromStorage()
        if (!token) return
        
        const response: any = await packageAPI.getPackageById(packageId, token)
        setPkg(response.package)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPackage()
  }, [packageId])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading package details...</p>
        </div>
      </div>
    )
  }

  if (error || !pkg) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error || 'Package not found'}</p>
              <Link href="/packages">
                <Button>Back to Packages</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Package Details</h1>
        <Link href="/packages">
          <Button variant="outline">Back to Packages</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Package Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-bold">{pkg.packageType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold">{formatCurrency(Number(pkg.amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge>{pkg.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium">{pkg.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROI Rate:</span>
              <span className="font-medium">{Number(pkg.roiPercentage)}% monthly</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROI Paid:</span>
              <span className="font-bold">{pkg.roiPaidCount || 0}/12 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total ROI Earned:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(Number(pkg.totalRoiPaid || 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining Payments:</span>
              <span className="font-medium">{12 - (pkg.roiPaidCount || 0)} months</span>
            </div>
            {pkg.nextRoiDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next ROI Date:</span>
                <span className="font-medium">{formatDate(pkg.nextRoiDate)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Important Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pkg.investmentDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Investment Date:</span>
              <span>{formatDate(pkg.investmentDate)}</span>
            </div>
          )}
          {pkg.expiryDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expiry Date:</span>
              <span>{formatDate(pkg.expiryDate)}</span>
            </div>
          )}
          {pkg.lastRoiDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last ROI Payment:</span>
              <span>{formatDate(pkg.lastRoiDate)}</span>
            </div>
          )}
          {pkg.createdAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(pkg.createdAt)}</span>
            </div>
          )}
          {pkg.depositTxHash && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Hash:</span>
              <span className="font-mono text-sm truncate max-w-xs">
                {pkg.depositTxHash}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {pkg.roiPayments && pkg.roiPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ROI Payment History</CardTitle>
            <CardDescription>
              Monthly ROI payments received
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pkg.roiPayments.map((payment: any) => (
                <div 
                  key={payment.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">Month {payment.monthNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.paidDate ? formatDate(payment.paidDate) : 'Pending'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(Number(payment.amount || 0))}
                    </div>
                    <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
