/**
 * Admin Compliance Dashboard
 * Monitor legal compliance and cookie consent statistics
 */

'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { formatDate } from '@/lib/date-utils'
import { fetchWithTimeout } from '@/lib/interval-utils'

interface ComplianceStats {
  totalUsers: number
  cookieConsent: {
    all: number
    analytics: number
    marketing: number
    necessary: number
  }
  legalDocuments: {
    termsAccepted: number
    privacyAccepted: number
    lastUpdated: string
  }
}

export default function AdminCompliancePage() {
  const [stats, setStats] = useState<ComplianceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const abortController = new AbortController();
    fetchComplianceStats(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [])

  const fetchComplianceStats = async (signal?: AbortSignal) => {
    try {
      setLoading(true)

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - server took too long to respond')), 30000);
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch('/api/admin/compliance/stats', {
          signal,
          credentials: 'include'
        }),
        timeoutPromise
      ]) as Response;

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      // Don't log error if request was aborted (component unmounted)
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching compliance stats:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff00]"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load compliance data</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Compliance Dashboard</h1>
          <p className="text-gray-400 mt-2">Monitor legal compliance and cookie consent</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-900/30 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Terms Accepted</p>
                <p className="text-3xl font-bold text-[#00ff00] mt-1">
                  {calculatePercentage(stats.legalDocuments.termsAccepted, stats.totalUsers)}%
                </p>
              </div>
              <div className="bg-green-900/30 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-[#00ff00]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cookie Consent</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">
                  {calculatePercentage(stats.cookieConsent.all, stats.totalUsers)}%
                </p>
              </div>
              <div className="bg-purple-900/30 p-3 rounded-lg">
                <span className="text-3xl">🍪</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cookie Consent Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Cookie Consent Breakdown</h2>
          <div className="space-y-4">
            {/* Necessary Cookies */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 font-medium">Necessary Cookies (Required)</span>
                <span className="text-white font-bold">
                  {stats.cookieConsent.necessary} (100%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 font-medium">Analytics Cookies</span>
                <span className="text-white font-bold">
                  {stats.cookieConsent.analytics} (
                  {calculatePercentage(stats.cookieConsent.analytics, stats.totalUsers)}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-[#00ff00] h-3 rounded-full"
                  style={{
                    width: `${calculatePercentage(stats.cookieConsent.analytics, stats.totalUsers)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 font-medium">Marketing Cookies</span>
                <span className="text-white font-bold">
                  {stats.cookieConsent.marketing} (
                  {calculatePercentage(stats.cookieConsent.marketing, stats.totalUsers)}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full"
                  style={{
                    width: `${calculatePercentage(stats.cookieConsent.marketing, stats.totalUsers)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Documents */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Legal Documents</h2>
          <div className="space-y-4">
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Terms of Service</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Last Updated: {formatDate(stats.legalDocuments.lastUpdated)}
                  </p>
                  <p className="text-sm text-gray-400">Version: 1.0</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="/terms"
                    target="_blank"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Privacy Policy</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Last Updated: {formatDate(stats.legalDocuments.lastUpdated)}
                  </p>
                  <p className="text-sm text-gray-400">Version: 1.0</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="/privacy"
                    target="_blank"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Compliance Checklist */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">GDPR Compliance Checklist</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-[#00ff00]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-300">Terms of Service published</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-[#00ff00]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-300">Privacy Policy published</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-[#00ff00]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-300">Cookie consent implemented</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-[#00ff00]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-300">User data encryption enabled</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-[#00ff00]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-300">Right to data deletion available</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
