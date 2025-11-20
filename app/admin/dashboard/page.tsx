'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Users,
  Package,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { getFromLocalStorage } from '@/lib/utils';
import { formatDateTime } from '@/lib/date-utils';
import { fetchWithTimeout } from '@/lib/interval-utils';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPackages: number;
  activePackages: number;
  totalRevenue: number;
  pendingPayments: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getFromLocalStorage('token');

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const response = await fetchWithTimeout('/api/admin/stats', {
        cache: 'no-store',
        credentials: 'include',
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      }, 30000);

      if (response.status === 401 || response.status === 403) {
        // Token expired or unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/admin/login';
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch admin statistics');
      }

      const data = await response.json();

      // Ensure we have valid data with proper structure
      if (data?.success && data?.statistics) {
        const statsData = data.statistics;
        setStats({
          totalUsers: Number(statsData.totalUsers) || 0,
          activeUsers: Number(statsData.activeUsers) || 0,
          totalPackages: Number(statsData.totalPackages) || 0,
          activePackages: Number(statsData.activePackages) || 0,
          totalRevenue: Number(statsData.totalRevenue) || 0,
          pendingPayments: Number(statsData.pendingPayments) || 0,
          totalWithdrawals: Number(statsData.totalWithdrawals) || 0,
          pendingWithdrawals: Number(statsData.pendingWithdrawals) || 0
        });
        setLastUpdated(new Date());
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      // Don't show error if request was aborted (component unmounted)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Auto-refresh every 60 seconds
    intervalIdRef.current = setInterval(fetchStats, 60000);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [fetchStats]);

  const handleManualRefresh = () => {
    fetchStats();
  };

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[#00ff00]" />
          <span className="ml-2 text-white">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error && !stats) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={handleManualRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const defaultStats: AdminStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalPackages: 0,
    activePackages: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0
  };

  const currentStats: AdminStats = {
    totalUsers: stats?.totalUsers ?? 0,
    activeUsers: stats?.activeUsers ?? 0,
    totalPackages: stats?.totalPackages ?? 0,
    activePackages: stats?.activePackages ?? 0,
    totalRevenue: stats?.totalRevenue ?? 0,
    pendingPayments: stats?.pendingPayments ?? 0,
    totalWithdrawals: stats?.totalWithdrawals ?? 0,
    pendingWithdrawals: stats?.pendingWithdrawals ?? 0
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="h-8 w-8 text-[#00ff00]" />
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Platform overview and statistics
              {lastUpdated && (
                <span className="ml-2">• Last updated: {formatDateTime(lastUpdated)} • Auto-refreshes every 60s</span>
              )}
            </p>
          </div>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Stats */}
          <Card className="bg-gray-900 border-gray-800 hover:border-[#00ff00]/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-[#00ff00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-400">
                {currentStats.activeUsers} active users
              </p>
            </CardContent>
          </Card>

          {/* Packages Stats */}
          <Card className="bg-gray-900 border-gray-800 hover:border-[#00ff00]/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Packages</CardTitle>
              <Package className="h-4 w-4 text-[#00ff00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentStats.activePackages.toLocaleString()}</div>
              <p className="text-xs text-gray-400">
                {currentStats.totalPackages} total packages
              </p>
            </CardContent>
          </Card>

          {/* Revenue Stats */}
          <Card className="bg-gray-900 border-gray-800 hover:border-[#00ff00]/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-[#00ff00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00ff00]">${currentStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-400">
                {currentStats.pendingPayments} pending payments
              </p>
            </CardContent>
          </Card>

          {/* Withdrawals Stats */}
          <Card className="bg-gray-900 border-gray-800 hover:border-[#00ff00]/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Withdrawals</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${currentStats.totalWithdrawals.toLocaleString()}</div>
              <p className="text-xs text-orange-400">
                {currentStats.pendingWithdrawals} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="w-full bg-[#00ff00] text-black hover:bg-[#00cc00]" onClick={() => window.location.href = '/admin/users'}>
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full bg-[#00ff00] text-black hover:bg-[#00cc00]" onClick={() => window.location.href = '/admin/packages'}>
                <Package className="h-4 w-4 mr-2" />
                Manage Packages
              </Button>
              <Button className="w-full bg-[#00ff00] text-black hover:bg-[#00cc00]" onClick={() => window.location.href = '/admin/withdrawals'}>
                <DollarSign className="h-4 w-4 mr-2" />
                Manage Withdrawals
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black rounded-lg">
                <span className="text-gray-300">Database Connection</span>
                <Badge className="bg-[#00ff00] text-black">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-black rounded-lg">
                <span className="text-gray-300">Payment Processing</span>
                <Badge className="bg-[#00ff00] text-black">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-black rounded-lg">
                <span className="text-gray-300">Bot Services</span>
                <Badge className="bg-[#00ff00] text-black">Running</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}