"use client"
import React, { useEffect, useState } from 'react'

export default function PendingReferralsPage() {
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchPending() {
    setLoading(true)
    const res = await fetch('/api/admin/referrals/pending')
    const json = await res.json()
    setPending(json.data || [])
    setLoading(false)
  }

  async function retry(earningId?: string, packageId?: string) {
    const body: any = {}
    if (earningId) body.earningId = earningId
    if (packageId) body.packageId = packageId
    const res = await fetch('/api/admin/referrals/retry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    if (json.success) {
      alert('Retry scheduled')
      fetchPending()
    } else {
      alert('Retry failed')
    }
  }

  useEffect(() => { fetchPending() }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Referral Earnings</h1>
      {loading && <div>Loading...</div>}
      {!loading && pending.length === 0 && <div>No pending items</div>}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th>id</th>
            <th>user</th>
            <th>amount</th>
            <th>level</th>
            <th>network</th>
            <th>Wallet</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {pending.map((p) => (
          <tr key={p.id} className="border-t">
            <td>{p.id}</td>
            <td>{p.email}</td>
            <td>{p.amount}</td>
            <td>{p.level}</td>
            <td>{p.network}</td>
            <td>{p.walletAddress}</td>
            <td>
              <button className="btn" onClick={() => retry(p.id)}>Retry</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
