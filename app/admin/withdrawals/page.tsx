'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatCurrency, getFromLocalStorage } from '@/lib/utils';

interface Withdrawal {
  id: string;
  userId: string;
  userEmail?: string;
  amount: number;
  status: string;
  walletAddress: string;
  transactionHash?: string;
  requestedAt: string;
  processedAt?: string;
  rejectedReason?: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkApproving, setBulkApproving] = useState(false);

  const fetchWithdrawals = async (signal?: AbortSignal) => {
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
        fetch('/api/admin/withdrawals', {
          signal,
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        timeoutPromise
      ]) as Response;

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }

      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      // Don't show error if request was aborted (component unmounted)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;

    try {
      setProcessingId(id);
      const token = getFromLocalStorage('token');
      const response = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve withdrawal');
      }

      await fetchWithdrawals();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      setProcessingId(id);
      const token = getFromLocalStorage('token');
      const response = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject withdrawal');
      }

      await fetchWithdrawals();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one withdrawal to approve');
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedIds.length} withdrawal(s)?`)) return;

    try {
      setBulkApproving(true);
      const token = getFromLocalStorage('token');

      // Approve all selected withdrawals
      const promises = selectedIds.map(id =>
        fetch(`/api/admin/withdrawals/${id}/approve`, {
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
        alert(`Approved ${successes} withdrawals. ${failures} failed.`);
      } else {
        alert(`Successfully approved ${successes} withdrawals!`);
      }

      // Clear selection and refresh
      setSelectedIds([]);
      fetchWithdrawals();
    } catch (error) {
      console.error('Error bulk approving:', error);
      alert('Failed to approve withdrawals');
    } finally {
      setBulkApproving(false);
    }
  };

  const toggleSelectAll = () => {
    const pendingWithdrawals = filteredWithdrawals.filter(w => w.status === 'PENDING');
    if (selectedIds.length === pendingWithdrawals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingWithdrawals.map(w => w.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchWithdrawals(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  const filteredWithdrawals = (withdrawals || []).filter(w => {
    const matchesSearch =
      w.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.transactionHash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: (withdrawals || []).length,
    pending: (withdrawals || []).filter(w => w.status === 'PENDING').length,
    approved: (withdrawals || []).filter(w => w.status === 'APPROVED' || w.status === 'COMPLETED').length,
    rejected: (withdrawals || []).filter(w => w.status === 'REJECTED').length,
    totalAmount: (withdrawals || []).reduce((sum, w) => sum + Number(w.amount || 0), 0),
    pendingAmount: (withdrawals || [])
      .filter(w => w.status === 'PENDING')
      .reduce((sum, w) => sum + Number(w.amount || 0), 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 text-black';
      case 'APPROVED':
      case 'COMPLETED': return 'bg-[#00ff00] text-black';
      case 'REJECTED': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[#00ff00]" />
          <span className="ml-2 text-white">Loading withdrawals...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => fetchWithdrawals()} variant="outline">
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
              <DollarSign className="h-8 w-8 text-[#00ff00]" />
              Withdrawal Management
            </h1>
            <p className="text-gray-400 mt-1">Approve or reject withdrawal requests</p>
          </div>
          <Button onClick={() => fetchWithdrawals()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-yellow-500">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[#00ff00]">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-500">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">
                ${(stats.totalAmount / 1000).toFixed(1)}k
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-400">Pending $</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-yellow-500">
                ${(stats.pendingAmount / 1000).toFixed(1)}k
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by user, wallet address, or transaction hash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'all'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={filterStatus === status ? 'bg-[#00ff00] text-black' : ''}
                  >
                    {status === 'all' ? 'All' : status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawals Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Withdrawals ({filteredWithdrawals.length})</CardTitle>
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
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium w-12">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.length > 0 && selectedIds.length === filteredWithdrawals.filter(w => w.status === 'PENDING').length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#00ff00] focus:ring-[#00ff00]"
                        />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Wallet</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        {withdrawal.status === 'PENDING' ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(withdrawal.id)}
                            onChange={() => toggleSelect(withdrawal.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#00ff00] focus:ring-[#00ff00]"
                          />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white text-sm flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" />
                          {withdrawal.userEmail || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-bold text-lg">
                          {formatCurrency(withdrawal.amount)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-400 text-xs font-mono">
                          {withdrawal.walletAddress.slice(0, 10)}...
                          {withdrawal.walletAddress.slice(-8)}
                        </div>
                        {withdrawal.transactionHash && (
                          <div className="text-[#00ff00] text-xs font-mono mt-1">
                            TX: {withdrawal.transactionHash.slice(0, 10)}...
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                        {withdrawal.rejectedReason && (
                          <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {withdrawal.rejectedReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(withdrawal.requestedAt)}
                          </div>
                          {withdrawal.processedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Processed: {formatDate(withdrawal.processedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {withdrawal.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(withdrawal.id)}
                              disabled={processingId === withdrawal.id}
                              className="bg-[#00ff00] text-black hover:bg-[#00cc00]"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(withdrawal.id)}
                              disabled={processingId === withdrawal.id}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Badge className={getStatusColor(withdrawal.status)}>
                            {withdrawal.status}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredWithdrawals.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No withdrawals found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
