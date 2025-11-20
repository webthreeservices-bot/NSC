'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Activity
} from 'lucide-react';
import { formatCurrency, getFromLocalStorage } from '@/lib/utils';

interface Statistics {
  totalUsers: number;
  activeUsers: number;
  totalPackages: number;
  activePackages: number;
  totalRevenue: number;
  totalWithdrawals: number;
  totalROIPaid: number;
  pendingWithdrawals: number;
  monthlyGrowth: {
    users: number;
    revenue: number;
    packages: number;
  };
  topPackageTypes: Array<{ type: string; count: number; revenue: number }>;
}

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const fetchStatistics = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const token = getFromLocalStorage('token');

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - server took too long to respond')), 30000);
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch('/api/admin/stats', {
          signal,
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        timeoutPromise
      ]) as Response;

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();

      // Transform the data to match our interface
      const statsData = data.statistics || data;
      setStats({
        totalUsers: Number(statsData.totalUsers) || 0,
        activeUsers: Number(statsData.activeUsers) || 0,
        totalPackages: Number(statsData.totalPackages) || 0,
        activePackages: Number(statsData.activePackages) || 0,
        totalRevenue: Number(statsData.totalRevenue) || 0,
        totalWithdrawals: Number(statsData.totalWithdrawals) || 0,
        totalROIPaid: Number(statsData.totalROIPaid) || 0,
        pendingWithdrawals: Number(statsData.pendingWithdrawals) || 0,
        monthlyGrowth: statsData.monthlyGrowth || {
          users: 0,
          revenue: 0,
          packages: 0
        },
        topPackageTypes: statsData.topPackageTypes || []
      });
    } catch (err) {
      // Don't show error if request was aborted (component unmounted)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchStatistics(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [timeRange]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[#00ff00]" />
          <span className="ml-2 text-white">Loading statistics...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => fetchStatistics()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const profitLoss = stats ? stats.totalRevenue - stats.totalWithdrawals - stats.totalROIPaid : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-[#00ff00]" />
              Platform Statistics
            </h1>
            <p className="text-gray-400 mt-1">Analytics and performance metrics</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 'bg-[#00ff00] text-black' : ''}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-[#00ff00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats?.totalRevenue || 0)}
              </div>
              <div className="flex items-center text-xs text-[#00ff00] mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats?.monthlyGrowth?.revenue?.toFixed(1) || 0}% this month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-[#00ff00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.totalUsers || 0}
              </div>
              <div className="flex items-center text-xs text-[#00ff00] mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats?.monthlyGrowth?.users?.toFixed(1) || 0}% this month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Packages</CardTitle>
              <Package className="h-4 w-4 text-[#00ff00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.activePackages || 0}
              </div>
              <div className="flex items-center text-xs text-[#00ff00] mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats?.monthlyGrowth?.packages?.toFixed(1) || 0}% this month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Net Profit</CardTitle>
              <Activity className="h-4 w-4 text-[#00ff00]" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-[#00ff00]' : 'text-red-500'}`}>
                {formatCurrency(profitLoss)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Revenue - Payouts
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00ff00]/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-[#00ff00]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Revenue</div>
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(stats?.totalRevenue || 0)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">From {stats?.totalPackages || 0} packages</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-black rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">ROI Paid</div>
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(stats?.totalROIPaid || 0)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">To active investors</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-black rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Withdrawals</div>
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(stats?.totalWithdrawals || 0)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-yellow-500">{stats?.pendingWithdrawals || 0} pending</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Performance */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Top Package Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topPackageTypes && stats.topPackageTypes.length > 0 ? (
                stats.topPackageTypes.map((pkg, index) => (
                  <div key={pkg.type} className="flex items-center justify-between p-4 bg-black rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-600">#{index + 1}</div>
                      <div>
                        <div className="font-medium text-white">{pkg.type}</div>
                        <div className="text-sm text-gray-400">{pkg.count} active packages</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#00ff00]">{formatCurrency(pkg.revenue)}</div>
                      <div className="text-sm text-gray-400">Total revenue</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">No package data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Active Users</div>
                <div className="text-3xl font-bold text-[#00ff00]">{stats?.activeUsers || 0}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {stats ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
              <div className="p-4 bg-black rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Inactive Users</div>
                <div className="text-3xl font-bold text-gray-500">
                  {stats ? stats.totalUsers - stats.activeUsers : 0}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {stats ? ((1 - stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
