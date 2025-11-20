'use client'

import dynamic from 'next/dynamic'

const RequestWithdrawalPage = dynamic(() => import('./RequestWithdrawalPage'), {
  ssr: false,
  loading: () => (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
})

export default function Page() {
  return <RequestWithdrawalPage />
}
