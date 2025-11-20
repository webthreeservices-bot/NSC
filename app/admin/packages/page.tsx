'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Package,
  Search,
  RefreshCw,
  DollarSign,
  Calendar,
  TrendingUp,
  User,
  CheckCircle,
  Loader2,
  Bot,
  X
} from 'lucide-react';
import { formatDate, formatCurrency, getFromLocalStorage } from '@/lib/utils';

interface PackageData {
  id: string;
  userId: string;
  userEmail?: string;
  packageType: string;
  amount: number;
  roiPercentage: number;
  status: string;
  investmentDate: string;
  expiryDate: string;
  totalRoiPaid: number;
  roiPaidCount: number;
  depositTxHash?: string;
  network?: string;
  createdAt: string;
}

interface BotData {
  id: string;
  userId: string;
  userEmail?: string;
  botType: string;
  activationFee: number;
  status: string;
  activationDate: string;
  expiryDate: string;
  paymentTxHash?: string;
  network?: string;
  createdAt: string;
}

export default function AdminPackagesPage() {
  const [activeTab, setActiveTab] = useState<'packages' | 'bots'>('packages');
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkApproving, setBulkApproving] = useState(false);

  const fetchPackages = async (signal?: AbortSignal) => {
    try {
      setError(null);

      const token = getFromLocalStorage('token');

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - server took too long to respond')), 30000);
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch('/api/admin/bot-packages', {
          signal,
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        timeoutPromise
      ]) as Response;

      if (response.status === 401 || response.status === 403) {
        // Token expired or unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/admin/admin-login';
        }
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }

      const data = await response.json();
      setPackages(data.packages || []);
    } catch (err) {
      // Don't show error if request was aborted (component unmounted)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching packages:', err);
    }
  };

  const fetchBots = async (signal?: AbortSignal) => {
    try {
      setError(null);

      const token = getFromLocalStorage('token');

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - server took too long to respond')), 30000);
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch('/api/admin/bots', {
          signal,
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        timeoutPromise
      ]) as Response;

      if (response.status === 401 || response.status === 403) {
        // Token expired or unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/admin/admin-login';
        }
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch bots');
      }

      const data = await response.json();
      setBots(data.bots || []);
    } catch (err) {
      // Don't show error if request was aborted (component unmounted)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching bots:', err);
    }
  };

  const fetchAll = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      await Promise.all([fetchPackages(signal), fetchBots(signal)]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchAll(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  const handleApprove = async (packageId: string) => {
    if (!confirm('Are you sure you want to approve this package? This will activate the package and process referral bonuses.')) {
      return;
    }

    setApprovingId(packageId);
    setError(null);

    try {
      const token = getFromLocalStorage('token');

      const response = await fetch(`/api/admin/packages/${packageId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/admin/admin-login';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve package');
      }

      // Update the package in the local state
      setPackages(prevPackages =>
        prevPackages.map(pkg =>
          pkg.id === packageId ? { ...pkg, status: 'ACTIVE' } : pkg
        )
      );

      alert('Package approved successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve package';
      setError(errorMessage);
      alert(errorMessage);
      console.error('Error approving package:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (packageId: string) => {
    if (!confirm('Are you sure you want to reject this package? This action cannot be undone.')) {
      return;
    }

    setRejectingId(packageId);
    setError(null);

    try {
      const token = getFromLocalStorage('token');

      const response = await fetch(`/api/admin/packages/${packageId}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/admin/admin-login';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject package');
      }

      // Update the package in the local state
      setPackages(prevPackages =>
        prevPackages.map(pkg =>
          pkg.id === packageId ? { ...pkg, status: 'REJECTED' } : pkg
        )
      );

      alert('Package rejected successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject package';
      setError(errorMessage);
      alert(errorMessage);
      console.error('Error rejecting package:', err);
    } finally {
      setRejectingId(null);
    }
  };

  const handleApproveBot = async (botId: string) => {
    if (!confirm('Are you sure you want to approve this bot activation? This will activate the bot.')) {
      return;
    }

    setApprovingId(botId);
    setError(null);

    try {
      const token = getFromLocalStorage('token');

      const response = await fetch(`/api/admin/bots/${botId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/admin/admin-login';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve bot');
      }

      // Update the bot in the local state
      setBots(prevBots =>
        prevBots.map(bot =>
          bot.id === botId ? { ...bot, status: 'ACTIVE' } : bot
        )
      );

      alert('Bot approved successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve bot';
      setError(errorMessage);
      alert(errorMessage);
      console.error('Error approving bot:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectBot = async (botId: string) => {
    if (!confirm('Are you sure you want to reject this bot activation? This action cannot be undone.')) {
      return;
    }

    setRejectingId(botId);
    setError(null);

    try {
      const token = getFromLocalStorage('token');

      const response = await fetch(`/api/admin/bots/${botId}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/admin/admin-login';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject bot');
      }

      // Update the bot in the local state
      setBots(prevBots =>
        prevBots.map(bot =>
          bot.id === botId ? { ...bot, status: 'REJECTED' } : bot
        )
      );

      alert('Bot rejected successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject bot';
      setError(errorMessage);
      alert(errorMessage);
      console.error('Error rejecting bot:', err);
    } finally {
      setRejectingId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one package to approve');
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedIds.length} package(s)? This will activate the packages and process referral bonuses.`)) return;

    try {
      setBulkApproving(true);
      const token = getFromLocalStorage('token');

      // Approve all selected packages
      const promises = selectedIds.map(id =>
        fetch(`/api/admin/packages/${id}/approve`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );

      const results = await Promise.allSettled(promises);

      // Count successes and failures
      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;

      if (failures > 0) {
        alert(`Approved ${successes} packages. ${failures} failed.`);
      } else {
        alert(`Successfully approved ${successes} packages!`);
      }

      // Clear selection and refresh
      setSelectedIds([]);
      fetchAll();
    } catch (error) {
      console.error('Error bulk approving:', error);
      alert('Failed to approve packages');
    } finally {
      setBulkApproving(false);
    }
  };

  const toggleSelectAll = () => {
    const pendingPackages = filteredPackages.filter(p => p.status === 'PENDING');
    if (selectedIds.length === pendingPackages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingPackages.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const filteredPackages = (packages || []).filter(pkg => {
    const matchesSearch =
      pkg.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.packageType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredBots = (bots || []).filter(bot => {
    const matchesSearch =
      bot.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.botType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || bot.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const packageStats = {
    total: (packages || []).length,
    active: (packages || []).filter(p => p.status === 'ACTIVE').length,
    pending: (packages || []).filter(p => p.status === 'PENDING').length,
    expired: (packages || []).filter(p => p.status === 'EXPIRED').length,
    totalValue: (packages || []).reduce((sum, p) => sum + Number(p.amount || 0), 0),
    totalROIPaid: (packages || []).reduce((sum, p) => sum + Number(p.totalRoiPaid || 0), 0)
  };

  const botStats = {
    total: (bots || []).length,
    active: (bots || []).filter(b => b.status === 'ACTIVE').length,
    pending: (bots || []).filter(b => b.status === 'PENDING').length,
    expired: (bots || []).filter(b => b.status === 'EXPIRED').length,
    totalValue: (bots || []).reduce((sum, b) => sum + Number(b.activationFee || 0), 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-[#00ff00] text-black';
      case 'PENDING': return 'bg-yellow-500 text-black';
      case 'EXPIRED': return 'bg-gray-600 text-white';
      case 'REJECTED': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[#00ff00]" />
          <span className="ml-2 text-white">Loading packages...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => fetchPackages()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-[#00ff00]" />
              Package Management
            </h1>
            <p className="text-gray-400 mt-1">Monitor all investment packages</p>
          </div>
          <Button onClick={() => fetchAll()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'packages'
                ? 'text-[#00ff00] border-b-2 border-[#00ff00]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Packages
          </button>
          <button
            onClick={() => setActiveTab('bots')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'bots'
                ? 'text-[#00ff00] border-b-2 border-[#00ff00]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="h-4 w-4 inline mr-2" />
            Bots
          </button>
        </div>

        {/* Stats */}
        {activeTab === 'packages' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">{packageStats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-[#00ff00]">{packageStats.active}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-yellow-500">{packageStats.pending}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">Expired</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-500">{packageStats.expired}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-[#00ff00]">
                  ${(packageStats.totalValue / 1000).toFixed(1)}k
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">ROI Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-500">
                  ${(packageStats.totalROIPaid / 1000).toFixed(1)}k
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white">{botStats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-[#00ff00]">{botStats.active}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-yellow-500">{botStats.pending}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-400">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-[#00ff00]">
                  ${(botStats.totalValue / 1000).toFixed(1)}k
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by user, package type, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2 flex-wrap overflow-x-auto">
                {['all', 'ACTIVE', 'PENDING', 'EXPIRED', 'REJECTED'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={`${filterStatus === status ? 'bg-[#00ff00] text-black' : ''} whitespace-nowrap`}
                  >
                    {status === 'all' ? 'All' : status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packages Table */}
        {activeTab === 'packages' ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Packages ({filteredPackages.length})</CardTitle>
              {selectedIds.length > 0 && (
                <Button
                  onClick={handleBulkApprove}
                  disabled={bulkApproving}
                  className="bg-[#00ff00] text-black hover:bg-[#00cc00]"
                >
                  {bulkApproving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Approving {selectedIds.length}...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Selected ({selectedIds.length})
                    </>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2 text-gray-400 font-medium w-12">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.length > 0 && selectedIds.length === filteredPackages.filter(p => p.status === 'PENDING').length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#00ff00] focus:ring-[#00ff00]"
                          />
                        </div>
                      </th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[150px]">User</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[120px]">Package</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[100px]">Amount</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[100px]">ROI</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[90px]">Status</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[140px]">Transaction Hash</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[120px]">Dates</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[180px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPackages.map((pkg) => (
                      <tr key={pkg.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-2">
                          {pkg.status === 'PENDING' ? (
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(pkg.id)}
                              onChange={() => toggleSelect(pkg.id)}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#00ff00] focus:ring-[#00ff00]"
                            />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-white text-sm flex items-center gap-1 max-w-[150px]">
                            <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate" title={pkg.userEmail || 'N/A'}>
                              {pkg.userEmail || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium text-white text-sm">{pkg.packageType}</div>
                          <div className="text-xs text-gray-400">
                            {pkg.roiPercentage}% monthly
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-white font-medium text-sm">
                            {formatCurrency(pkg.amount)}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-[#00ff00] font-medium text-sm">
                            {formatCurrency(pkg.totalRoiPaid || 0)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {pkg.roiPaidCount || 0}/12 months
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={getStatusColor(pkg.status)}>
                            {pkg.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          {pkg.depositTxHash ? (
                            <div className="space-y-1">
                              <a
                                href={
                                  pkg.network === 'BEP20'
                                    ? `https://bscscan.com/tx/${pkg.depositTxHash}`
                                    : `https://tronscan.org/#/transaction/${pkg.depositTxHash}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00ff00] hover:underline text-xs font-mono"
                                title={pkg.depositTxHash}
                              >
                                {pkg.depositTxHash.slice(0, 8)}...{pkg.depositTxHash.slice(-6)}
                              </a>
                              <div className="text-xs text-gray-500">{pkg.network || 'N/A'}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No hash</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">{formatDate(pkg.investmentDate)}</span>
                            </div>
                            <div className="text-xs">
                              Exp: {formatDate(pkg.expiryDate)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {pkg.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(pkg.id)}
                                disabled={approvingId === pkg.id || rejectingId === pkg.id}
                                className="bg-[#00ff00] text-black hover:bg-[#00cc00]"
                              >
                                {approvingId === pkg.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(pkg.id)}
                                disabled={approvingId === pkg.id || rejectingId === pkg.id}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                {rejectingId === pkg.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <Badge className={getStatusColor(pkg.status)}>
                              {pkg.status}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredPackages.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No packages found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Bots ({filteredBots.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[150px]">User</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[120px]">Bot</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[100px]">Amount</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[90px]">Status</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[140px]">Transaction Hash</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[80px]">Network</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[120px]">Dates</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium min-w-[180px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBots.map((bot) => (
                      <tr key={bot.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-2">
                          <div className="text-white text-sm flex items-center gap-1 max-w-[150px]">
                            <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate" title={bot.userEmail || 'N/A'}>
                              {bot.userEmail || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium text-white text-sm">{bot.botType}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-white font-medium text-sm">
                            {formatCurrency(bot.activationFee)}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={getStatusColor(bot.status)}>
                            {bot.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          {bot.paymentTxHash ? (
                            <div className="space-y-1">
                              <a
                                href={
                                  bot.network === 'BEP20'
                                    ? `https://bscscan.com/tx/${bot.paymentTxHash}`
                                    : `https://tronscan.org/#/transaction/${bot.paymentTxHash}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00ff00] hover:underline text-xs font-mono"
                                title={bot.paymentTxHash}
                              >
                                {bot.paymentTxHash.slice(0, 8)}...{bot.paymentTxHash.slice(-6)}
                              </a>
                              <div className="text-xs text-gray-500">{bot.network || 'N/A'}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No hash</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-xs text-gray-400">
                            {bot.network || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">{formatDate(bot.activationDate)}</span>
                            </div>
                            <div className="text-xs">
                              Exp: {formatDate(bot.expiryDate)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {bot.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveBot(bot.id)}
                                disabled={approvingId === bot.id || rejectingId === bot.id}
                                className="bg-[#00ff00] text-black hover:bg-[#00cc00]"
                              >
                                {approvingId === bot.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectBot(bot.id)}
                                disabled={approvingId === bot.id || rejectingId === bot.id}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                {rejectingId === bot.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <Badge className={getStatusColor(bot.status)}>
                              {bot.status}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredBots.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No bots found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
