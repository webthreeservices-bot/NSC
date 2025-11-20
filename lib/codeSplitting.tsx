/**
 * Code Splitting Utilities
 * Dynamic imports and lazy loading for better performance
 */

'use client'

import dynamic from 'next/dynamic'
import { ComponentType, Suspense } from 'react'

/**
 * Loading spinner component
 */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

/**
 * Loading skeleton component
 */
const LoadingSkeleton = ({ height = '200px' }: { height?: string }) => (
  <div className="animate-pulse bg-gray-200 rounded-lg" style={{ height }}></div>
)

/**
 * Lazy load component with custom loading
 */
export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent: ComponentType = LoadingSpinner
) {
  return dynamic(importFunc, {
    loading: () => <LoadingComponent />,
    ssr: false,
  })
}

/**
 * Lazy load with SSR support
 */
export function lazyLoadSSR<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent: ComponentType = LoadingSpinner
) {
  return dynamic(importFunc, {
    loading: () => <LoadingComponent />,
    ssr: true,
  })
}

/**
 * Preload a component
 */
export function preloadComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
) {
  importFunc()
}

/**
 * Lazy loaded dashboard components
 */
export const LazyComponents = {
  // Charts and heavy visualizations
  TransactionChart: lazyLoad(() => import('@/components/charts/TransactionChart'), LoadingSpinner),
  EarningsChart: lazyLoad(() => import('@/components/charts/EarningsChart'), LoadingSpinner),
  PerformanceChart: lazyLoad(() => import('@/components/charts/PerformanceChart'), LoadingSpinner),

  // Admin components
  AdminUserTable: lazyLoad(() => import('@/components/admin/UserTable'), LoadingSpinner),
  AdminAnalytics: lazyLoad(() => import('@/components/admin/Analytics'), LoadingSpinner),

  // Heavy modals and dialogs
  WithdrawModal: lazyLoad(() => import('@/components/modals/WithdrawModal'), LoadingSpinner),
  DepositModal: lazyLoad(() => import('@/components/modals/DepositModal'), LoadingSpinner),

  // Third-party integrations
  QRCodeGenerator: lazyLoad(() => import('@/components/QRCodeGenerator'), LoadingSpinner),
}

/**
 * Wrapper component for lazy loading with Suspense
 */
export function LazyWrapper({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return <Suspense fallback={fallback || <LoadingSpinner />}>{children}</Suspense>
}

/**
 * Route-based code splitting helper
 */
export const RouteComponents = {
  Dashboard: lazyLoadSSR(() => import('@/app/(dashboard)/dashboard/page')),
  Profile: lazyLoadSSR(() => import('@/app/(dashboard)/profile/page')),
  Transactions: lazyLoadSSR(() => import('@/app/(dashboard)/transactions/page')),
  Referrals: lazyLoadSSR(() => import('@/app/(dashboard)/referrals/page')),
}
