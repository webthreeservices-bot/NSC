'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePackages } from '@/hooks/usePackages'
import { formatCurrency, formatDate } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

export default function PackagesPage() {
  const { packages, loading, fetchPackages } = usePackages()

  // No need for useEffect - the hook already fetches on mount

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'PENDING':
        return 'secondary'
      case 'EXPIRED':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">My Packages</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-[#00ff00] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading packages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Packages</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchPackages()}
            disabled={loading}
            className="active:scale-95 transition-transform"
            title="Refresh packages"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/packages/buy" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto active:scale-95 transition-transform">Buy New Package</Button>
          </Link>
        </div>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You don&apos;t have any packages yet</p>
              <Link href="/packages/buy">
                <Button>Buy Your First Package</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {packages.map((pkg: any) => (
            <Card key={pkg.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pkg.packageType}</CardTitle>
                    <CardDescription>
                      {formatCurrency(Number(pkg.amount))}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(pkg.status)}>
                    {pkg.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ROI Rate:</span>
                  <span className="font-medium">{Number(pkg.roiPercentage)}% monthly</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ROI Paid:</span>
                  <span className="font-medium">
                    {pkg.roiPaidCount || 0}/12 months
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Earned:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(Number(pkg.totalRoiPaid || 0))}
                  </span>
                </div>
                {pkg.investmentDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investment Date:</span>
                    <span>{formatDate(pkg.investmentDate)}</span>
                  </div>
                )}
                {pkg.status === 'PENDING' && pkg.createdAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(pkg.createdAt)}</span>
                  </div>
                )}
                {pkg.nextRoiDate && pkg.status === 'ACTIVE' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next ROI:</span>
                    <span>{formatDate(pkg.nextRoiDate)}</span>
                  </div>
                )}
                {pkg.expiryDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span>{formatDate(pkg.expiryDate)}</span>
                  </div>
                )}
                <Link href={`/packages/${pkg.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
