'use client';

import { useState } from 'react';
import { Shield, Lock, Key, Eye, EyeOff, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTokenFromStorage } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function SecurityPage() {
  const { success, error } = useToast()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getTokenFromStorage()
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      if (response.ok) {
        success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        error(data.message || 'Failed to change password');
      }
    } catch (err) {
      error('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      const token = getTokenFromStorage()
      const endpoint = twoFactorEnabled ? '/api/auth/disable-2fa' : '/api/auth/enable-2fa';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTwoFactorEnabled(!twoFactorEnabled);
        success(`Two-Factor Authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'} successfully!`);
      }
    } catch (err) {
      error('Failed to update 2FA settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#00ff00]" />
            Security Settings
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">Manage your account security and authentication</p>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00]/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ff00]/10 p-3 rounded-lg">
              <Lock className="h-5 w-5 text-[#00ff00]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Password Strength</p>
              <h3 className="text-lg font-bold text-white">Strong</h3>
            </div>
          </div>
        </div>

        <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00]/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ff00]/10 p-3 rounded-lg">
              <Smartphone className="h-5 w-5 text-[#00ff00]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Two-Factor Auth</p>
              <h3 className="text-lg font-bold text-white">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</h3>
            </div>
          </div>
        </div>

        <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00]/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ff00]/10 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5 text-[#00ff00]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Account Status</p>
              <h3 className="text-lg font-bold text-white">Verified</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#00ff00]/30 transition-all">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-[#00ff00]" />
          Change Password
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="currentPassword" className="text-gray-300 text-sm">Current Password</Label>
            <div className="relative mt-1">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-gray-300 text-sm">New Password</Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-gray-300 text-sm">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white mt-1"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-[#00ff00] hover:bg-[#00cc00] text-black font-semibold w-full sm:w-auto"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#00ff00]/30 transition-all">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-[#00ff00]" />
          Two-Factor Authentication (2FA)
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mb-4">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-12 h-6 rounded-full transition-all cursor-pointer ${twoFactorEnabled ? 'bg-[#00ff00]' : 'bg-gray-700'}`}
                 onClick={handleToggle2FA}>
              <div className={`w-5 h-5 rounded-full bg-white transition-all ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
            </div>
            <span className="text-white text-sm font-medium">
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <Button
            onClick={handleToggle2FA}
            disabled={loading}
            variant="outline"
            className="border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black"
          >
            {loading ? 'Processing...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#00ff00]/30 transition-all">
        <h2 className="text-lg font-bold text-white mb-4">Security Best Practices</h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-[#00ff00] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium text-sm">Use a Strong Password</h3>
              <p className="text-gray-400 text-xs">Use at least 12 characters with a mix of letters, numbers, and symbols</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-[#00ff00] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium text-sm">Enable Two-Factor Authentication</h3>
              <p className="text-gray-400 text-xs">Add an extra layer of security to prevent unauthorized access</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium text-sm">Never Share Your Credentials</h3>
              <p className="text-gray-400 text-xs">NSC Bot staff will never ask for your password or 2FA codes</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-[#00ff00] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium text-sm">Regularly Review Account Activity</h3>
              <p className="text-gray-400 text-xs">Check your transaction history and report any suspicious activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
