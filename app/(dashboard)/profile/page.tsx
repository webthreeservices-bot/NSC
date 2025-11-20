'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Shield, Verified } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getTokenFromStorage } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/date-utils'

export default function ProfilePage() {
  const { success, error } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bep20Address: '',
    trc20Address: ''
  })

  useEffect(() => {
    const abortController = new AbortController()

    const fetchProfileData = async () => {
      try {
        const token = getTokenFromStorage()
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: abortController.signal
        })
        
        const data = await response.json()
        if (data?.success && data?.user) {
          setProfile(data.user)
          setFormData({
            fullName: data.user?.fullName || '',
            phone: data.user?.phone || '',
            bep20Address: data.user?.bep20Address || '',
            trc20Address: data.user?.trc20Address || ''
          })
        } else {
          console.error('Profile fetch failed:', data)
        }
      } catch (error: any) {
        // Don't log error if request was aborted
        if (error.name !== 'AbortError') {
          console.error('Error fetching profile:', error)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchProfileData()

    // Cleanup function
    return () => {
      abortController.abort()
    }
  }, [])

  const fetchProfile = async (abortSignal?: AbortSignal) => {
    try {
      const token = getTokenFromStorage()
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: abortSignal
      })
      
      const data = await response.json()
      if (data?.success && data?.user) {
        setProfile(data.user)
        setFormData({
          fullName: data.user?.fullName || '',
          phone: data.user?.phone || '',
          bep20Address: data.user?.bep20Address || '',
          trc20Address: data.user?.trc20Address || ''
        })
      } else {
        console.error('Profile fetch failed:', data)
      }
    } catch (error: any) {
      // Don't log error if request was aborted
      if (error.name !== 'AbortError') {
        console.error('Error fetching profile:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const abortController = new AbortController()

    try {
      const token = getTokenFromStorage()
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
        signal: abortController.signal
      })

      const data = await response.json()
      if (data?.success && data?.user) {
        setProfile(data.user)
        success('Profile updated successfully!')
      } else {
        // Show detailed error message
        const errorMsg = data?.message || data?.error || data?.details || 'Failed to update profile'
        error(errorMsg)
        console.error('Profile update error:', data)
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error updating profile:', err)
        error('Failed to update profile')
      }
    } finally {
      if (!abortController.signal.aborted) {
        setSaving(false)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-[#00ff00]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#00ff00] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {profile?.fullName || profile?.username || 'User'}
              </h3>
              <p className="text-gray-400 mb-4">{profile?.email}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Status:</span>
                  <span className={`flex items-center gap-1 ${profile?.isActive ? 'text-[#00ff00]' : 'text-red-400'}`}>
                    <Shield className="h-4 w-4" />
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email Verified:</span>
                  <span className={`flex items-center gap-1 ${profile?.isEmailVerified ? 'text-[#00ff00]' : 'text-yellow-400'}`}>
                    <Verified className="h-4 w-4" />
                    {profile?.isEmailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">KYC Status:</span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${profile?.kycStatus === 'APPROVED' ? 'bg-green-900 text-green-400' : 
                      profile?.kycStatus === 'REJECTED' ? 'bg-red-900 text-red-400' : 
                      'bg-yellow-900 text-yellow-400'}
                  `}>
                    {profile?.kycStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member Since:</span>
                  <span className="text-white">
                    {formatDate(profile?.createdAt, undefined, 'Unknown')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Update Profile Information</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="bg-black border-gray-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-black border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bep20Address" className="text-gray-300">BEP20 Wallet Address (BSC)</Label>
                <Input
                  id="bep20Address"
                  type="text"
                  placeholder="0x... (Your BSC wallet address)"
                  value={formData.bep20Address}
                  onChange={(e) => handleInputChange('bep20Address', e.target.value)}
                  className="bg-black border-gray-700 text-white font-mono text-sm"
                />
                <p className="text-xs text-gray-500">Used for BEP20 withdrawals</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trc20Address" className="text-gray-300">TRC20 Wallet Address (TRON)</Label>
                <Input
                  id="trc20Address"
                  type="text"
                  placeholder="T... (Your TRON wallet address)"
                  value={formData.trc20Address}
                  onChange={(e) => handleInputChange('trc20Address', e.target.value)}
                  className="bg-black border-gray-700 text-white font-mono text-sm"
                />
                <p className="text-xs text-gray-500">Used for TRC20 withdrawals</p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#00ff00] hover:bg-[#00cc00] text-black font-bold"
                >
                  {saving ? 'Saving...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}