'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Percent, ArrowLeft, Save, AlertCircle, CheckCircle2, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface RoiSetting {
  id: string;
  packageAmount: number;
  roiPercentage: number;
  maxRoiPercentage: number;
  packageType: string;
  isActive: boolean;
}

export default function AdminRoiSettings() {
  const [settings, setSettings] = useState<RoiSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editedValues, setEditedValues] = useState<Record<number, number>>({});
  const { fetchWithAuth } = useAdminAuth();
  const router = useRouter();
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch ROI settings
  useEffect(() => {
    fetchRoiSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to clear message with timeout cleanup
  const clearMessageAfterDelay = () => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => setMessage(null), 3000);
  };

  const fetchRoiSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/admin/roi-settings');
      
      if (!data) {
        // fetchWithAuth returns null if redirect happened
        return;
      }

      setSettings(data.data || []);

      // Initialize edited values with current values
      const initialValues: Record<number, number> = {};
      data.data.forEach((setting: RoiSetting) => {
        initialValues[setting.packageAmount] = setting.roiPercentage;
      });
      setEditedValues(initialValues);
    } catch (error) {
      console.error('Error fetching ROI settings:', error);
      setMessage({ type: 'error', text: 'Failed to load ROI settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoiChange = (packageAmount: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEditedValues(prev => ({
        ...prev,
        [packageAmount]: numValue
      }));
    }
  };

  const handleSave = async (packageAmount: number) => {
    try {
      setSaving(true);
      const newRoi = editedValues[packageAmount];

      // Find the setting to check max
      const setting = settings.find(s => s.packageAmount === packageAmount);
      if (!setting) {
        throw new Error('Setting not found');
      }

      // Validate against max
      if (newRoi > setting.maxRoiPercentage) {
        setMessage({
          type: 'error',
          text: `ROI cannot exceed ${setting.maxRoiPercentage}% for $${packageAmount} package`
        });
        return;
      }

      if (newRoi < 0) {
        setMessage({
          type: 'error',
          text: 'ROI percentage cannot be negative'
        });
        return;
      }

      const data = await fetchWithAuth('/api/admin/roi-settings', {
        method: 'PUT',
        body: JSON.stringify({
          packageAmount,
          roiPercentage: newRoi
        })
      });
      
      if (!data) {
        return;
      }

      setMessage({ type: 'success', text: `Updated ROI for $${packageAmount} package successfully` });

      // Update local state
      setSettings(prev => prev.map(s =>
        s.packageAmount === packageAmount
          ? { ...s, roiPercentage: newRoi }
          : s
      ));

      // Clear message after 3 seconds
      clearMessageAfterDelay();
    } catch (error: any) {
      console.error('Error updating ROI setting:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update ROI setting' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      // Validate all values first
      for (const setting of settings) {
        const newRoi = editedValues[setting.packageAmount];
        if (newRoi > setting.maxRoiPercentage) {
          setMessage({
            type: 'error',
            text: `ROI for $${setting.packageAmount} cannot exceed ${setting.maxRoiPercentage}%`
          });
          return;
        }
        if (newRoi < 0) {
          setMessage({
            type: 'error',
            text: `ROI percentage cannot be negative`
          });
          return;
        }
      }

      // Prepare batch update
      const settingsToUpdate = settings.map(s => ({
        packageAmount: s.packageAmount,
        roiPercentage: editedValues[s.packageAmount]
      }));

      const data = await fetchWithAuth('/api/admin/roi-settings', {
        method: 'PATCH',
        body: JSON.stringify({ settings: settingsToUpdate })
      });

      if (!data) {
        return;
      }

      setMessage({ type: 'success', text: 'All ROI settings updated successfully' });

      // Refresh settings
      await fetchRoiSettings();

      // Clear message after 3 seconds
      clearMessageAfterDelay();
    } catch (error: any) {
      console.error('Error updating ROI settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update ROI settings' });
    } finally {
      setSaving(false);
    }
  };

  const getPackageTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'NEO': return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'NEURAL': return 'bg-purple-900/30 text-purple-400 border-purple-700';
      case 'ORACLE': return 'bg-amber-900/30 text-amber-400 border-amber-700';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ROI Settings</h1>
          <p className="text-muted-foreground">
            Configure monthly ROI distribution for all users
          </p>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`p-4 rounded-lg border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-900/20 border-green-700 text-green-400'
              : 'bg-red-900/20 border-red-700 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-yellow-400 mt-1" />
              <div>
                <h3 className="text-white font-medium mb-1">🌍 Global ROI Distribution Management</h3>
                <p className="text-sm text-gray-400 mb-2">
                  <strong className="text-yellow-500">⚠️ GLOBAL SETTING:</strong> Configure the actual monthly ROI percentage that <strong>ALL USERS</strong> will receive for their packages.
                </p>
                <p className="text-sm text-gray-400">
                  • Package limits (3%, 4%, 5%) are <strong>MAXIMUM</strong> values only<br/>
                  • When you set NEO to 1.5%, ALL users with NEO packages receive 1.5%<br/>
                  • Changes apply to ALL users immediately for next ROI payment<br/>
                  • Example: If you set 2% instead of 3%, all users get 2% regardless of when they purchased
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settings.map((setting) => {
              const currentValue = editedValues[setting.packageAmount] ?? setting.roiPercentage;
              const hasChanged = currentValue !== setting.roiPercentage;

              return (
                <Card key={setting.id} className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-white">
                        {formatCurrency(setting.packageAmount)}
                      </CardTitle>
                      <span className={`text-xs px-2 py-1 rounded border ${getPackageTypeBadgeColor(setting.packageType)}`}>
                        {setting.packageType}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ROI Input */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Current Global ROI (%) - Applies to ALL Users
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={setting.maxRoiPercentage}
                          value={currentValue}
                          onChange={(e) => handleRoiChange(setting.packageAmount, e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-yellow-500 mt-1">
                        ⚠️ All users will receive this percentage
                      </p>
                    </div>

                    {/* Max ROI Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Maximum Allowed:</span>
                      <span className="text-gray-300 font-medium">{setting.maxRoiPercentage}%</span>
                    </div>

                    {/* Monthly Calculation Preview */}
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-500 mb-1">Monthly ROI Amount</div>
                      <div className="text-lg font-bold text-green-400">
                        {formatCurrency((setting.packageAmount * currentValue) / 100)}
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleSave(setting.packageAmount)}
                      disabled={!hasChanged || saving}
                      className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        hasChanged
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Save className="h-4 w-4" />
                      {hasChanged ? 'Save Changes' : 'No Changes'}
                    </button>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Save All Button */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save All Changes
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
