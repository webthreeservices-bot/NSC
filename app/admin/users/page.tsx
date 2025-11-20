'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatDate, formatCurrency, getFromLocalStorage } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  totalInvested?: number;
  activePackages?: number;
  referralCode?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (signal?: AbortSignal) => {
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
        fetch('/api/admin/users', {
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
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      // Don't show error if request was aborted (component unmounted)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchUsers(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  const filteredUsers = (users || []).filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[#00ff00]" />
          <span className="ml-2 text-white">Loading users...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => fetchUsers()} variant="outline">
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
              <Users className="h-8 w-8 text-[#00ff00]" />
              User Management
            </h1>
            <p className="text-gray-400 mt-1">Manage and monitor all platform users</p>
          </div>
          <Button onClick={() => fetchUsers()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00ff00]">
                {(users || []).filter(u => u.isEmailVerified).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {(users || []).filter(u => u.isAdmin).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#00ff00]">
                {(users || []).filter(u => (u.activePackages || 0) > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by email, name, or referral code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Invested</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Packages</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{user.fullName || 'N/A'}</div>
                          <div className="text-sm text-gray-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.referralCode && (
                            <div className="text-xs text-gray-500">
                              Ref: {user.referralCode}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {user.isEmailVerified ? (
                            <Badge variant="default" className="bg-[#00ff00] text-black w-fit">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="w-fit">
                              Unverified
                            </Badge>
                          )}
                          {user.isAdmin && (
                            <Badge variant="destructive" className="w-fit">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-[#00ff00]" />
                          {formatCurrency(user.totalInvested || 0)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white">{user.activePackages || 0}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-400 text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-[#00ff00]">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No users found matching your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
